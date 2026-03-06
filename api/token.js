const Twilio = require('twilio');

module.exports = async (req, res) => {
  // 1. Setup CORS so the browser doesn't block the request
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 2. Robust Body Parsing (Fixes the "Identity Received: undefined" issue)
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const identity = body.identity;
    const roomName = body.roomName;

    console.log(`TRACE: Received Identity: "${identity}", Room: "${roomName}"`);

    // 3. Validation: The React app requires a matching identity
    if (!identity) {
      console.error("ERROR: No identity found. Check frontend fetch headers.");
      return res.status(400).json({ error: 'Identity is required' });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    const AccessToken = Twilio.jwt.AccessToken;
    const token = new AccessToken(accountSid.trim(), apiKey.trim(), apiSecret.trim(), { 
      identity: identity, 
      ttl: 3600 
    });

    token.addGrant(new AccessToken.VideoGrant({ room: roomName }));

    // 4. Return EXACTLY what the React app expects
    // This fixes the "token must be a string" error in the browser
    return res.status(200).json({ 
      token: token.toJwt(), 
      identity: identity 
    });

  } catch (error) {
    console.error('SERVER ERROR:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
