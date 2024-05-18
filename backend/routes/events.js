// const express = require('express');
// const {EventModel} = require('../models/event');
// const {UserModel} = require('../models/user');
// const eventRouter = express.Router();

// const { fetchEventsFromGoogleCalendar } = require('../models/eventsSearch');
// eventRouter.use(express.urlencoded({ extended: true }));

// // Get all events for a user
// eventRouter.get('/', async (req, res) => {
//   const userId = req.body.userId;
//   console.log('req.query:', req.body);
//   console.log('userId:', userId);

//   try {
//     // Fetch events for the specified user
//     const events = await fetchEventsFromGoogleCalendar(userId);
//     console.log('events:', events)
//     // res.json(events);

//   } catch (error) {
//     console.error('Error fetching events:', error);
//     res.status(500).json({ message: 'Error fetching events' });
//   }
// });

// // Create an event
// eventRouter.post('/', async (req, res) => {
//   const event = new EventModel(req.body);
//   try {
//     const newEvent = await event.save();
//     res.status(201).json(newEvent);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Update an event
// eventRouter.patch('/:id', async (req, res) => {
//   try {
//     const updatedEvent = await EventModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(updatedEvent);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // Delete an event
// eventRouter.delete('/:id', async (req, res) => {
//   try {
//     await EventModel.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Event deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = {eventRouter};


const express = require('express');
const { EventModel } = require('../models/event');
const { UserModel } = require('../models/user');
const eventRouter = express.Router();

const { google } = require('googleapis');
const { OAuth2 } = google.auth;

// Middleware to verify user authentication and get access token
const verifyAuthAndGetToken = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.accessToken) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get access token from user object or session
    const accessToken = req.user.accessToken;

    // Set the access token in OAuth2 client
    req.oauth2Client.setCredentials({ access_token: accessToken });

    next();
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Create OAuth2 client with Google credentials
eventRouter.oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set access token if available
oAuth2Client.setCredentials({
  access_token: 'YOUR_ACCESS_TOKEN',
  refresh_token: 'YOUR_REFRESH_TOKEN',
});

// Google Calendar API instance
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

// Get all events for a user
eventRouter.get('/', async (req, res) => {

  try {
    // Fetch events from Google Calendar API
    const response = await calendar.events.list({
      calendarId: 'primary', // Use 'primary' for the user's primary calendar
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    console.log('events:', events)
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Create an event
eventRouter.post('/', async (req, res) => {
  const event = new EventModel(req.body);
  try {
    // Save the event to the database
    const newEvent = await event.save();

    // Add the event to Google Calendar API
    const response = await calendar.events.insert({
      calendarId: 'primary', // Use 'primary' for the user's primary calendar
      requestBody: event,
    });

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update an event
eventRouter.patch('/:id', async (req, res) => {
  try {
    // Update the event in the database
    const updatedEvent = await EventModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Update the event in Google Calendar API
    await calendar.events.update({
      calendarId: 'primary', // Use 'primary' for the user's primary calendar
      eventId: req.params.id,
      requestBody: req.body,
    });

    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an event
eventRouter.delete('/:id', async (req, res) => {
  try {
    // Delete the event from the database
    await EventModel.findByIdAndDelete(req.params.id);

    // Delete the event from Google Calendar API
    await calendar.events.delete({
      calendarId: 'primary', // Use 'primary' for the user's primary calendar
      eventId: req.params.id,
    });

    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { eventRouter };
