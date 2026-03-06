const Twilio = require('twilio');

module.exports = async (req, res) => {
  try {
    // Log the incoming request to see what the browser is sending
    console.log('Incoming Request Body:', req.body);

    const { identity, roomName } = req.body || {};
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    // Check if variables are actually present
    if (!accountSid || !apiKey || !apiSecret) {
      console.error('Missing Environment Variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const AccessToken = Twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    // Twilio requires an identity. Fallback if the app sends nothing.
    const tokenIdentity = identity || `user-${Math.floor(Math.random() * 10000)}`;

    const token = new AccessToken(accountSid, apiKey, apiSecret, { 
      identity: tokenIdentity,
      ttl: 3600 
    });

    const videoGrant = new VideoGrant({ room: roomName || 'default' });
    token.addGrant(videoGrant);

    console.log(`Generated token for: ${tokenIdentity}`);

    res.status(200).json({ 
      token: token.toJwt(),
      identity: tokenIdentity 
    });
  } catch (error) {
    console.error('Token Error:', error);
    res.status(500).json({ error: error.message });
  }
};
