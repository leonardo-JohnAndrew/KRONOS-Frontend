import { useEffect, useState } from "react";
import "./Overview.css";
import axios from "axios";
import { useUserContext } from "../../context/usercontextprovider";
import cleanData from "../../functions/cleandata";

const Overview = () => {
  const [data, setData] = useState([]);
  const [gsoData, setGSOData] = useState([]);

  const { usertoken, userInfo } = useUserContext();
  const GSO =
    userInfo.userRole === "GSO Officer" || userInfo.userRole === "GSO Director";
  useEffect(() => {
    axios
      .get("/api/overview", {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => {
        const formatted = cleanData(res, "noError").map((item) => ({
          title: item.label,
          count: item.current,
          change:
            item.percentage >= 0
              ? `↑ ${item.percentage}%`
              : `↓ ${Math.abs(item.percentage)}%`,
          previous: item.previous,
        }));
        setData(formatted);
      })
      .catch((err) => {
        console.error("Error fetching summary:", err);
      });
  }, []);
  useEffect(() => {
    if (GSO) {
      axios
        .get("/api/overview/gso", {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        })
        .then((res) => {
          console.log(cleanData(res, "noError"));
          const formatted = cleanData(res, "noError").map((item) => ({
            title: item.title,
            count: item.count,
            previous: item.previous,
            change:
              item.change >= 0
                ? `↑ ${item.change}%`
                : `↓ ${Math.abs(item.change)}%`,
          }));
          setGSOData(formatted);
        })
        .catch((err) => {
          console.error("Error fetching summary:", err);
        });
    }
  }, []);

  return (
    <div className="overview">
      {(GSO ? gsoData : data).map((item, index) => (
        <div className="overview-card" key={index}>
          <h4>{item.title}</h4>
          <p className="count">{item.count}</p>
          <p className="change">{item.change}</p>
          <p className="previous">Previous month {item.previous}</p>
        </div>
      ))}
    </div>
  );
};

export default Overview;
