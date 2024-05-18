import { SET_EVENTS, ADD_EVENT, UPDATE_EVENT, DELETE_EVENT } from './eventActions';

const initialState = [];

const eventReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_EVENTS:
      return action.payload;
    case ADD_EVENT:
      return [...state, action.payload];
    case UPDATE_EVENT:
      return state.map(event => event._id === action.payload._id ? action.payload : event);
    case DELETE_EVENT:
      return state.filter(event => event._id !== action.payload);
    default:
      return state;
  }
};

export default eventReducer;
