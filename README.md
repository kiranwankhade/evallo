# Basic Tutor Calendar System with Google Calendar Integration

## Overview

This project is a Basic Tutor Calendar System that allows users to manage their schedules and integrates with Google Calendar. The system includes features for viewing, creating, updating, and deleting events. It demonstrates skills in handling third-party API integrations, creating intuitive user interfaces, and developing backend functionalities.

## Features

### Calendar Management

- **Calendar View**: An interactive calendar view displaying the user's schedule. Users can click on dates and time slots to view and manage appointments. Event creation can be triggered by clicking anywhere on the calendar.
  
- **Event Creation**: A form that opens in a pop-up for users to create events with the following fields:
  - Event title
  - Description
  - List of participants
  - Date (dd-mm-yyyy)
  - Time (12hr format)
  - Duration in hours
  - Session Notes

- **Validation**: The form includes validation for required fields and proper data formats.

### Google Calendar Integration

- **Google Calendar Sync**: Integrate with the Google Calendar API to sync events. Users can authorize the application to access their Google Calendar and manage events.

## Tech Stack

### Backend

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing event data.
- **Google APIs**: For Google Calendar integration.
- **dotenv**: Module to load environment variables.

### Frontend

- **React.js**: JavaScript library for building user interfaces.
- **Chakra UI**: Component library for React.js.
- **FullCalendar**: JavaScript calendar library for creating interactive calendars.

## Project Setup

### Prerequisites

- Node.js and npm installed
- MongoDB installed and running
- Google Cloud Project with Calendar API enabled
- Google OAuth 2.0 credentials (Client ID and Client Secret)

### Backend Setup

1. Clone the repository:
   ``` bash
   git clone https://github.com/your-username/tutor-calendar-system.git
   cd tutor-calendar-system
  ``
  
2. Navigate to the backend directory:
   `` bash
      cd backend
   ``

3. Install dependencies::
   `` bash
      npm install
   ``
   
4. Create a .env file and add the following environment variables:
  `` bash
      PORT=5000
      MONGO_URI=your_mongodb_uri
      GOOGLE_CLIENT_ID=your_google_client_id
      GOOGLE_CLIENT_SECRET=your_google_client_secret
      GOOGLE_REDIRECT_URI=your_redirect_uri
   ``
5. Start the backend server:
    `` bash
      npm run server
   ``
   
### Frontend Setup

1. Navigate to the frontend directory:
  ``
  cd frontend
  Install dependencies:
  ``

2. Navigate to the backend directory:
   `` bash
      cd backend
   ``
   
3. Install dependencies::
   `` bash
      npm install
   ``

4. Start the backend server:
    `` bash
      npm start
   ``

### API Endpoints
## Event Endpoints
1. Create Event: POST /auth/events
2. Get Events: GET /auth/events
3. Update Event: PUT /auth/events/:id
4. Delete Event: DELETE /auth/events/:id

## Google Calendar Integration Endpoints
1. Authorize: GET /auth/google
2. Callback: GET /auth/google/callback

### Usage
- Navigate to the frontend application in your browser at http://localhost:3000.
- Sign in with your Google account to authorize the application.
- Use the interactive calendar to view, create, update, and delete events.
- Events will be synced with your Google Calendar.
