/* eslint-disable no-unused-vars */
// components/Announcements.js

import { useEffect, useState } from "react";
import axios from "axios";

import { useUserContext } from "../../context/usercontextprovider";
import "./Announce.css";
import cleanData from "../../functions/cleandata";

// Sample Events (use actual data source in production)
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
    title: "Opening of A.Y.2024-2025",
    date: "2025-07-14",
    time: "8:00 AM",
    description: "Start of Academic Year",
    isRead: true,
    createdBy: "GSO Officer",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
  },
];

const Announcements = () => {
  const { userInfo, usertoken } = useUserContext();
  const userRole = userInfo?.userRole || "Student";

  const [currentTime, setCurrentTime] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  //fetch event ss

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);

    axios
      .get("/api/calendar-announce/get", {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => {
        const formatted = cleanData(res, "noError").map((e, idx) => ({
          id: idx + 1000,
          title: e.title,
          date: e.date,
          time: e.time,
          description: e.description,
          isRead: false,
          createdBy: e.created_by,
          createdAt: e.created_at,
        }));
        setEvents(formatted);
      })
      .catch((err) => {
        console.error("Failed to fetch announcements:", err);
      });

    return () => clearInterval(timer);
  }, []);

  const getRelativeTime = (createdAt) => {
    const now = currentTime;
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute(s) ago`;
    if (diffInHours < 24) return `${diffInHours} hour(s) ago`;
    if (diffInDays < 7) return `${diffInDays} day(s) ago`;
    return created.toLocaleDateString();
  };

  const isLowerRole = !["GSO Director", "GSO Officer"].includes(userRole);

  const filteredEvents = events.filter((event) => {
    if (isLowerRole) {
      const created = new Date(event.createdAt);
      const diffDays = (currentTime - created) / (1000 * 60 * 60 * 24);
      return diffDays <= 5;
    }
    return true;
  });

  const toggleRead = (eventId) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isRead: !e.isRead } : e))
    );
  };

  return (
    <div className="announcentsme-panel">
      <h2 className="section-title">Announcements</h2>

      {filteredEvents.length === 0 ? (
        <p className="no-announcement">No announcements to show.</p>
      ) : (
        <div className="overflow-auto" style={{ maxHeight: "400px" }}>
          {filteredEvents
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
                  <h3 className="announcement-title">{event.title}</h3>
                  <span className="time-info">
                    {getRelativeTime(event.createdAt)}
                  </span>
                </div>
                <div className="announcement-meta">
                  {event.date}
                  {event.time &&
                    event.time.toLowerCase() !== "none" &&
                    ` at ${event.time}`}
                </div>

                <p className="announcement-description">{event.description}</p>

                {/* {!["GSO Director", "GSO Officer"].includes(userRole) && (
                  // <button
                  //   onClick={() => toggleRead(event.id)}
                  //   className="read-toggle"
                  // >
                  //   {event.isRead ? "Mark Unread" : "Mark Read"}
                  // </button>
                )} */}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Announcements;
