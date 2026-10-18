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
        phone: user.phone,
        is_admin: Number(user.is_admin) === 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id -> user profile (no password hash) + their registrations.
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const [users] = await db.query(
      'SELECT user_id, email, full_name, phone, is_admin, created_at FROM users WHERE user_id = ?',
      [id]
    );
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [regs] = await db.query(`
      SELECT r.registration_id, r.tickets, r.registration_date,
             e.event_id, e.event_name, e.event_date, e.location, e.image_url,
             c.category_name
      FROM registrations r
      JOIN events e ON r.event_id = e.event_id
      JOIN categories c ON e.category_id = c.category_id
      WHERE r.user_id = ?
      ORDER BY r.registration_date DESC
    `, [id]);

    res.json({ success: true, data: { user: users[0], registrations: regs } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id -> update profile (full_name, phone, optional new password).
// Email is intentionally immutable (the login key).
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const [users] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { full_name, phone, password } = req.body;
    if (!full_name || !String(full_name).trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    const updates = ['full_name = ?', 'phone = ?'];
    const params = [String(full_name).trim(), phone ? String(phone).trim() : null];

    if (password) {
      if (String(password).length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }
      const hash = await bcrypt.hash(password, 10);
      updates.push('password_hash = ?');
      params.push(hash);
    }

    params.push(id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params);

    const [updated] = await db.query(
      'SELECT user_id, email, full_name, phone, is_admin, created_at FROM users WHERE user_id = ?',
      [id]
    );

    res.json({ success: true, data: updated[0], message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
