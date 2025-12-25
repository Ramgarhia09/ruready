// src/controllers/callController.js

const agoraService = require('../services/agoraService');

/**
 * Generate Agora RTC/RTM Token
 * POST /api/call/token
 * Body: { channelName: string, uid: number|string }
 */
const generateAgoraToken = async (req, res) => {
  try {
    const { channelName, uid } = req.body;

    // Stronger validation
    if (!channelName || channelName.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'channelName is required and cannot be empty',
      });
    }

    if (uid === undefined || uid === null || isNaN(Number(uid))) {
      return res.status(400).json({
        success: false,
        error: 'uid is required and must be a valid number',
      });
    }

    const uidNumber = Number(uid);

    // Optional: Restrict uid range (Agora recommends 1+ for users)
    if (uidNumber < 1 || uidNumber > (2**32 - 1)) {
      return res.status(400).json({
        success: false,
        error: 'uid must be between 1 and 4294967295',
      });
    }

    // Delegate to service layer (clean & testable)
    const token = agoraService.buildRtcToken(channelName.trim(), uidNumber);

    return res.status(200).json({
      success: true,
      data: { token },
    });
  } catch (error) {
    // Don't leak internal errors to client
    // In production, this will be caught by global error handler later
    return res.status(500).json({
      success: false,
      error: 'Failed to generate Agora token',
    });
  }
};

module.exports = {
  generateAgoraToken,
};