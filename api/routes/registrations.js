const express = require('express');
const router = express.Router();
const db = require('../event_db');

// POST /api/registrations  -> a logged-in user registers for an event.
router.post('/', async (req, res) => {
  try {
    const { user_id, event_id, tickets } = req.body;

    const required = ['user_id', 'event_id', 'tickets'];
    const missing = required.filter(k => !req.body[k]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    if (Number(tickets) < 1) {
      return res.status(400).json({ success: false, message: 'Tickets must be at least 1' });
    }

    const [userRows] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [ev] = await db.query(
      'SELECT event_id, ticket_price FROM events WHERE event_id = ?', [event_id]
    );
    if (ev.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const [result] = await db.query(
      'INSERT INTO registrations (user_id, event_id, tickets) VALUES (?, ?, ?)',
      [user_id, event_id, tickets]
    );

    // Raise the event's raised_amount by (ticket_price * tickets).
    const ticketPrice = Number(ev[0].ticket_price) || 0;
    if (ticketPrice > 0) {
      await db.query(
        'UPDATE events SET raised_amount = raised_amount + ? WHERE event_id = ?',
        [ticketPrice * Number(tickets), event_id]
      );
    }

    res.status(201).json({
      success: true,
      data: { registration_id: result.insertId },
      message: 'Registration successful'
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'You have already registered for this event.'
      });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({
        success: false,
        message: 'User or event not found.'
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
