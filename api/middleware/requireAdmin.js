// Shared middleware: only allow administrators to perform write operations.
// The client passes the logged-in admin's user_id via the X-Admin-User header.
const db = require('../event_db');

async function requireAdmin(req, res, next) {
  try {
    const userId = req.get('x-admin-user');
    if (!userId || !/^\d+$/.test(userId)) {
      return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }
    const [rows] = await db.query('SELECT is_admin FROM users WHERE user_id = ?', [userId]);
    if (rows.length === 0 || Number(rows[0].is_admin) !== 1) {
      return res.status(403).json({ success: false, message: 'Administrator access only' });
    }
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = requireAdmin;
