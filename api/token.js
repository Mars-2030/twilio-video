const Twilio = require('twilio');

module.exports = async (req, res) => {
  const { identity, roomName } = req.body; // App sends data in body
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    TWILIO_CONVERSATIONS_SERVICE_SID
  } = process.env;

  const AccessToken = Twilio.jwt.AccessToken;
  const { VideoGrant, ChatGrant } = AccessToken;

  const token = new AccessToken(
    TWILIO_ACCOUNT_SID,
    TWILIO_API_KEY_SID,
    TWILIO_API_KEY_SECRET,
    { identity }
  );

  const videoGrant = new VideoGrant({ room: roomName });
  token.addGrant(videoGrant);

  if (TWILIO_CONVERSATIONS_SERVICE_SID) {
    const chatGrant = new ChatGrant({ serviceSid: TWILIO_CONVERSATIONS_SERVICE_SID });
    token.addGrant(chatGrant);
  }

  res.status(200).json({ token: token.toJwt() });
};
