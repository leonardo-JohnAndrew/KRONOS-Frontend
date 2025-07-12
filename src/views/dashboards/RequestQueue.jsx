/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import axios from "axios";
import "./RequestQueue.css";
import { useUserContext } from "../../context/usercontextprovider";
import cleanData from "../../functions/cleandata";
import RecordViewModal from "../../components/recordViewModal";
import formatDate from "../../functions/dateformat";

const RequestQueue = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const { usertoken, userInfo } = useUserContext();
  const { dateTimeFormat } = formatDate();

  // const { handleApprovalRequest } = Approval();
  const [approval, setApproval] = useState(false);
  const [gsoRequests, setgsoRequests] = useState([]);

  const only =
    userInfo.userRole === "Faculty Adviser" || userInfo.userRole === "Dean/Hed";
  userInfo.userRole === "GSO Officer" || userInfo.userRole === "GSO Director";
  const GSO =
    userInfo.userRole === "GSO Officer" || userInfo.userRole === "GSO Director";
  useEffect(() => {
    Promise.all([
      axios.get("/api/facility-request/all", {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
      axios.get("/api/service-request/all", {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
      axios.get("/api/job-request/all", {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
      axios.get("/api/purchase-request/all", {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
    ])
      .then(([facility, service, job, purchase]) => {
        const allRequests = [
          ...cleanData(facility, "noError"),
          ...cleanData(service, "noError"),
        ];
        if (only) {
          allRequests.push(
            ...cleanData(job, "noError"),
            ...cleanData(purchase, "noError")
          );
        }
        // Sort by created_at and take top 5
        const recentRequests = allRequests
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 10);

        setRequests(recentRequests);
      })
      .catch((err) => {
        console.error("Failed to fetch requests:", err);
      });
  }, [usertoken, selectedRequest]);
  //fetch per gso
  useEffect(() => {
    if (GSO) {
      var userRole = "";
      if (userInfo.userRole === "GSO Officer") {
        userRole = "officer";
      } else if (userInfo.userRole === "GSO Director") {
        userRole = "director";
      }
      Promise.all([
        axios.get(`/api/${userRole}/facility-request/view`, {
          headers: { Authorization: `Bearer ${usertoken}` },
        }),
        axios.get(`/api/${userRole}/service-request/view`, {
          headers: { Authorization: `Bearer ${usertoken}` },
        }),
        axios.get(`/api/${userRole}/job-request/view`, {
          headers: { Authorization: `Bearer ${usertoken}` },
        }),
        axios.get(`/api/${userRole}/purchase-request/view`, {
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

          // Sort by created_at and take top 5
          const recentRequests = allRequests
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);

          setgsoRequests(recentRequests);
        })
        .catch((err) => {
          console.error("Failed to fetch requests:", err);
        });
    }
    // slice
  }, [usertoken, selectedRequest]);

  const openModal = (req) => {
    setSelectedRequest(req);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRequest(null);
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
  const handleConfirmRejection = (rejection) => {
    const userRole = role(userInfo.userRole);

    const formData = {
      remark: "Reject",
      reason: rejection,
    };
    var approval;
    var request_type;

    // console.log(formData, selectedRequest);
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
    if (userRole === "director") {
      //  alert(userRole);
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
    // setAction(notifid);
    //   setShowRejectionModal(false);
    // setRejectionReason("");
    setSelectedRequest("");
  };
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
      // alert("not Authorized");
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
    <div className="request-queue">
      <h3>{GSO ? "Recent Request" : "Your Request"}</h3>
      <div
        className="table-responsive"
        style={{ maxHeight: "250px", overflowY: "auto" }}
      >
        <div className="table">
          <div className="theader">
            <div>Type</div>
            <div>Reference Number</div>
            <div>{GSO ? "From" : "DateNeeded"}</div>
            <div>Status</div>
            <div>View</div>
          </div>

          {(GSO ? gsoRequests : requests)?.length > 0 ? (
            (GSO ? gsoRequests : requests).map((req, index) => (
              <div className="table-row" key={index}>
                <div>{req.request_type}</div>
                <div>{req.reqstCODE}</div>
                <div>
                  {GSO
                    ? req.user?.lastname && req.user?.firstname
                      ? `${req.user.lastname}, ${req.user.firstname}`
                      : "N/A"
                    : dateTimeFormat(req.dateNeeded)?.date || "N/A"}
                </div>

                <div
                  className={`status-badges status-${req.remark.toLowerCase()}`}
                >
                  {req.remark === "Reject" ? "Rejected" : req.remark}
                </div>
                <div>
                  <a className="view-link" onClick={() => openModal(req)}>
                    View
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100px",
                fontSize: "18px",
                color: "#555",
              }}
            >
              No Recent Request
            </div>
          )}
        </div>
      </div>

      <RecordViewModal
        isOpen={modalOpen}
        onClose={closeModal}
        request={selectedRequest}
        approval={GSO ? !approval : approval}
        handleApprovalRequest={handleApprovalRequest}
        handleConfirmRejection={handleConfirmRejection}
      />
    </div>
  );
};

export default RequestQueue;
