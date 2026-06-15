import pool from "../db.js";
import {
  generateMonthlyInsight,
  generateBudgetAlert,
  generateSavingsTips,
} from "../utils/gemini.js";
import { askAI } from "../utils/grokChat.js";

/* ─── helpers ─── */

const getUserCurrency = async (userId) => {
  const result = await pool.query("SELECT currency FROM users WHERE id = $1", [
    userId,
  ]);
  return result.rows[0]?.currency || "INR";
};

const deriveRecommendationSavings = (content, expenseBreakdown) => {
  const categoryAmounts = new Map(
    (expenseBreakdown || []).map((b) => [
      String(b.category || "")
        .trim()
        .toLowerCase(),
      Number(b.amount || 0),
    ]),
  );
  const remainingByCategory = new Map(categoryAmounts);

  const recommendations = Array.isArray(content?.recommendations)
    ? content.recommendations.map((r) => {
        const category = String(r.category || "").trim();
        const categoryKey = category.toLowerCase();
        const remainingCategoryAmount =
          remainingByCategory.get(categoryKey) || 0;
        const rawSavings = Number(r.estimatedSavings);
        const estimatedSavings =
          remainingCategoryAmount > 0 &&
          Number.isFinite(rawSavings) &&
          rawSavings > 0
            ? Math.min(
                Math.round(rawSavings),
                Math.floor(remainingCategoryAmount),
              )
            : 0;

        remainingByCategory.set(
          categoryKey,
          Math.max(0, remainingCategoryAmount - estimatedSavings),
        );

        return { ...r, estimatedSavings };
      })
    : [];

  const estimatedAdditionalSavings = recommendations.reduce(
    (sum, r) => sum + r.estimatedSavings,
    0,
  );

  const normalized = { ...content, recommendations };
  delete normalized.estimatedMonthlySavings;

  if (estimatedAdditionalSavings > 0) {
    normalized.estimatedAdditionalSavings = estimatedAdditionalSavings;
  } else {
    delete normalized.estimatedAdditionalSavings;
  }

  return normalized;
};

const periodDates = () => {
  const now = new Date();
  const periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const periodEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return { periodStart, periodEnd };
};

/* ─── builders ─── */

const buildMonthlyInsight = async (userId) => {
  const data = await pool.query(
    `
    WITH current_month AS (
      SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
      FROM transactions
      WHERE user_id = $1
        AND transaction_date >= date_trunc('month', CURRENT_DATE)
    ),
    breakdown AS (
      SELECT
        c.name AS category,
        SUM(t.amount) AS amount
      FROM transactions t
      JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
        AND t.type = 'expense'
        AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
      GROUP BY c.name
      ORDER BY amount DESC
    ),
    trend AS (
      SELECT
        to_char(date_trunc('month', transaction_date), 'YYYY-MM') AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses
      FROM transactions
      WHERE user_id = $1
        AND transaction_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '3 months'
        AND transaction_date < date_trunc('month', CURRENT_DATE)
      GROUP BY 1
      ORDER BY 1
    )
    SELECT
      (SELECT income FROM current_month) AS income,
      (SELECT expense FROM current_month) AS expense,
      (SELECT json_agg(breakdown) FROM breakdown) AS breakdown,
      (SELECT json_agg(trend) FROM trend) AS trend
    `,
    [userId],
  );

  const row = data.rows[0];
  const totalIncome = parseFloat(row.income || 0);
  const totalExpenses = parseFloat(row.expense || 0);
  const savingsRate =
    totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  const currency = await getUserCurrency(userId);
  const expenseBreakdown = (row.breakdown || []).map((b) => ({
    category: b.category,
    amount: parseFloat(b.amount || 0),
  }));

  const content = await generateMonthlyInsight({
    totalIncome,
    totalExpenses,
    savingsRate,
    expenseBreakdown,
    previousMonths: (row.trend || []).map((t) => ({
      month: t.month,
      income: parseFloat(t.income || 0),
      expenses: parseFloat(t.expenses || 0),
    })),
    currency,
  });

  return {
    content: deriveRecommendationSavings(content, expenseBreakdown),
    ...periodDates(),
  };
};

const buildBudgetAlert = async (userId, categoryId) => {
  if (!categoryId) {
    const err = new Error("categoryId is required for budget_alert");
    err.status = 400;
    throw err;
  }

  const budgetRow = await pool.query(
    `
    SELECT
      b.*,
      c.name AS category_name,
      COALESCE(
        (
          SELECT SUM(amount)
          FROM transactions
          WHERE user_id = b.user_id
            AND category_id = b.category_id
            AND type = 'expense'
            AND transaction_date >= date_trunc('month', CURRENT_DATE)
        ),
        0
      ) AS spent
    FROM budgets b
    JOIN categories c ON c.id = b.category_id
    WHERE b.user_id = $1 AND b.category_id = $2
    `,
    [userId, categoryId],
  );

  if (budgetRow.rows.length === 0) {
    const err = new Error("Budget not found for category");
    err.status = 404;
    throw err;
  }

  const b = budgetRow.rows[0];
  const now = new Date();
  const daysIntoPeriod = now.getDate();
  const totalPeriodDays = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  const currency = await getUserCurrency(userId);

  const content = await generateBudgetAlert({
    categoryName: b.category_name,
    budgetAmount: parseFloat(b.amount),
    spentAmount: parseFloat(b.spent),
    daysIntoPeriod,
    totalPeriodDays,
    currency,
  });

  return { content, ...periodDates() };
};

const buildSavingsTips = async (userId) => {
  const data = await pool.query(
    `
    SELECT
      c.name AS category,
      SUM(t.amount) AS amount,
      COUNT(*) AS transaction_count
    FROM transactions t
    JOIN categories c ON c.id = t.category_id
    WHERE t.user_id = $1
      AND t.type = 'expense'
      AND t.transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY c.name
    ORDER BY amount DESC
    LIMIT 5
    `,
    [userId],
  );

  const incomeData = await pool.query(
    `
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM transactions
    WHERE user_id = $1
      AND type = 'income'
      AND transaction_date >= CURRENT_DATE - INTERVAL '30 days'
    `,
    [userId],
  );

  const currency = await getUserCurrency(userId);

  const content = await generateSavingsTips({
    topCategories: data.rows.map((r) => ({
      category: r.category,
      amount: parseFloat(r.amount || 0),
      transactionCount: parseInt(r.transaction_count, 10),
    })),
    monthlyIncome: parseFloat(incomeData.rows[0]?.total || 0),
    currency,
  });

  return { content, ...periodDates() };
};

/* ─── exports ─── */

export const getInsights = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM ai_insights WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [req.userId],
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GetInsights error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const generateInsight = async (req, res) => {
  const { type, categoryId } = req.body;

  if (!type) {
    return res.status(400).json({ message: "Insight type is required" });
  }

  try {
    let result;

    if (type === "monthly_summary") {
      result = await buildMonthlyInsight(req.userId);
    } else if (type === "savings_tips") {
      result = await buildSavingsTips(req.userId);
    } else if (type === "budget_alert") {
      result = await buildBudgetAlert(req.userId, categoryId);
    } else {
      return res.status(400).json({ message: "Unknown insight type" });
    }

    const inserted = await pool.query(
      `INSERT INTO ai_insights (user_id, insight_type, period_start, period_end, content_json)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.userId, type, result.periodStart, result.periodEnd, result.content],
    );

    res.status(201).json(inserted.rows[0]);
  } catch (error) {
    console.error("GenerateInsight error:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Server error" });
  }
};

export const chat = async (req, res) => {
  try {
    const { messages, system } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    const reply = await askAI(messages, system);
    res.json({ reply });
  } catch (err) {
    console.error("Groq Chat Error:", err);
    res.status(500).json({ error: err?.message || "AI chat failed" });
  }
};
