import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./RequestFrequency.css";
import axios from "axios"; // Make sure axios is installed
import { useUserContext } from "../../context/usercontextprovider";
import cleanData from "../../functions/cleandata";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const RequestFrequency = () => {
  const [data, setData] = useState([]);
  const { usertoken, userInfo } = useUserContext();
  const GSO =
    userInfo.userRole === "GSO Officer" || userInfo.userRole === "GSO Director";
  useEffect(() => {
    var api = " ";
    if (GSO) {
      api = axios.get("/api/frequency/gso", {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      });
    } else {
      api = axios.get("/api/frequency", {
        headers: { Authorization: `Bearer ${usertoken}` },
      });
    }
    api
      .then((response) => {
        const apiData = cleanData(response, "noError").map((item) => ({
          name: months[item.month - 1],
          requests: item.total,
        }));
        setData(apiData);
      })
      .catch((error) => {
        console.error("Error fetching request frequency:", error);
      });
  }, []);

  return (
    <div className="request-frequency">
      <h3>Request Frequency 2025</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="requests" fill="#3ea8ff" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RequestFrequency;
