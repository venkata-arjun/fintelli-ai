import bcrypt from "bcryptjs";
import pool from "../db.js";
import { defaultCategories } from "../utils/defaultCategories.js";

const DEMO_USER = {
  name: "Alex",
  email: "alex@timetoprogram.com",
  password: "Test@1234",
  currency: "USD",
};

const BUDGETS = [
  { name: "Food & Dining", amount: 600 },
  { name: "Groceries", amount: 500 },
  { name: "Entertainment", amount: 120 },
  { name: "Transportation", amount: 350 },
  { name: "Shopping", amount: 200 },
];

const generateTransactions = (catMap) => {
  const txns = [];

  const today = new Date();

  const add = (
    categoryName,
    amount,
    type,
    description,
    date = today.toISOString().split("T")[0],
  ) => {
    if (!catMap[categoryName]) return;

    txns.push({
      categoryId: catMap[categoryName],
      amount,
      type,
      description,
      date,
    });
  };

  add("Salary", 3000, "income", "Monthly Salary");
  add("Food & Dining", 25, "expense", "Lunch");
  add("Groceries", 90, "expense", "Weekly groceries");
  add("Transportation", 35, "expense", "Fuel");
  add("Entertainment", 15, "expense", "Netflix");
  add("Shopping", 60, "expense", "Amazon order");

  return txns;
};

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existing = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [DEMO_USER.email],
    );

    if (existing.rows.length > 0) {
      await client.query("DELETE FROM users WHERE email = $1", [
        DEMO_USER.email,
      ]);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(DEMO_USER.password, salt);

    const userResult = await client.query(
      `
      INSERT INTO users(name,email,password_hash,currency)
      VALUES($1,$2,$3,$4)
      RETURNING id
      `,
      [DEMO_USER.name, DEMO_USER.email, passwordHash, DEMO_USER.currency],
    );

    const userId = userResult.rows[0].id;

    for (const cat of defaultCategories) {
      await client.query(
        `
        INSERT INTO categories
        (user_id,name,type,icon,color,is_default)
        VALUES($1,$2,$3,$4,$5,true)
        `,
        [userId, cat.name, cat.type, cat.icon, cat.color],
      );
    }

    const categoryResult = await client.query(
      `
      SELECT id,name
      FROM categories
      WHERE user_id=$1
      `,
      [userId],
    );

    const catMap = {};

    categoryResult.rows.forEach((c) => {
      catMap[c.name] = c.id;
    });

    const transactions = generateTransactions(catMap);

    for (const t of transactions) {
      await client.query(
        `
        INSERT INTO transactions
        (user_id,category_id,amount,type,description,transaction_date)
        VALUES($1,$2,$3,$4,$5,$6)
        `,
        [userId, t.categoryId, t.amount, t.type, t.description, t.date],
      );
    }

    const monthStart =
      new Date().toISOString().split("T")[0].substring(0, 8) + "01";

    for (const budget of BUDGETS) {
      if (!catMap[budget.name]) continue;

      await client.query(
        `
        INSERT INTO budgets
        (user_id,category_id,amount,period,start_date)
        VALUES($1,$2,$3,'monthly',$4)
        `,
        [userId, catMap[budget.name], budget.amount, monthStart],
      );
    }

    await client.query("COMMIT");

    console.log("Demo data seeded successfully");
    console.log("Email:", DEMO_USER.email);
    console.log("Password:", DEMO_USER.password);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
