const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../event_db');

// POST /api/users/register  -> create a user account.
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, phone } = req.body;

    const required = ['email', 'password', 'full_name'];
    const missing = required.filter(k => !req.body[k]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, full_name, phone) VALUES (?, ?, ?, ?)',
      [email.trim(), hash, full_name.trim(), phone || null]
    );

    res.status(201).json({
      success: true,
      data: { user_id: result.insertId, email: email.trim(), full_name: full_name.trim() },
      message: 'Account created'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/login  -> verify credentials and return the user.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({
      success: true,
      data: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
