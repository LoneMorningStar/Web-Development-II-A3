const express = require('express');
const router = express.Router();
const db = require('../event_db');

// Columns used by the event detail / admin queries.
const EVENT_SELECT = `
  SELECT e.event_id, e.event_name, e.description, e.event_date, e.location,
         e.ticket_price, e.goal_amount, e.raised_amount, e.image_url, e.is_suspended,
         e.org_id, e.category_id,
         c.category_name, o.org_name, o.mission, o.contact_email, o.contact_phone, o.website
`;

// GET /api/events
// Public: upcoming, non-suspended events only.
// Admin : `?all=true` returns every event regardless of status.
router.get('/', async (req, res) => {
  try {
    const all = req.query.all === 'true' || req.query.all === '1';

    let sql = `
      SELECT e.event_id, e.event_name, e.event_date, e.location,
             e.ticket_price, e.goal_amount, e.raised_amount, e.image_url,
             e.is_suspended, c.category_name, o.org_name,
             (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.event_id) AS registration_count,
             CASE
               WHEN e.is_suspended = 1 THEN 'suspended'
               WHEN e.event_date < NOW() THEN 'past'
               ELSE 'upcoming'
             END AS status
      FROM events e
      JOIN categories c   ON e.category_id = c.category_id
      JOIN organisations o ON e.org_id = o.org_id
    `;

    if (!all) {
      sql += `
        WHERE e.is_suspended = 0 AND e.event_date >= NOW()
        ORDER BY e.event_date ASC
      `;
    } else {
      sql += ` ORDER BY e.event_date DESC`;
    }

    const [rows] = await db.query(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/search
router.get('/search', async (req, res) => {
  try {
    const { date, location, category } = req.query;
    let sql = `
      SELECT e.event_id, e.event_name, e.event_date, e.location,
             e.ticket_price, e.image_url, c.category_name,
             CASE WHEN e.event_date >= NOW() THEN 'upcoming' ELSE 'past' END AS status
      FROM events e
      JOIN categories c ON e.category_id = c.category_id
      WHERE e.is_suspended = 0
    `;
    const params = [];

    if (date) {
      sql += ' AND DATE(e.event_date) = ?';
      params.push(date);
    }
    if (location) {
      sql += ' AND e.location LIKE ?';
      params.push(`%${location}%`);
    }
    if (category) {
      sql += ' AND c.category_id = ?';
      params.push(category);
    }
    sql += ' ORDER BY e.event_date ASC';

    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/events/:id  -> event details + associated registrations (A3 enhanced).
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }

    const eventSql = `${EVENT_SELECT}
      FROM events e
      JOIN categories c   ON e.category_id = c.category_id
      JOIN organisations o ON e.org_id = o.org_id
      WHERE e.event_id = ?
    `;
    const [eventRows] = await db.query(eventSql, [id]);
    if (eventRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const regSql = `
      SELECT r.registration_id, r.tickets, r.registration_date,
             u.user_id, u.full_name, u.email, u.phone
      FROM registrations r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.event_id = ?
      ORDER BY r.registration_date DESC
    `;
    const [regRows] = await db.query(regSql, [id]);

    res.json({
      success: true,
      data: {
        event: eventRows[0],
        registrations: regRows,
        totalTickets: regRows.reduce((sum, r) => sum + Number(r.tickets), 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/events  -> create a new charity event (admin).
router.post('/', async (req, res) => {
  try {
    const {
      event_name, description, event_date, location,
      ticket_price, goal_amount, raised_amount, image_url,
      is_suspended, org_id, category_id
    } = req.body;

    const required = ['event_name', 'event_date', 'location', 'org_id', 'category_id'];
    const missing = required.filter(k => !req.body[k]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    const sql = `
      INSERT INTO events
        (event_name, description, event_date, location, ticket_price,
         goal_amount, raised_amount, image_url, is_suspended, org_id, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      event_name,
      description || null,
      event_date,
      location,
      ticket_price ?? 0,
      goal_amount ?? 0,
      raised_amount ?? 0,
      image_url || null,
      is_suspended ? 1 : 0,
      org_id,
      category_id
    ]);

    res.status(201).json({
      success: true,
      data: { event_id: result.insertId },
      message: 'Event created'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/events/:id  -> update an existing event (admin).
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }

    const [exists] = await db.query('SELECT event_id FROM events WHERE event_id = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const {
      event_name, description, event_date, location,
      ticket_price, goal_amount, raised_amount, image_url,
      is_suspended, org_id, category_id
    } = req.body;

    const required = ['event_name', 'event_date', 'location', 'org_id', 'category_id'];
    const missing = required.filter(k => !req.body[k]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    const sql = `
      UPDATE events SET
        event_name = ?, description = ?, event_date = ?, location = ?,
        ticket_price = ?, goal_amount = ?, raised_amount = ?, image_url = ?,
        is_suspended = ?, org_id = ?, category_id = ?
      WHERE event_id = ?
    `;
    await db.query(sql, [
      event_name,
      description || null,
      event_date,
      location,
      ticket_price ?? 0,
      goal_amount ?? 0,
      raised_amount ?? 0,
      image_url || null,
      is_suspended ? 1 : 0,
      org_id,
      category_id,
      id
    ]);

    res.json({ success: true, message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/events/:id  -> only allowed when no registrations exist.
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }

    const [exists] = await db.query('SELECT event_id FROM events WHERE event_id = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const [regs] = await db.query(
      'SELECT COUNT(*) AS count FROM registrations WHERE event_id = ?', [id]
    );
    if (regs[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete: ${regs[0].count} registration(s) exist for this event.`
      });
    }

    await db.query('DELETE FROM events WHERE event_id = ?', [id]);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    // Database FK RESTRICT fallback (data integrity double-check).
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete: related registrations exist.'
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
