// src/routes/call.routes.js

const express = require('express');
const router = express.Router();

const { generateAgoraToken } = require('../controllers/callController');

/**
 * @route   POST /api/call/token
 * @desc    Generate Agora RTC Token
 * @access  Protected (add auth middleware later)
 */
router.post('/token', generateAgoraToken);

module.exports = router;