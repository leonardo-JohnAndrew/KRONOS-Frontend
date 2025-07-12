/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import { AsteriskIcon, Bell, X } from "lucide-react";
import "./NotificationModule.css";
import { Outlet, useAsyncError } from "react-router";
import axios from "axios";
import { useUserContext } from "../context/usercontextprovider";
import cleanData from "../functions/cleandata";
import formatDate from "../functions/dateformat";
import RecordViewModal from "./recordViewModal";
import { n } from "fonts/defaultFont";
import { GiConsoleController } from "react-icons/gi";
import { MdNotificationsActive } from "react-icons/md";

const NotificationModule = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifid, setnotifid] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState({});
  const [formData, setFormData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [approval, setApproval] = useState(false);
  const { usertoken, userInfo } = useUserContext();
  const [showReject, setShowReject] = useState(true);
  const { dateformat, dateTimeFormat } = formatDate();
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const forApproval =
    userInfo.userRole === "Faculty Adviser" ||
    userInfo.userRole === "Dean/Head";
  const GSO =
    userInfo.userRole === "GSO Officer" || userInfo.userRole === "GSO Director";
  const notify = useCallback(() => {
    // if (!state) return; // Prevent running if state is undefined

    axios
      .get(`/api/notification`, {
        headers: { Authorization: `Bearer ${usertoken}` },
      })
      .then((res) => {
        const jsonData = cleanData(res, "noError");
        setNotifications(jsonData);
        if (!jsonData || !Array.isArray(jsonData)) {
          return;
        }
        // dispatch({
        //     type: actions.fetch_success,
        //     payload: jsonData.facility,
        // });

        // console.log("Dispatched Data:", jsonData.facility);
      })
      .catch((error) => {
        console.error(" Error:", error);
      });
  }, []);
  useEffect(() => {
    if (notifications) {
      const timeout = setTimeout(() => {
        notify();

        // console.log(notifications); // debug only
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [notifications]);

  useEffect(() => {
    Promise.all([
      axios.get("/api/facility-request/index", {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
      axios.get("/api/service-request/index", {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
      axios.get("/api/job-request/index", {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
      axios.get("/api/purchase-request/index", {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
    ])
      .then(([facility, service, job, purchase]) => {
        const allRequests = [
          ...cleanData(facility, "noError"),
          ...cleanData(service, "noError"),
          ...cleanData(job, "noError"),
          ...cleanData(purchase, "noError"),
        ];

        setRequests(allRequests);
      })
      .catch((err) => {
        console.error("Failed to fetch requests:", err);
      });
  }, [notifications]);

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
  };
  const filterNotification = () => {
    const matchedCodes = new Set();
    const filtered = [];

    for (const notif of notifications) {
      if (!matchedCodes.has(notif.reqstCODE)) {
        const match = requests.find((req) => req.reqstCODE === notif.reqstCODE);
        if (match) {
          filtered.push(match);
          matchedCodes.add(notif.reqstCODE);
        }
      }
    }

    return filtered;
  };

  const findRole = () => {
    switch (userInfo.userRole) {
      case "Dean/Head":
        return "deanApproval";
      case "Faculty Adviser":
        return "facultyApproval";
      case "GSO Officer":
        return "officerApproval";
      case "GSO Director":
        return "adminApproval";

      default:
        return "Unknown";
    }
  };

  const handleView = async (id, reqstCODE) => {
    //axios // view
    console.log(requests);
    setSelectedRequest(requests.find((n) => n.reqstCODE === reqstCODE));
    //    console.log(requests.find((n) => n.reqstCODE === reqstCODE));
    setModalOpen(true);
    // showReject? setModalOpen(true)
    // :
    await axios
      .post(
        `/api/notification/view/${id}`,
        {
          isRead: true,
        },
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      )
      .then((res) => {
        //   alert(cleanData(res, "noError"));
      })
      .catch((err) => {
        console.error("Failed View", err);
      });
  };
  const handleOpenRejectionModal = async (reqstCODE, id) => {
    setnotifid(id);
    setSelectedRequest(requests.find((n) => n.reqstCODE === reqstCODE));
    await axios
      .post(
        `/api/notification/view/${id}`,
        {
          isRead: true,
        },
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      )
      .then((res) => {
        //   alert(cleanData(res, "noError"));
      })
      .catch((err) => {
        console.error("Failed View", err);
      });

    setShowRejectionModal(true);
  };
  const role = (role) => {
    switch (role) {
      case "GSO Officer":
        return "officer";
      case "GSO Director":
        return "director";
      case "Faculty Adviser":
        return "adviser";
      case "Dean/Head":
        return "deans";
      default:
        break;
    }
  };
  // Handle confirming rejection with reason
  const handleConfirmRejection = () => {
    const userRole = role(userInfo.userRole);

    const formData = {
      remark: "Reject",
      reason: rejectionReason,
    };
    var approval;
    var request_type;

    console.log(formData, selectedRequest);
    //axios
    switch (selectedRequest.request_type) {
      case "FR":
        request_type = "facility-request";
        break;
      case "VR":
        request_type = "service-request";

        break;
      case "JR":
        request_type = "job-request";

        break;
      case "PR":
        request_type = "purchase-request";

        break;
      default:
        break;
    }
    if (userRole == "director") {
      approval = axios.post(
        `/api/${userRole}/${request_type}/${selectedRequest.id}/${selectedRequest.reqstCODE}/approval`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      );
    } else {
      approval = axios.post(
        `/api/${userRole}/${request_type}/${selectedRequest.id}/approval`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      );
    }
    approval
      .then((response) => {
        const jsonData = cleanData(response, "noError");
        console.log(jsonData);
      })
      .catch((error) => {
        console.error("Error:", error);
        // const cleanData = error.response.data.replace(/<!--.*?-->/g, "").trim();
        const jsonData = JSON.parse(cleanData);
        const validationErrors = Object.values(jsonData.errors)
          .flat()
          .join("\n");
      });
    //axios for action
    setAction(notifid);
    setShowRejectionModal(false);
    setRejectionReason("");
    setSelectedRequest("");
    setnotifid("");
  };
  const setAction = async (notifID) => {
    await axios
      .post(
        `/api/notification/action/${notifID}`,
        {
          action: true,
        },
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      )
      .then((response) => {
        console.log(cleanData(response, "noError"));
      })
      .catch((error) => {
        console.log(error);
        console.log(cleanData(error, "Error"));
      });
  };
  const action = async (remarks) => {};
  const unreadCount = notifications.filter((n) => n.isRead === "No").length;

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const closeNotifications = () => {
    setIsOpen(false);
  };
  const keywords = [
    "Completed",
    "Reject",
    "Rejected",
    "Approved",
    "viewed",
    "View",
    "Scheduled",
    "schedule",
  ];
  const matched = (id) => {
    const notif = notifications.find((n) => n.id === id);
    if (!notif) return;

    const found = keywords.some((keyword) =>
      notif.notification.includes(keyword)
    );
    setShowReject(!found); // hide reject if status keyword found
  };

  //approval
  const handleApprovalRequest = async (type, id, items = {}) => {
    const userrole = role(userInfo.userRole);
    var request_type;
    switch (selectedRequest.request_type) {
      case "FR":
        request_type = "facility-request";
        break;
      case "VR":
        request_type = "service-request";

        break;
      case "JR":
        request_type = "job-request";

        break;
      case "PR":
        request_type = "purchase-request";

        break;
      default:
        break;
    }
    var updateData = {
      ...formData,
      remark: "Approved",
    };

    const canEdit =
      userInfo.userRole === "GSO Officer" ||
      userInfo.userRole === "GSO Director";

    if (canEdit) {
      // console.log(userInfo.userRole);
      switch (type) {
        case "PR":
          //console.log(items.purchase);
          updateData = {
            ...formData,
            remark: "Approved",
            materials: items.purchase,
            canEdit: "edit",
          };
          break;
        case "JR":
          updateData = {
            ...formData,
            remark: "Approved",
            candEdit: "edit",
            joblist: items.job,
          };
          break;
        case "VR":
          updateData = {
            ...formData,
            remark: "Approved",
            canEdit: "edit",
            vehicleID: items.vehicle.vehicleID,
            driver: items.vehicle.driver,
          };
          break;
      }
    } else {
      //  alert("not Authorized");
    }

    var approval;
    if (selectedRequest) {
      // if (isAuthorized) {
      //     const date = "";
      // }
      if (userrole === "director") {
        approval = axios.post(
          `/api/${userrole}/${request_type}/${selectedRequest.id}/${selectedRequest.reqstCODE}/approval`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${usertoken}`,
            },
          }
        );
      } else {
        //axios
        switch (type) {
          case "FR":
            approval = axios.post(
              `/api/${userrole}/facility-request/${id}/approval`,
              updateData,
              {
                headers: {
                  Authorization: `Bearer ${usertoken}`,
                },
              }
            );
            break;
          case "VR":
            approval = axios.post(
              `/api/${userrole}/service-request/${id}/approval`,
              updateData,
              {
                headers: {
                  Authorization: `Bearer ${usertoken}`,
                },
              }
            );
            break;
          case "PR":
            approval = axios.post(
              `/api/${userrole}/purchase-request/${id}/approval`,
              updateData,
              {
                headers: {
                  Authorization: `Bearer ${usertoken}`,
                },
              }
            );
            break;
          case "JR":
            approval = axios.post(
              `/api/${userrole}/job-request/${id}/approval`,
              updateData,
              {
                headers: {
                  Authorization: `Bearer ${usertoken}`,
                },
              }
            );
            break;

          default:
            break;
        }
      }
      approval
        .then((response) => {
          const cleanData = response.data.replace(/<!--.*?-->/g, "").trim();
          const jsonData = JSON.parse(cleanData, "noError");
          // setResult(jsonData.message);
          console.log(updateData);
          alert(jsonData.message);
          closeModal();
        })
        .catch((error) => {
          console.error("Error:", error);
          const cleanData = error.response.data
            .replace(/<!--.*?-->/g, "")
            .trim();
          const jsonData = JSON.parse(cleanData);
          const validationErrors = Object.values(jsonData.errors)
            .flat()
            .join("\n");
          console.log(`Validation Error:\n${validationErrors}`);
        });
    }

    //   // const updatedRequest = {
    //   //     ...selectedRequest,
    //   //     status: "Ongoing",
    //   // };

    //   // // Update in the main requests list
    //   // setRequests(
    //   //     requests.map((req) =>
    //   //         req.id === selectedRequest.id ? updatedRequest : req
    //   //     )
    //   // );

    // Close the form and reset selection
    setSelectedRequest(null);
  };
  return (
    <div className="notification-container">
      {/* Search Bar */}

      <div className="search-header">
        {/* <div className="search-wrapper">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                    />
                    <div className="search-icon">🔍</div>
                    <div className="search-shortcut">F</div>
                </div> */}
        {/* Notification Bell */}
        <div className="bell-container">
          <span className="Active">
            {/* {localStorage.getItem("active")} */}
          </span>

          <button onClick={toggleNotifications} className="bell-button">
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
        </div>
      </div>
      {/* Notification Dropdown */}
      {isOpen && (
        <div className="notification-dropdown">
          {/* Header */}
          <div className="dropdown-header">
            <div className="header-content">
              <span className="header-title">Notifications</span>
              {unreadCount > 0 && (
                <span className="unread-count">{unreadCount}</span>
              )}
            </div>
            <button onClick={closeNotifications} className="close-button">
              <X size={16} />
            </button>
          </div>

          {/* Notification List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <Bell size={48} />
                </div>
                <p className="empty-text">No recent notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="notification-item">
                  <div className="notification-content">
                    <div className="notification-info">
                      {notification.isRead === "No" && (
                        <div className="unread-dot"></div>
                      )}
                      <div className="notification-text">
                        <p className="notification-message">
                          <span className="user-name">
                            {notification.notification}
                          </span>
                        </p>
                        <div className="notification-time">
                          <p className="time">{notification.time}</p>
                          <p className="time-ago">
                            {dateTimeFormat(notification.created_at).date + " "}
                            {dateTimeFormat(notification.created_at).time}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}

                  <div className="action-buttons">
                    <button
                      onClick={() =>
                        handleView(notification.id, notification.reqstCODE)
                      }
                      className="view-button"
                    >
                      View
                    </button>

                    {keywords.some((keyword) =>
                      notification.notification.includes(keyword)
                    ) ? (
                      ""
                    ) : (
                      <button
                        onClick={(e) => {
                          handleOpenRejectionModal(
                            notification.reqstCODE,
                            notification.id
                          );
                        }}
                        className="reject-button"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {/* Rejection Reason Modal */}
            {showRejectionModal && (
              <div className="modals-overlay">
                <div className="modals-container">
                  <h3 className="modals-title">Reasons for Rejection</h3>
                  <p className="modals-subtitle">
                    It is required to state the reason for Confirmation
                  </p>

                  <textarea
                    className="rejection-textarea"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter your reason for rejection..."
                  />

                  <div className="modals-actions">
                    <button
                      className="modals-confirm-button"
                      onClick={handleConfirmRejection}
                      disabled={!rejectionReason.trim()}
                    >
                      Confirm
                    </button>
                    <button
                      className="modals-cancel-button"
                      onClick={() => {
                        setShowRejectionModal(false);
                        setRejectionReason("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="dropdown-overlay" onClick={closeNotifications}></div>
      )}
      <div className="outlet-content">
        <RecordViewModal
          isOpen={modalOpen}
          approval={GSO || forApproval ? !approval : approval}
          onClose={closeModal}
          request={selectedRequest}
          handleApprovalRequest={handleApprovalRequest}
        />
        <Outlet />
      </div>
    </div>
  );
};

export default NotificationModule;
