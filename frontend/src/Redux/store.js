import {
    legacy_createStore,
    compose,
    combineReducers,
    applyMiddleware
} from 'redux'

import {thunk} from "redux-thunk"
import reduxReducer from './reducer';
import eventReducer from './Event/eventReducer';
import userReducer from './User/userReducer';


const rootReducer = combineReducers({
  user: userReducer,
  events: eventReducer,
})

const composeEnhancer = window._REDUX_DEVTOOLS_EXTENSION_COMPOSE_ || compose;

export const store = legacy_createStore(rootReducer,composeEnhancer(applyMiddleware(thunk)))