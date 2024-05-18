import React, { useState } from 'react';
import { Box, Heading, Button, Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setEvents } from '../Redux/Event/eventActions';

const EventForm = () => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  const [formData, setFormData] = useState({
    summary: '',
    description: '',
    attendees: '',
    date: '',
    start: '',
    end: '',
    duration: '',
    sessionNotes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { summary, description, attendees, date, start, end, duration, sessionNotes } = formData;
    const newEvent = {
      summary,
      description,
      attendees: attendees.split(','), // Convert comma-separated string to an array
      date,
      start: { dateTime: `${date}T${start}`, timeZone: 'Asia/Kolkata' }, // Combine date and time for start
      end: { dateTime: `${date}T${end}`, timeZone: 'Asia/Kolkata' }, // Combine date and time for end
      duration: Number(duration),
      sessionNotes
    };
    try {
      const response = await axios.post('http://localhost:8000/events', { user, newEvent });
      dispatch(setEvents(response.data));
      // Clear form data after successful submission
      setFormData({
        summary: '',
        description: '',
        attendees: '',
        date: '',
        start: '',
        end: '',
        duration: '',
        sessionNotes: ''
      });
      window.location.href = window.location.href;
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <Box p={4}>
      <form onSubmit={handleSubmit}>
        <FormControl id="summary">
          <FormLabel>Title</FormLabel>
          <Input name="summary" value={formData.summary} onChange={handleChange} required />
        </FormControl>
        <FormControl id="description">
          <FormLabel>Description</FormLabel>
          <Textarea name="description" value={formData.description} onChange={handleChange} />
        </FormControl>
        <FormControl id="attendees">
          <FormLabel>Attendees (comma separated emails)</FormLabel>
          <Input name="attendees" value={formData.attendees} onChange={handleChange} />
        </FormControl>
        <FormControl id="date">
          <FormLabel>Date</FormLabel>
          <Input name="date" type="date" value={formData.date} onChange={handleChange} required />
        </FormControl>
        <FormControl id="start">
          <FormLabel>Start Time</FormLabel>
          <Input name="start" type="time" value={formData.start} onChange={handleChange} required />
        </FormControl>
        <FormControl id="end">
          <FormLabel>End Time</FormLabel>
          <Input name="end" type="time" value={formData.end} onChange={handleChange} required />
        </FormControl>
        <FormControl id="duration">
          <FormLabel>Duration (hours)</FormLabel>
          <Input name="duration" type="number" value={formData.duration} onChange={handleChange} required />
        </FormControl>
        <FormControl id="sessionNotes">
          <FormLabel>Session Notes</FormLabel>
          <Textarea name="sessionNotes" value={formData.sessionNotes} onChange={handleChange} />
        </FormControl>
        <Button type="submit" mt={4}>Create Event</Button>
      </form>
    </Box>
  );
};

export default EventForm;
