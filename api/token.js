const Twilio = require('twilio');

module.exports = async (req, res) => {
  try {
    const { identity, roomName } = req.body || {};
    
    // 1. Get credentials from environment
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;
    // This is optional but highly recommended for this specific app
    const conversationServiceSid = process.env.TWILIO_CONVERSATIONS_SERVICE_SID;

    if (!accountSid || !apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Twilio credentials missing' });
    }

    const AccessToken = Twilio.jwt.AccessToken;
    const { VideoGrant, ChatGrant } = AccessToken;

    // 2. Identity is REQUIRED by this React app. Ensure it's never empty.
    const tokenIdentity = identity || `user-${Math.floor(Math.random() * 10000)}`;

    // 3. Create the token
    const token = new AccessToken(
      accountSid.trim(),
      apiKey.trim(),
      apiSecret.trim(),
      { identity: tokenIdentity, ttl: 3600 }
    );

    // 4. ADD VIDEO GRANT
    const videoGrant = new VideoGrant({ room: roomName || 'default' });
    token.addGrant(videoGrant);

    // 5. ADD CHAT GRANT (Crucial for this specific React app)
    // If you don't have a Conversations Service SID, we use a placeholder 
    // to satisfy the SDK's initialization logic.
    if (conversationServiceSid) {
      const chatGrant = new ChatGrant({ serviceSid: conversationServiceSid });
      token.addGrant(chatGrant);
    } else {
      // Fallback: If no service SID is provided, we still add a generic ChatGrant
      // which often resolves the initialization loop in the React App.
      token.addGrant(new ChatGrant());
    }

    res.status(200).json({ 
      token: token.toJwt(),
      identity: tokenIdentity 
    });

  } catch (error) {
    console.error('Token Error:', error);
    res.status(500).json({ error: error.message });
  }
};
