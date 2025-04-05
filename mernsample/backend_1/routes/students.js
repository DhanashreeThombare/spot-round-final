// routes/students.js
const express = require('express');
const router = express.Router();
const MeritListCET = require('../models/MeritList_CET'); // Your MeritList_CET model

// @route   GET /api/students/registered-count
// @desc    Get count of registered students
router.get('/registered-count', async (req, res) => {
  try {
    const count = await MeritListCET.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;