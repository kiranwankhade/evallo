import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../Redux/User/userActions";
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

const CalendarView = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const events = useSelector((state) => state.events);
  const user = useSelector((state) => state.user);
  const location = useLocation();

  useEffect(() => {
    // Extract query parameters from the URL
    const searchParams = new URLSearchParams(location.search);
    const userData = Object.fromEntries(searchParams.entries());
    console.log("userData:", userData);

    // Dispatch action to set user data in Redux store
    dispatch(setUser(userData));
  }, [dispatch, location.search]);

  // Fetch user events if authenticated
  useEffect(() => {
    const fetchEvents = async () => {
      if (user && user._id) {
        try {
          const response = await axios.get(
            "https://frightened-bedclothes-fox.cyclic.app/auth/events",
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

  const simplifiedEvents = events?.map((event) => {
    const startDateTime = new Date(event.start.dateTime);
    const endDateTime = new Date(event.end.dateTime);

    // Calculate duration in minutes
    const duration = (endDateTime - startDateTime) / (1000 * 60); // duration in minutes

    // Example to extract session details from description (customize as needed)
    const session = event.sessionNotes || "Default Session";

    return {
      title: event.summary,
      description: event.description,
      start: event.start.dateTime,
      end: event.end.dateTime,
      extendedProps: {
        _id: event.id,
        summary: event.summary,
        attendees: event.attendees,
        sessionNotes: event.description,
        session: session, // Adjust as needed
        duration: duration,
      },
    };
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

  // const eventRender = ( {event} ) => (

  // );
  // When a date grid is clicked, this function will invoke

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
      attendees: attendees.split(","), // Convert comma-separated string to an array
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
          `https://frightened-bedclothes-fox.cyclic.app/auth/events/${selectedEventId}`,
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
        const response = await fetch("https://frightened-bedclothes-fox.cyclic.app/auth/events", {
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
    // Create a Date object from the string
    const dateObj = new Date(dateTimeString);

    // Extract the date part
    const date = dateObj.toISOString().split("T")[0]; // yyyy-mm-dd format

    // Extract the time part (hh:mm:ss format)
    const time = dateObj.toTimeString().split(" ")[0];

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
        ? eventOne.attendees.join(",")
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
      await fetch(`https://frightened-bedclothes-fox.cyclic.app/auth/events/${selectedEventId}`, {
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

  return (
    <Box p={4} width="100%">
      <Heading mb={4}>My Calendar</Heading>
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
      {/* <Calendar
        onClickDay={(date) => alert(`Events on ${date.toDateString()}: ${events.filter(event => new Date(event.date).toDateString() === date.toDateString()).map(event => event.title).join(', ')}`)}
      /> */}
      {/* <GoogleCalendar events={formattedEvents}
  apiKey={API_KEY} calendars={calendars} showWeekends={true} /> */}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={simplifiedEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        // editable={true}
        eventContent={eventRender}
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
