import { useEffect, useState } from "react";
import axios from "axios";
import "./RightPanel.css";
import { useUserContext } from "../../context/usercontextprovider";
import cleanData from "../../functions/cleandata";

const RightPanel = () => {
  const today = new Date();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthDays = Array.from({ length: 30 }, (_, i) => i + 1); // For June
  const [schedule, setSchedule] = useState([]);
  const { usertoken } = useUserContext();
  useEffect(() => {
    axios
      .get("/api/today-schedule", {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => setSchedule(cleanData(res, "noError")))
      .catch((err) => {
        console.error("Failed to fetch schedule", err);
        setSchedule([]); // optional fallback
      });
  }, [usertoken]);

  return (
    <div className="right-panel">
      <div className="calendar">
        <div className="calendar-headers">
          <span>June 2025</span>
        </div>
        <div className="calendar-grids">
          {weekdays.map((day) => (
            <div key={day} className="day-names">
              {day}
            </div>
          ))}
          {monthDays.map((day) => {
            const isToday = today.getDate() === day;
            return (
              <div key={day} className={`day ${isToday ? "today" : ""}`}>
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="schedule">
        <h4>Today’s Schedule</h4>
        {schedule.length > 0 ? (
          schedule.map((item, i) => (
            <div key={i} className="schedule-item">
              <div className="time">{item.time}</div>
              <div className="details">
                <strong>{item.activity}</strong>
                <p>{item.requestor}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No schedules for today.</p>
        )}
      </div>
    </div>
  );
};

export default RightPanel;
