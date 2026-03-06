const Twilio = require('twilio');

module.exports = async (req, res) => {
  // 1. Only allow POST requests (which is what the app uses)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { identity, roomName } = req.body;

    // 2. Validate environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !apiKey || !apiSecret) {
      throw new Error("Missing Twilio credentials in Environment Variables");
    }

    const AccessToken = Twilio.jwt.AccessToken;
    const { VideoGrant } = AccessToken;

    // 3. Create the token
    const token = new AccessToken(accountSid, apiKey, apiSecret, { 
      identity: identity || 'user' 
    });

    // 4. Add the video grant
    const videoGrant = new VideoGrant({ room: roomName });
    token.addGrant(videoGrant);

    // 5. Send JSON response
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({ token: token.toJwt() }));

  } catch (error) {
    console.error('Token Error:', error.message);
    res.status(500).json({ error: error.message });
  }
};
