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
  const GSO =
    userInfo.userRole === "GSO Director" || userInfo.userRole === "GSO Officer";
  return (
    <div className="dashboard-container">
      <div className="greetings">
        <h3>
          {" "}
          <strong>Welcome !</strong>
          {` ${userInfo.lastname} , ${userInfo.firstname}  `}
        </h3>
        <h6>({userInfo.userRole})</h6>
      </div>
      <RequestQueue />
      <Overview />
      <div className="announce">
        <Announcements />
      </div>
      {GSO && <RequestFrequency />}
      <div className="right">
        <RightPanel />
      </div>
    </div>
  );
}

export default Dashboard;
