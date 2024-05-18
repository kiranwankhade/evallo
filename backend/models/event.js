const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  summary: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }, 
  attendees: {
    type: [String], // Array of strings (emails)
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  start: {
    dateTime: {
      type: Date,
      required: true
    },
    timeZone: {
      type: String,
      required: true
    }
  },
  end: {
    dateTime: {
      type: Date,
      required: true
    },
    timeZone: {
      type: String,
      required: true
    }
  },
  duration: {
    type: Number,
    required: true
  },
  sessionNotes: {
    type: String,
    required: true
  }
});


const EventModel = mongoose.model('Event', eventSchema);

module.exports = {
    EventModel
}