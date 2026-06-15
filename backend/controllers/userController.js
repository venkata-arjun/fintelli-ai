import bcrypt from "bcryptjs";
import pool from "../db.js";

// GET /api/user/profile
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, location, currency, created_at
       FROM users
       WHERE id = $1`,
      [req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GetProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/user/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }

    const result = await pool.query(
      `UPDATE users
       SET name     = $1,
           phone    = $2,
           location = $3
       WHERE id = $4
       RETURNING id, name, email, phone, location, currency`,
      [name.trim(), phone || null, location || null, req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/user/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both passwords are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash,
    );

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, req.userId],
    );

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("ChangePassword error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
