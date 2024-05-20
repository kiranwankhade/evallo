import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, setUser } from "../Redux/User/userActions";
import { setEvents } from "../Redux/Event/eventActions";
import axios from "axios";
import {
  Box,
  Heading,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  ModalFooter,
} from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import Calendar from 'react-calendar';

import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import Navbar from "./Navbar";

const CalendarView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const events = useSelector((state) => state.events);
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    // Extract query parameters from the URL
    const searchParams = new URLSearchParams(location.search);
    const userData = Object.fromEntries(searchParams.entries());
   

    // Dispatch action to set user data in Redux store
    dispatch(setUser(userData));
  }, [dispatch, location.search]);

  // Fetch user events if authenticated
  useEffect(() => {
    const fetchEvents = async () => {
      if (user && user._id) {
        try {
          const response = await axios.get(
            "https://evallo-backend.onrender.com/auth/events",
            {
              params: { user: JSON.stringify(user) },
              headers: {
                Authorization: `Bearer ${user.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("response:", response);
          dispatch({ type: "SET_EVENTS", events: response.data });
        } catch (error) {
          console.error("Error fetching events:", error);
        }
      }
      // axios.get(`http://localhost:8000/auth/events`, {
      //   params: { user: user },
      // })
      // .then(response => {
      //   console.log('response:', response.data);
      //   // dispatch({ type: 'SET_EVENTS', events: response.data });
      // })
      // .catch(error => {
      //   console.error('Error fetching events:', error);
      // });
    };

    fetchEvents();
  }, [user, dispatch]);
  console.log("userData:", user);
  const simplifiedEvents = events?.map((event) => {
    const startDateTime = new Date(event.start.dateTime);
    const endDateTime = new Date(event.end.dateTime);
  
    const duration = (endDateTime - startDateTime) / (1000 * 60); // duration in minutes
  
    return {
      title: event.summary,
      description: event.description,
      start: startDateTime.toISOString(), // Format date to ISO string
      end: endDateTime.toISOString(), // Format date to ISO string
      extendedProps: {
        _id: event.id,
        summary: event.summary,
        attendees: event.attendees, // Join attendees as a comma-separated string
        sessionNotes: event.sessionNotes,
        duration: duration,
      },
    }
  });

  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleEventMouseEnter = (info) => {
    if (info.event && info.event.extendedProps) {
      const eventElement = info.el;
      const tooltipWidth = 200; // Adjust as needed
      const tooltipHeight = 100; // Adjust as needed
      const offsetX = 1; // Adjust as needed
      const offsetY = 1; // Adjust as needed

      // Calculate tooltip position relative to the mouse cursor
      const mouseX = info.jsEvent.clientX;
      const mouseY = info.jsEvent.clientY;
      const tooltipX = mouseX + offsetX;
      const tooltipY = mouseY + offsetY;

      // Set tooltip content and position
      setTooltipContent(info.event.extendedProps.description);
      setTooltipPosition({ x: tooltipX, y: tooltipY });
    }
  };

  const handleEventMouseLeave = () => {
    setTooltipContent("");
  };

  const eventRender = ({ event }) => {
    return (
      <Box
        bg="blue.500"
        color="white"
        p={2}
        w={"100%"}
        flexWrap={"wrap"}
        borderRadius="md"
        cursor="pointer"
        _hover={{ bg: "blue.600" }}
        onMouseEnter={() => handleEventMouseEnter(event)}
        onMouseLeave={handleEventMouseLeave}
      >
        <Text fontSize="sm" fontWeight={"bold"}>
          {event.title}
        </Text>
        <Text fontSize="sm">{event.description}</Text>
        {/* Use start directly in toLocaleTimeString() */}
        <Text fontSize="sm">{new Date(event.start).toLocaleTimeString()}</Text>
      </Box>
    );
  };

 
  const handleDateClick = (info) => {
    alert("Date clicked: " + info.dateStr);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    attendees: "",
    date: "",
    start: "",
    end: "",
    duration: "",
    sessionNotes: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
   
    const {
      summary,
      description,
      attendees,
      date,
      start,
      end,
      duration,
      sessionNotes,
    } = formData;
  

  
  
    const eventObject = {
      summary,
      description,
      attendees: attendees.split(",").map(email => ({
        email: email.trim(),
        responseStatus: 'accepted', // Set default value
        self: true // Set default value
      })), // Convert comma-separated string to an array
      date,
      start: { dateTime: `${date}T${start}`, timeZone: "Asia/Kolkata" }, // Combine date and time for start
      end: { dateTime: `${date}T${end}`, timeZone: "Asia/Kolkata" }, // Combine date and time for end
      duration: Number(duration),
      sessionNotes,
    };

    console.log("newEvent:", eventObject);

    if (createEvent === false) {
      try {
        const response = await axios.patch(
          `https://evallo-backend.onrender.com/auth/events/${selectedEventId}`,
          {
            user,
            eventObject: eventObject,
          }
        );

        // Update the event in the Redux store
        dispatch(setEvents(response.data));

        setFormData({
          summary: "",
          description: "",
          attendees: "",
          date: "",
          start: "",
          end: "",
          duration: "",
          sessionNotes: "",
        });
        // Close the modal
        setIsModalOpen(false);
        window.location.href = window.location.href;
      } catch (error) {
        console.error("Error updating event:", error);
      }
    } else {
      try {
        const response = await fetch("https://evallo-backend.onrender.com/auth/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user, eventObject }),
        });

        if (!response.ok) {
          throw new Error("Failed to create event");
        }

        const responseData = await response.json();
        dispatch(setEvents(responseData));

        // Clear form data after successful submission
        setFormData({
          summary: "",
          description: "",
          attendees: "",
          date: "",
          start: "",
          end: "",
          duration: "",
          sessionNotes: "",
        });
        window.location.href = window.location.href;
      } catch (error) {
        console.error("Error creating event:", error);
      }
    }
  };

  // State to manage the currently selected event ID for editing
  const [selectedEventId, setSelectedEventId] = useState("");
  const [createEvent, setCreateEventId] = useState(true);
  const splitDateTime = (dateTimeString) => {
    const dateObj = new Date(dateTimeString);
    const date = dateObj.toISOString().split("T")[0]; // yyyy-mm-dd format
    const time = dateObj.toTimeString().split(" ")[0]; // hh:mm:ss format
    return { date, time };
  };
  // Function to handle editing an event
  const handleEventClick = (info) => {
    setIsModalOpen(true);
    const eventId = info.event.extendedProps._id;
    const eventOne = events.find((event) => event.id === eventId);
    setSelectedEventId(eventId);
    setCreateEventId(false);
    
    if (eventOne) {
      // Extract date and time for start and end
      const { date: startDate, time: startTime } = splitDateTime(
        eventOne.start.dateTime
      );
      const { date: endDate, time: endTime } = splitDateTime(
        eventOne.end.dateTime
      );

      // Join attendees if it's an array of strings
      const attendeesString = Array.isArray(eventOne.attendees)
      ? eventOne.attendees.map(att => att.email).join(",")
      : "";

      setFormData({
        summary: eventOne.summary,
        description: eventOne.description,
        attendees: attendeesString,
        date: startDate,
        start: startTime,
        end: endTime,
        duration: eventOne.duration,
        sessionNotes: eventOne.sessionNotes,
      });

      
    }
  };

  const handleDeleteEvent = async () => {
    try {
      console.log("selectedEventId:", selectedEventId);
      await fetch(`https://evallo-backend.onrender.com/auth/events/${selectedEventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });

      // Update events in Redux store
      const updatedEvents = events.filter(
        (event) => event.id !== selectedEventId
      );
      dispatch(setEvents(updatedEvents));

      setFormData({
        summary: "",
        description: "",
        attendees: "",
        date: "",
        start: "",
        end: "",
        duration: "",
        sessionNotes: "",
      });
      // Close the modal
      setIsModalOpen(false);
      window.location.href = window.location.href;
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleLogout = async () => {
    dispatch(logoutUser());
    nav('/')
  };

  return (
    <Box p={4} width="100%">
       <Navbar user={user} onLogout={handleLogout} />
      <br/>
      <Button
        onClick={() => {
          setSelectedEventId("");
          setCreateEventId(true);
          setFormData({
            summary: "",
            description: "",
            attendees: "",
            date: "",
            start: "",
            end: "",
            duration: "",
            sessionNotes: "",
          });
          setIsModalOpen(true);
        }}
        mb={4}
      >
        Create Event
      </Button>{" "}

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={simplifiedEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        // editable={true}
        eventContent={eventRender}
        // eventMouseEnter={handleEventMouseEnter}
        // eventMouseLeave={handleEventMouseLeave}
      />
      {tooltipContent && (
        <div
          style={{
            position: "absolute",
            top: tooltipPosition.y,
            left: tooltipPosition.x,
          }}
        >
          {tooltipContent}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {createEvent ? "Create Event" : "Update Event"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <FormControl id="summary">
                <FormLabel>Title</FormLabel>
                <Input
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl id="description">
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl id="attendees">
                <FormLabel>Attendees (comma separated emails)</FormLabel>
                <Input
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl id="date">
                <FormLabel>Date</FormLabel>
                <Input
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl id="start">
                <FormLabel>Start Time</FormLabel>
                <Input
                  name="start"
                  type="time"
                  value={formData.start}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl id="end">
                <FormLabel>End Time</FormLabel>
                <Input
                  name="end"
                  type="time"
                  value={formData.end}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl id="duration">
                <FormLabel>Duration (hours)</FormLabel>
                <Input
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </FormControl>
              <FormControl id="sessionNotes">
                <FormLabel>Session Notes</FormLabel>
                <Textarea
                  name="sessionNotes"
                  value={formData.sessionNotes}
                  onChange={handleChange}
                />
              </FormControl>
              <Button type="submit" colorScheme="blue" mt={4}>
                {createEvent ? "Create Event" : "Update Event"}
              </Button>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>

            {/* Delete button (only for editing an existing event) */}
            {createEvent == false && selectedEventId && (
              <Button colorScheme="red" onClick={handleDeleteEvent}>
                Delete Event
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CalendarView;
