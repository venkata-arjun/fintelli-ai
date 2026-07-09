import pool from "../db.js";

// GET /api/accounts
export const getAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
          a.id,
          a.user_id,
          a.name,
          a.type,
          a.opening_balance,
          a.created_at,

          a.opening_balance +
          COALESCE(
            SUM(
              CASE
                WHEN t.type = 'income' THEN t.amount
                WHEN t.type = 'expense' THEN -t.amount
              END
            ),
            0
          ) AS current_balance

       FROM accounts a

       LEFT JOIN transactions t
       ON a.id = t.account_id

       WHERE a.user_id = $1

       GROUP BY
          a.id,
          a.user_id,
          a.name,
          a.type,
          a.opening_balance,
          a.created_at

       ORDER BY a.name`,
      [req.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GetAccounts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/accounts
export const createAccount = async (req, res) => {
  try {
    const { name, type, openingBalance = 0 } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        message: "Name and type are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO accounts
        (user_id, name, type, opening_balance)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.userId, name.trim(), type, openingBalance],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CreateAccount error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/accounts/:id
export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, openingBalance } = req.body;

    const result = await pool.query(
      `UPDATE accounts
       SET
          name = COALESCE($1, name),
          type = COALESCE($2, type),
          opening_balance = COALESCE($3, opening_balance)
       WHERE id = $4
       AND user_id = $5
       RETURNING *`,
      [name, type, openingBalance, id, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UpdateAccount error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/accounts/:id
export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account has transactions
    const transactionCheck = await pool.query(
      `SELECT COUNT(*) AS count
       FROM transactions
       WHERE account_id = $1`,
      [id],
    );

    if (Number(transactionCheck.rows[0].count) > 0) {
      return res.status(400).json({
        message: "Cannot delete an account that has transactions.",
      });
    }

    const result = await pool.query(
      `DELETE FROM accounts
       WHERE id = $1
       AND user_id = $2
       RETURNING id`,
      [id, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    res.json({
      message: "Account deleted",
    });
  } catch (error) {
    console.error("DeleteAccount error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
