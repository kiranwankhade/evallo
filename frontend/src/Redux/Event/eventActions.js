export const SET_EVENTS = 'SET_EVENTS';
export const ADD_EVENT = 'ADD_EVENT';
export const UPDATE_EVENT = 'UPDATE_EVENT';
export const DELETE_EVENT = 'DELETE_EVENT';

export const setEvents = (events) => ({
  type: SET_EVENTS,
  payload: events,
});

export const addEvent = (event) => ({
  type: ADD_EVENT,
  payload: event,
});

export const updateEvent = (event) => ({
  type: UPDATE_EVENT,
  payload: event,
});

export const deleteEvent = (eventId) => ({
  type: DELETE_EVENT,
  payload: eventId,
});
