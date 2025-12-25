// src/services/agoraService.js

const { RtcTokenBuilder } = require('agora-token'); // RtcRole not needed for basic token
const { appId, appCertificate } = require('../config/agora.config');
const logger = require('../utils/logger'); // We'll create this soon

/**
 * Generate Agora RTC Token
 * @param {string} channelName - Unique channel name
 * @param {number} uid - User ID as integer (0 = Agora assigns dynamically)
 * @param {number} [expirationSeconds=3600] - Token validity (default 1 hour)
 * @returns {string} RTC Token
 */
const buildRtcToken = (
  channelName,
  uid = 0,
  expirationSeconds = 3600
) => {
  if (!channelName || typeof channelName !== 'string') {
    throw new Error('channelName is required and must be a string');
  }

  if (typeof uid !== 'number' || uid < 0 || uid > 4294967295) {
    throw new Error('uid must be a valid unsigned 32-bit integer (0 to 4294967295)');
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpireTimestamp = currentTimestamp + expirationSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName.trim(),
      uid,
      privilegeExpireTimestamp
    );

    logger.info('Agora RTC token generated', {
      channelName: channelName.trim(),
      uid,
      expiresIn: expirationSeconds,
    });

    return token;
  } catch (error) {
    logger.error('Failed to generate Agora RTC token', {
      error: error.message,
      channelName,
      uid,
    });
    throw new Error('Token generation failed'); // Hide internal details from caller
  }
};

/**
 * Optional: Generate token with string UID (e.g., Firebase UID)
 * Use only if you need user-specific mapping
 */
// const buildRtcTokenWithAccount = (channelName, account, expirationSeconds = 3600) => {
//   // ... similar implementation using buildTokenWithAccount
// };

module.exports = {
  buildRtcToken,
  // buildRtcTokenWithAccount,
};