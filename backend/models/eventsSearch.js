const { google } = require('googleapis');
const { UserModel } = require('../models/user'); // Assuming UserModel is defined

// Function to fetch events from Google Calendar
const fetchEventsFromGoogleCalendar = async (googleId) => {
  // Retrieve user details from the UserModel

  console.log('googleId:', googleId)
  const user = await UserModel.findOne({ googleId });
    console.log('user:', user)
    if (!user) {
      throw new Error('User not found');
    }

  console.log('user:', user)

  // Create OAuth2 client with Google credentials
//   const oauth2Client = new google.auth.OAuth2();
//   oauth2Client.setCredentials({
//     access_token: user.accessToken,
//     refresh_token: user.refreshToken,
//     // Optionally, you can set the expiry_date and token_type if available
//   });

  // Create a new Calendar instance
//   const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    // Fetch events from the user's primary calendar
    // const response = await calendar.events.list({
    //   calendarId: 'primary', // Use 'primary' for the user's primary calendar
    //   timeMin: new Date().toISOString(), // Fetch events starting from today
    //   maxResults: 10, // Limit the number of events returned
    //   singleEvents: true,
    //   orderBy: 'startTime',
    // });

    // const events = response.data.items;
    console.log('eventcfvghbjnkml')
    // return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

module.exports = { fetchEventsFromGoogleCalendar };
