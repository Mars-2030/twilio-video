const Twilio = require('twilio');

module.exports = async (req, res) => {
  // 1. Handle preflight/options requests for CORS if needed
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { identity, roomName } = req.body;

    // Validate environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !apiKey || !apiSecret) {
      return res.status(500).json({ error: "Twilio credentials missing in Vercel settings." });
    }

    // Ensure we have an identity (Twilio requires this for the signature)
    const userIdentity = identity || `user-${Math.floor(Math.random() * 10000)}`;
    const room = roomName || 'default-room';

    // 3. Create the Access Token
    const AccessToken = Twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
      accountSid,
      apiKey,
      apiSecret,
      { identity: userIdentity, ttl: 3600 }
    );

    // 4. Grant access to Video
    const grant = new VideoGrant({ room: room });
    token.addGrant(grant);

    // 5. Send the JWT token
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send({ 
      token: token.toJwt(),
      identity: userIdentity 
    });

  } catch (error) {
    console.error('SERVER ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};
