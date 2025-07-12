import "./dashboard.css";
import RequestFrequency from "./RequestFrequency";
import RequestQueue from "./RequestQueue";
import RightPanel from "./RightPanel";
import Overview from "./Overview";
import Announcements from "./Announcement";
import { useUserContext } from "../../context/usercontextprovider";

function Dashboard() {
  /// cons
  const { userInfo } = useUserContext();
  return (
    <div className="dashboard-container">
      <div className="greetings">
        <h3>{`Welcome , ${userInfo.lastname} , ${userInfo.firstname}`}</h3>
      </div>
      <RequestQueue />
      <Overview />
      <div className="announce">
        <Announcements />
      </div>
      <RequestFrequency />
      <div className="right">
        <RightPanel />
      </div>
    </div>
  );
}

export default Dashboard;
