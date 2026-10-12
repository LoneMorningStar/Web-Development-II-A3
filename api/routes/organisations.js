const express = require('express');
const router = express.Router();
const db = require('../event_db');

// GET /api/organisations  -> used by the admin event form dropdown.
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT org_id, org_name FROM organisations ORDER BY org_name'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
