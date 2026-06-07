import pool from "../db.js";

const pctChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

export const getSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        COALESCE(
          SUM(amount) FILTER (
            WHERE type = 'income'
            AND date_trunc('month', transaction_date) =
                date_trunc('month', CURRENT_DATE)
          ), 0
        ) AS income_this_month,

        COALESCE(
          SUM(amount) FILTER (
            WHERE type = 'expense'
            AND date_trunc('month', transaction_date) =
                date_trunc('month', CURRENT_DATE)
          ), 0
        ) AS expense_this_month,

        COALESCE(
          SUM(amount) FILTER (
            WHERE type = 'income'
            AND date_trunc('month', transaction_date) =
                date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
          ), 0
        ) AS income_last_month,

        COALESCE(
          SUM(amount) FILTER (
            WHERE type = 'expense'
            AND date_trunc('month', transaction_date) =
                date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
          ), 0
        ) AS expense_last_month

      FROM transactions
      WHERE user_id = $1;
      `,
      [req.userId],
    );

    const row = result.rows[0];

    const incomeThisMonth = Number(row.income_this_month || 0);
    const expenseThisMonth = Number(row.expense_this_month || 0);
    const incomeLastMonth = Number(row.income_last_month || 0);
    const expenseLastMonth = Number(row.expense_last_month || 0);

    const balance = incomeThisMonth - expenseThisMonth;

    const savingsRate =
      incomeThisMonth > 0
        ? Number(((balance / incomeThisMonth) * 100).toFixed(2))
        : 0;

    res.json({
      incomeThisMonth,
      expenseThisMonth,
      balance,
      savingsRate,
      incomeDelta: pctChange(incomeThisMonth, incomeLastMonth),
      expenseDelta: pctChange(expenseThisMonth, expenseLastMonth),
    });
  } catch (error) {
    console.error("GetSummary error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getCategoryBreakdown = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        COALESCE(SUM(t.amount), 0) AS total,
        COUNT(t.id) AS transaction_count
      FROM transactions t
      JOIN categories c
        ON c.id = t.category_id
      WHERE t.user_id = $1
        AND t.type = 'expense'
        AND date_trunc('month', t.transaction_date) =
            date_trunc('month', CURRENT_DATE)
      GROUP BY c.id, c.name, c.icon, c.color
      ORDER BY total DESC;
      `,
      [req.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GetCategoryBreakdown error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getMonthlyTrend = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        to_char(date_trunc('month', transaction_date), 'YYYY-MM') AS month,
        COALESCE(
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END),
          0
        ) AS income,
        COALESCE(
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END),
          0
        ) AS expense
      FROM transactions
      WHERE user_id = $1
        AND transaction_date >=
            date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
      GROUP BY 1
      ORDER BY 1;
      `,
      [req.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GetMonthlyTrend error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
