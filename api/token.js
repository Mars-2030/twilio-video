const Twilio = require('twilio');

module.exports = async (req, res) => {
  try {
    const { identity, roomName } = req.body || {};
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;
    const conversationServiceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID;

    if (!accountSid || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Twilio credentials missing' });
    }

    // This React app uses the username as the identity
    const tokenIdentity = identity ? String(identity) : `user-${Math.floor(Math.random() * 10000)}`;

    const AccessToken = Twilio.jwt.AccessToken;
    const { VideoGrant, ChatGrant } = AccessToken;

    // Create the Access Token
    const token = new AccessToken(
      accountSid.trim(),
      apiKey.trim(),
      apiSecret.trim(),
      { identity: tokenIdentity, ttl: 3600 }
    );

    // 1. Add Video Grant
    const videoGrant = new VideoGrant({ room: roomName || 'default' });
    token.addGrant(videoGrant);

    // 2. Add Chat Grant ONLY if Service SID exists
    // This stops the 20151 error caused by empty grants
    if (conversationServiceSid && conversationServiceSid.startsWith('IS')) {
      const chatGrant = new ChatGrant({ serviceSid: conversationServiceSid });
      token.addGrant(chatGrant);
    }

    // Log the token metadata to Vercel logs for debugging
    console.log(`Token created: Identity=${tokenIdentity}, Room=${roomName}`);

    res.status(200).json({ 
      token: token.toJwt(),
      identity: tokenIdentity 
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};
