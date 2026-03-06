try {
    const { identity, roomName } = req.body;
    
    // If the app doesn't send an identity, we must provide a fallback 
    // or the token signature will fail.
    const userIdentity = identity || `user-${Math.floor(Math.random() * 10000)}`;
    const room = roomName || 'default-room';

    console.log(`Generating token for Identity: ${userIdentity} in Room: ${room}`);

    const token = new Twilio.jwt.AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY_SID,
      process.env.TWILIO_API_KEY_SECRET,
      { 
        identity: userIdentity,
        ttl: 3600 // Token valid for 1 hour
      }
    );

    const videoGrant = new Twilio.jwt.AccessToken.VideoGrant({ room: room });
    token.addGrant(videoGrant);

    res.status(200).json({ token: token.toJwt() });
