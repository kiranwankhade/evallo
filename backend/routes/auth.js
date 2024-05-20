const express = require('express');
const { google } = require('googleapis');
const { EventModel } = require('../models/event');
const { UserModel } = require('../models/user');
const router = express.Router();
const eventRouter = express.Router();
const axios = require('axios');

// Create OAuth2 client with Google credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);


// Route to initiate Google OAuth2 flow
router.get('/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  // Generate URL for authentication request
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });

  // Redirect user to Google sign-in page
  res.redirect(authUrl);
});

// Callback route to handle Google OAuth2 response
router.get('/google/callback', async (req, res) => {
  try {
    const code = req.query.code;
    console.log('code:', code)

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    console.log('Tokens:', tokens);

    // Set the credentials for the OAuth2 client
    oauth2Client.setCredentials({ access_token: tokens.access_token });

    // Create a new OAuth2 client with the access token
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });

    // Get user information using the authenticated OAuth2 client
    const { data: userInfo } = await oauth2.userinfo.get();

    // Check if the user already exists in the database
    let user = await UserModel.findOne({ $or: [{ email: userInfo.email }, { googleId: userInfo.id }] });

    // If the user doesn't exist, create a new user record
    if (!user) {
      user = new UserModel({
        email: userInfo.email,
        googleId: userInfo.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        name : userInfo.name
      });
      await user.save();
    }

    // Here you can customize what user data you want to send to the frontend
    const userData = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      googleId: userInfo.id,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      tokenId: tokens.id_token,
      expiryDate: tokens.expiry_date,
      scope:tokens.scope,
      picture:userInfo.picture
    };

    const searchParams = new URLSearchParams(userData);
    const frontendUrl = `https://evallocalender.vercel.app/calender?${searchParams.toString()}`;

    // Redirect to the frontend with user data
    res.redirect(frontendUrl);
  } catch (error) {
    // Log error and send response with status code 500
    console.error('Error during Google callback:', error);
    res.status(500).send('Authentication failed');
  }
});


const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

router.get('/events', async (req, res) => {
  console.log('req.query.user:', req.query.user)
  try {
    const user = JSON.parse(req.query.user);
    console.log('user:', user)
    const accessToken = user.accessToken;
    const refreshToken = user.refreshToken;
    console.log('accessToken:', accessToken);
    console.log('Request received with userEmail:', user.email);

    if (!user.email) {
      return res.status(400).json({ message: 'User email is required' });
    }

    if (!accessToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Set the access token in OAuth2 client
    oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

    const fetchEvents = async () => {
      try {
        const response = await calendar.events.list({
          calendarId: user.email,
          timeMin: new Date().toISOString(),
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        });

        const events = response.data.items;
        // console.log('events:', events);
        res.json(events);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          // Token might be expired, try to refresh it
          try {
            const newToken = await oauth2Client.refreshAccessToken();
            oauth2Client.setCredentials({ access_token: newToken.credentials.access_token });

            // Retry fetching events with the new access token
            const response = await calendar.events.list({
              calendarId: user.email,
              timeMin: new Date().toISOString(),
              maxResults: 10,
              singleEvents: true,
              orderBy: 'startTime',
            });

            const events = response.data.items;
            console.log('events:', events);
            res.json(events);
          } catch (refreshError) {
            console.error('Error refreshing access token:', refreshError);
            res.status(500).json({ message: 'Error refreshing access token', error: refreshError.message });
          }
        } else {
          throw error;
        }
      }
    };

    await fetchEvents();
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});





// Create an event
router.post('/events', async (req, res) => {
  const { user, eventObject } = req.body;
  console.log('eventObject:', eventObject)
  console.log('userEmail:', user)

  try {
    // Set credentials (access token and optional refresh token)
    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken, // If available, for token refresh
    });

    // Create a new event instance from the request body
    const event = new EventModel(eventObject);

    // Save the event to the database
    const newEvent = await event.save();

    // Insert the event into the user's Google Calendar
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.insert({
      calendarId: user.email, // Assuming user.email contains the calendarId
      requestBody: event.toObject(), // Convert Mongoose document to plain object
    });

    // Respond with the newly created event
    console.log('newEvent:', response)
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update an event
router.patch('/events/:id', async (req, res) => {
  const { user, eventObject } = req.body;
  console.log('user:', user)
  const eventId = req.params.id;
  console.log('eventId:', eventId)

  try {
    // Set credentials (access token and optional refresh token)
    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken, // If available, for token refresh
    });

    // Update the event in the database
    // const updatedEvent = await EventModel.findByIdAndUpdate(eventId, eventObject, { new: true });

    // Update the event in Google Calendar API
    const response=  await calendar.events.update({
      calendarId: user.email, // Assuming user.email contains the calendarId
      eventId: eventId,
      requestBody: eventObject,
    });
    console.log('response:', response.data)

    res.json( response.data);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(400).json({ message: err.message });
  }
});

// Delete an event
router.delete('/events/:id', async (req, res) => {
  const { user } = req.body; 
  const eventId = req.params.id;
  console.log('eventId:', eventId)

  try {
    // Set credentials (access token and optional refresh token)
    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken, // If available, for token refresh
    });


    // Delete the event from Google Calendar API
    await calendar.events.delete({
      calendarId: user.email, // Assuming user.email contains the calendarId
      eventId: eventId,
    });

    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = {router};