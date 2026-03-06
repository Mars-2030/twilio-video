const Twilio = require('twilio');

module.exports = async (req, res) => {
  // 1. Setup CORS so the browser doesn't block the request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. Parse Body safely
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    // 3. THE FIX: Match the exact keys sent by the Twilio React App
    const identity = body.user_identity || body.identity;
    const roomName = body.room_name || body.roomName;

    console.log(`TRACE: Received Identity: "${identity}", Room: "${roomName}"`);

    // 4. Validation
    if (!identity) {
      console.error("ERROR: No identity found. Body received was:", body);
      return res.status(400).json({ error: 'Identity is required' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Missing Twilio Env Variables' });
    }

    // 5. Generate Token
    const AccessToken = Twilio.jwt.AccessToken;
    const token = new AccessToken(accountSid.trim(), apiKey.trim(), apiSecret.trim(), { 
      identity: String(identity), 
      ttl: 3600 
    });

    token.addGrant(new AccessToken.VideoGrant({ room: String(roomName) }));

    // 6. Return exact JSON format expected by the React app
    return res.status(200).json({ 
      token: token.toJwt(), 
      identity: identity 
    });

  } catch (error) {
    console.error('SERVER ERROR:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
