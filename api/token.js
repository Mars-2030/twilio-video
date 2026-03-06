const Twilio = require('twilio');

module.exports = async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // 1. Robust Body Parsing
    let data = req.body;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) { data = {}; }
    }

    // 2. Destructure fields
    const identity = data.identity;
    const roomName = data.roomName;

    console.log(`DEBUG: Identity Received: "${identity}", Room Received: "${roomName}"`);

    // 3. Validation
    if (!identity) {
      console.error("CRITICAL: No identity received from frontend!");
      return res.status(400).json({ error: 'Identity is required to match your UI' });
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

    console.log(`SUCCESS: Token created for ${identity}`);
    
    return res.status(200).json({ 
      token: token.toJwt(), 
      identity: identity 
    });

  } catch (error) {
    console.error('ERROR:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
