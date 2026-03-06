const Twilio = require('twilio');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. ADVANCED BODY PARSING
    // We try multiple ways to find the identity
    let identity = req.body?.identity;
    let roomName = req.body?.roomName;

    // If Vercel didn't parse it, try to parse the raw string
    if (!identity && typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        identity = parsed.identity;
        roomName = parsed.roomName;
      } catch (e) { /* ignore */ }
    }

    console.log(`DEBUG: Found Identity: "${identity}", Room: "${roomName}"`);

    // 2. ERROR HANDLING
    if (!identity) {
      console.error("No identity found in request body.");
      // We return a 200 with an error string so the React app 
      // shows a readable error instead of crashing.
      return res.status(200).json({ 
        error: "NO_IDENTITY", 
        token: "Error: No name provided" 
      });
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

    return res.status(200).json({ 
      token: token.toJwt(), 
      identity: identity 
    });

  } catch (error) {
    console.error('SERVER CRASH:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
