
require("dotenv").config();

const AGORA_APP_ID = process.env.AGORA_APP_ID?.trim();
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE?.trim();

// Validate required variables at startup
if (!AGORA_APP_ID) {
  throw new Error("AGORA_APP_ID is missing in environment variables");
}

if (!AGORA_APP_CERTIFICATE) {
  throw new Error("AGORA_APP_CERTIFICATE is missing in environment variables");
}


module.exports = {
  appId: AGORA_APP_ID,
  appCertificate: AGORA_APP_CERTIFICATE,
};