const Twilio = require('twilio');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    // This React app uses user_identity and room_name
    const identity = body.user_identity || body.identity;
    const roomName = body.room_name || body.roomName;

    if (!identity) {
      return res.status(400).json({ error: 'Identity is required' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;
    
    // Using your verified Service SID
    const chatServiceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID || "ISf125e08961f648c69da253a81794d787";

    const AccessToken = Twilio.jwt.AccessToken;
    const { VideoGrant, ChatGrant } = AccessToken;

    const token = new AccessToken(
      accountSid.trim(),
      apiKey.trim(),
      apiSecret.trim(),
      { identity: String(identity), ttl: 3600 }
    );

    // 1. ADD VIDEO GRANT (This is what fixed the 20151 error)
    const videoGrant = new VideoGrant({ room: String(roomName) });
    token.addGrant(videoGrant);

    // 2. ADD CHAT GRANT (This will fix the Conversations error)
    const chatGrant = new ChatGrant({ serviceSid: chatServiceSid.trim() });
    token.addGrant(chatGrant);

    console.log(`Token created with Chat Grant for SID: ${chatServiceSid}`);

    return res.status(200).json({ 
      token: token.toJwt(), 
      identity: identity 
    });

  } catch (error) {
    console.error('SERVER ERROR:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
