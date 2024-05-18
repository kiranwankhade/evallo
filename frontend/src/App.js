import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Navigate, Route, Router, Routes } from 'react-router-dom';
import CalendarView from './components/CalendarView';
import EventForm from './components/EventForm';
import Login from './components/Login';
import { Box } from '@chakra-ui/react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  console.log('App_user:', user)
  const events = useSelector(state => state.events);
  const isAuthenticated = !!user.email;


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (isAuthenticated) {
          const response = await axios.get('http://localhost:8000/auth/events', {
            params: { user: JSON.stringify(user) },
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          console.log('response:', response.data);
          dispatch({ type: 'SET_EVENTS', payload: response.data });
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
  
    fetchEvents();
  }, [user, dispatch]);
  
  console.log("events",events)

  return (
    <Box>
        
     <Routes>
        <Route path="/" element={user.email=='' ? <Login/> : <CalendarView path="/calender" /> } />
        <Route path="/calender" element={<CalendarView path="/calender" />} />
        <Route path="/new-event" element={<EventForm />} />
      </Routes>
  </Box>
  );
};

export default App;
