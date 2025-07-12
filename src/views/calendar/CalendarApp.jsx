import axios from "axios"; // Make sure this is already imported
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X } from "lucide-react";

import "./CalendarApp.css";
import { useUserContext } from "../../context/usercontextprovider";
import cleanData from "../../functions/cleandata";

//sample ng event
const sampleEvents = [
  {
    id: 1,
    title: "CCS Orientation",
    date: "2025-08-01",
    time: "10:00 AM",
    description: "CCS Orientation",
    isRead: false,
    createdBy: "GSO Director",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    purpose: "Opening of A.Y.2024-2025",
    date: "2025-07-14",
    time: "8:00 AM",

    isRead: true,
    createdBy: "GSO Officer",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    purpose: "CHS Orientation",
    date: "2025-08-02",
    time: "10:30 AM",
    isRead: false,
    created_by: "GSO Director",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const CalendarApp = () => {
  const { userInfo, canManageEvents, usertoken } = useUserContext();
  const userRole = userInfo?.userRole || "Student";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    description: "",
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    fetchEvents();
    return () => clearInterval(timer);
  }, []);

  const getRelativeTime = (createdAt) => {
    const now = currentTime;
    const created = new Date(createdAt);
    const diffInMs = now - created;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${
        diffInMinutes === 1 ? "minute" : "minutes"
      } ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    } else {
      return created.toLocaleDateString();
    }
  };

  const canAddEvents = canManageEvents
    ? canManageEvents()
    : userRole === "Admin" || userRole === "GSO Officer";

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((event) => event.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowAnnouncements(true);
    setEvents(
      events.map((e) => (e.id === event.id ? { ...e, isRead: true } : e))
    );
  };
  //fetch events

  const fetchEvents = () => {
    axios
      .get("/api/calendar-announce/all", {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => {
        const fetched = cleanData(res, "noError").map((e, i) => ({
          id: i + 1000,
          title: e.title,
          date: e.date,
          time: e.time,
          description: e.description,
          isRead: false,
          createdBy: e.created_by,
          createdAt: e.created_at,
        }));
        setEvents(fetched);
      })
      .catch((err) => {
        console.error("Failed to fetch calendar events:", err);
      });
  };

  const handleAddEvent = () => {
    if (
      newEvent.title &&
      newEvent.startDate &&
      newEvent.startTime &&
      canAddEvents
    ) {
      let createdBy = "User";
      if (userRole === "GSO Director") {
        createdBy = "GSO Director";
      } else if (userRole === "GSO Officer") {
        createdBy = "GSO Officer";
      }

      // Prepare the payload
      const payload = {
        title: newEvent.title,
        description: newEvent.description,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        createdBy: createdBy,
      };

      axios
        .post("/api/calendar-announce", payload, {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        })
        .then(() => {
          alert(`Event "${newEvent.title}" has been added successfully!`);
          setNewEvent({
            title: "",
            startDate: "",
            endDate: "",
            startTime: "",
            endTime: "",
            description: "",
          });
          setShowAddEvent(false);
          fetchEvents(); // Refetch updated events from API
        })
        .catch((error) => {
          console.error("Error adding event:", error);
          alert("Failed to add event. Please try again.");
        });
    }
  };

  const toggleEventRead = (eventId) => {
    setEvents(
      events.map((e) => (e.id === eventId ? { ...e, isRead: !e.isRead } : e))
    );
  };

  const handleDeleteEvent = (eventId) => {
    if (canAddEvents) {
      const eventToDelete = events.find((e) => e.id === eventId);
      if (
        window.confirm(
          `Are you sure you want to delete "${eventToDelete?.title}"?`
        )
      ) {
        setEvents(events.filter((e) => e.id !== eventId));
        axios
          .delete(`/api/calendar-announce/${eventId}`, {
            headers: {
              Authorization: `Bearer ${usertoken}`,
            },
          })
          .then(() => {
            alert("Event deleted successfully!");
          })
          .catch((e) => {
            console.log("Error :", e);
          });
      }
    }
  };

  const getDisplayRole = (role) => {
    switch (role) {
      case "GSO Director":
        return "GSO Director";
      case "Student":
        return "Student";
      case "Regular Faculty":
        return "Regular Faculty";
      case "Faculty Adviser":
        return "Faculty Adviser";
      case "Dean/Head":
        return "Heads/Deans";
      case "GSO Officer":
        return "GSO Officer";
      default:
        return role;
    }
  };

  const days = getDaysInMonth(currentDate);
  const displayRole = getDisplayRole(userRole);

  return (
    <div className="calendar-app">
      {!showAnnouncements && (
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth} className="nav-button">
              <ChevronLeft size={24} />
            </button>
            <h2 className="month-title">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={handleNextMonth} className="nav-button">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="navigation-bar">
            <div className="nav-tabs">
              <button className="nav-tab active">Calendar</button>
              <button
                onClick={() => setShowAnnouncements(true)}
                className="nav-tab"
              >
                Events
              </button>
            </div>
          </div>

          <div className="role-indicator">
            {/* <span className="role-badge">Role: {displayRole}</span> */}
            {/* {canAddEvents ? (
              <span className="permission-note manage-access">
                ✓ Can manage events
              </span>
            ) : (
              <span className="permission-note view-access">
                View only access
              </span>
            )} */}
          </div>

          <div className="days-header">
            {daysOfWeek.map((day) => (
              <div key={day} className="day-name">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day);
              return (
                <div
                  key={index}
                  className={`calendar-day ${!day ? "empty" : ""}`}
                >
                  {day && (
                    <>
                      <div className="day-number">{day}</div>
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`event-item ${
                            !event.isRead ? "unread" : ""
                          }`}
                        >
                          <div className="event-title">{event.title}</div>
                          <div className="event-time">{event.time}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {canAddEvents && (
            <div className="add-event-section">
              <button
                onClick={() => setShowAddEvent(true)}
                className="add-event-button"
              >
                <Plus size={20} />
                Add New Event
              </button>
            </div>
          )}
        </div>
      )}

      {showAnnouncements && (
        <div className="announcements-container">
          <div className="announcements-header">
            <h2 className="announcements-title">Event Announcements</h2>
          </div>

          <div className="navigation-bar">
            <div className="nav-tabs">
              <button
                onClick={() => setShowAnnouncements(false)}
                className="nav-tab"
              >
                Calendar
              </button>
              <button className="nav-tab active">Events</button>
            </div>
          </div>

          <div className="role-indicator">
            {/* <span className="role-badge">Role: {displayRole}</span> */}
            {/* {canAddEvents ? (
              <span className="permission-note manage-access">
                ✓ Can manage events
              </span>
            ) : (
              <span className="permission-note view-access">
                View only access
              </span>
            )} */}
          </div>

          {canAddEvents && (
            <div className="add-event-section">
              <button
                onClick={() => setShowAddEvent(true)}
                className="add-event-button"
              >
                <Plus size={20} />
                Add New Event
              </button>
            </div>
          )}

          <div
            className="announcements-list overflow-auto"
            style={{ maxHeight: "60vh" }}
          >
            {events.length === 0 ? (
              <div className="no-announcements">
                No announcements yet.{" "}
                {canAddEvents
                  ? "Create some events to see them here!"
                  : "Check back later for updates!"}
              </div>
            ) : (
              events
                .sort(
                  (a, b) =>
                    new Date(b.createdAt || b.date) -
                    new Date(a.createdAt || a.date)
                )
                .map((event) => (
                  <div
                    key={event.id}
                    className={`announcement-item ${
                      event.isRead ? "read" : "unread"
                    }`}
                  >
                    <div className="announcement-header">
                      <div className="announcement-title-container">
                        <h3 className="announcement-title">{event.title}</h3>
                        {event.createdAt && (
                          <span className="relative-time">
                            {getRelativeTime(event.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="announcement-actions">
                        {/* <button
                          onClick={() => toggleEventRead(event.id)}
                          className={`read-button ${
                            event.isRead ? "mark-unread" : "mark-read"
                          }`}
                        >
                          {event.isRead ? "Mark Unread" : "Mark Read"}
                        </button> */}
                        {canAddEvents && (
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="announcement-meta">
                      {event.date} at {event.time}
                      <span className="created-by">
                        • Created by {event.createdBy}
                      </span>
                    </div>
                    <p className="announcement-description">
                      {event.description}
                    </p>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {showAddEvent && canAddEvents && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Add New Event</h3>
              <button
                onClick={() => setShowAddEvent(false)}
                className="close-button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-form">
              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  className="form-input"
                  placeholder="Enter event title"
                  maxLength={100}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    value={newEvent.startDate}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, startDate: e.target.value })
                    }
                    className="form-input"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    value={newEvent.endDate}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, endDate: e.target.value })
                    }
                    className="form-input"
                    min={
                      newEvent.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, startTime: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, endTime: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  className="form-textarea"
                  placeholder="Enter event description"
                  rows={4}
                  maxLength={500}
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setShowAddEvent(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  className="submit-button"
                  disabled={
                    !newEvent.title ||
                    !newEvent.startDate ||
                    !newEvent.startTime
                  }
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarApp;
