const Twilio = require('twilio');

module.exports = async (req, res) => {
  console.log('--- TOKEN TRACE START ---');
  console.log('Method:', req.method);
  console.log('Body:', JSON.stringify(req.body));

  try {
    const { identity, roomName } = req.body || {};

    // 1. Trace Environment Variables (Masked for safety)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    console.log('Account SID exists:', !!accountSid, accountSid?.substring(0, 5) + '...');
    console.log('API Key SID exists:', !!apiKey, apiKey?.substring(0, 5) + '...');
    console.log('API Secret exists:', !!apiSecret, '(hidden)');

    if (!accountSid || !apiKey || !apiSecret) {
      console.error('ERROR: Missing environment variables in Vercel settings.');
      return res.status(500).json({ error: 'Missing Twilio credentials' });
    }

    // 2. Trace Identity and Room
    // Twilio 20151 often happens if identity is empty or not a string
    const tokenIdentity = String(identity || `user-${Math.floor(Math.random() * 10000)}`);
    const tokenRoom = String(roomName || 'default-room');
    
    console.log('Using Identity:', tokenIdentity);
    console.log('Using Room:', tokenRoom);

    // 3. Generate Token
    const AccessToken = Twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
      accountSid.trim(), 
      apiKey.trim(), 
      apiSecret.trim(), 
      { identity: tokenIdentity, ttl: 3600 }
    );

    const videoGrant = new VideoGrant({ room: tokenRoom });
    token.addGrant(videoGrant);

    const jwt = token.toJwt();
    console.log('JWT Generated successfully. Length:', jwt.length);
    
    console.log('--- TOKEN TRACE END ---');

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send({ 
      token: jwt,
      identity: tokenIdentity 
    });

  } catch (error) {
    console.error('--- TRACE ERROR ---');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({ error: error.message });
  }
};
