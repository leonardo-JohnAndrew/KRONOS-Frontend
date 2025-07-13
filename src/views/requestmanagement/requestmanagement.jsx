/* eslint-disable no-unused-vars */
import React, {
  use,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  Search,
  Bell,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
  AArrowDown,
  ChevronDown,
} from "lucide-react";
import { actions, initials, reducer } from "../../functions/formrequest";
import {
  VehicleReservationForm,
  FacilityReservationForm,
  JobRequestForm,
  PurchaseRequestForm,
} from "./Formcomponents";
import "./requestmanagement.css";
import axios from "axios";
import cleanData from "../../functions/cleandata";
import formatDate from "../../functions/dateformat";
import { useUserContext } from "../../context/usercontextprovider";
import { useNavigate } from "react-router";
import RecordViewModal from "../../components/recordViewModal";
// import { getDomainOfDataByKey } from "recharts/types/util/ChartUtils";

function RequestManagement() {
  // Sample initial data

  // State management
  const [requests, setRequests] = useState([]);
  const [result, setResult] = useState();
  const nav = useNavigate();
  const [formData, setFormData] = useState(null);
  const { dateformat, dateTimeFormat } = formatDate();
  const { usertoken, userInfo } = useUserContext();
  const [state, dispatch] = useReducer(reducer, initials);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequests, setShowRequests] = useState(true);
  const [selectedType, setSelectedType] = useState("All"); // Type filter state
  const [selectedStatus, setSelectedStatus] = useState("All"); // Status filter state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRead, setRead] = useState(true);
  const [isGSO, setGSO] = useState(false);
  const [isModal, setModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  // Type options for filter bar
  const [typeOptions, setTypeOptions] = useState([]);
  // Status options for filter dropdown
  const [statusOptions, setStatusOptions] = useState([]);

  // alert(userInfo.userRole);
  useEffect(() => {
    if (userInfo.userRole === "Faculty Adviser") {
      setTypeOptions(["All", "Vehicle", "Facility"]);
    } else {
      setTypeOptions(["All", "Vehicle", "Facility", "Job", "Purchase"]);
    }
    if (
      userInfo.userRole === "GSO Officer" ||
      userInfo.userRole === "GSO Director"
    ) {
      setRead(false);
      setGSO(true);
    }
  }, []);

  //call all records

  //facility_request
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
  const fetchrequests = useCallback(() => {
    const userrole = role(userInfo.userRole);
    const isAuthorized =
      userInfo.userRole === `Dean/Head` ||
      userInfo.userRole === "GSO Officer" ||
      userInfo.userRole === "GSO Director";
    const requests = [
      axios.get(`/api/${userrole}/service-request/view`, {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
      axios.get(`/api/${userrole}/facility-request/view`, {
        headers: { Authorization: `Bearer ${usertoken}` },
      }),
    ];

    if (isAuthorized) {
      requests.push(
        axios.get(`/api/${userrole}/job-request/view`, {
          headers: { Authorization: `Bearer ${usertoken}` },
        }),

        axios.get(`/api/${userrole}/purchase-request/view`, {
          headers: { Authorization: `Bearer ${usertoken}` },
        })
      );
    }

    Promise.all(requests)
      .then(([facility, service, job, purchase]) => {
        // console.log (facility, service, job, purchase);
        const allRequestsData = {
          facility: cleanData(facility, "noError"),
          service: cleanData(service, "noError"),
          job: isAuthorized ? cleanData(job, "noError") : [],
          purchase: isAuthorized ? cleanData(purchase, "noError") : [],
        };

        setRequests(allRequestsData);

        // Extract unique status values for the status filter
        const allRequestsList = [
          ...allRequestsData.facility,
          ...allRequestsData.service,
          ...allRequestsData.job,
          ...allRequestsData.purchase,
        ];

        const uniqueStatuses = [
          ...new Set(allRequestsList.map((req) => req.remark)),
        ];
        setStatusOptions(["All", ...uniqueStatuses]);

        //console.log(requests);
      })
      .catch((err) => {
        console.log("Failed to fetch requests:", err);
      });
  }, [usertoken]);

  useEffect(() => {
    fetchrequests();
    // console.log(requests);
  }, [fetchrequests, typeOptions]);

  // Filter requests based on selected type, status, and search query
  const allRequests = [
    ...(requests.facility || []),
    ...(requests.service || []),
    ...(requests.job || []),
    ...(requests.purchase || []),
  ];

  const sorted = allRequests.sort((a, b) => {
    const aHasBump = !!a.dateBump;
    const bHasBump = !!b.dateBump;

    if (aHasBump && bHasBump) {
      // Both have bump — sort by dateBump
      return new Date(a.dateBump) - new Date(b.dateBump);
    }

    if (aHasBump) return -1; // a comes first
    if (bHasBump) return 1; // b comes first

    // Neither has bump — sort by dateNeeded or created_at
    const dateA = new Date(a.dateNeeded ?? a.created_at);
    const dateB = new Date(b.dateNeeded ?? b.created_at);

    return dateA - dateB;
  });

  const filteredRequests = allRequests.filter((request) => {
    const matchesType =
      selectedType === "All" || request.request_type === selectedType;
    const matchesStatus =
      selectedStatus === "All" || request.remark === selectedStatus;
    const matchesSearch =
      request.reqstCODE.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userid.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  // Handle viewing a request
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    // console.log(request);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setSelectedRequest(null);
    fetchrequests();
  };

  // Handle adding new particulars
  const handleAddParticulars = () => {
    if (selectedRequest) {
      const updatedRequest = {
        ...selectedRequest,
        particulars: [...selectedRequest.particulars, { qty: "", details: "" }],
      };
      setSelectedRequest(updatedRequest);

      // Update in the main requests list
      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id ? updatedRequest : req
        )
      );
    }
  };

  // Handle updating particulars
  const handleParticularsChange = (index, field, value) => {
    if (selectedRequest) {
      const updatedParticulars = [...selectedRequest.particulars];
      updatedParticulars[index] = {
        ...updatedParticulars[index],
        [field]: value,
      };

      const updatedRequest = {
        ...selectedRequest,
        particulars: updatedParticulars,
      };

      setSelectedRequest(updatedRequest);

      // Update in the main requests list
      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id ? updatedRequest : req
        )
      );
    }
  };

  // Handle field change for form inputs
  const handleFieldChange = (field, value) => {
    if (selectedRequest) {
      const updatedRequest = {
        ...selectedRequest,
        [field]: value,
      };

      setSelectedRequest(updatedRequest);

      // Update in the main requests list
      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id ? updatedRequest : req
        )
      );
    }
  };

  // Handle approving a request
  // Handle approving a request
  const handleApprovalRequest = async (type, id, items = {}) => {
    //console.log(items);
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
            canEdit: "edit",
            joblist: items.job,
          };
          break;
        case "VR":
          if (!items.vehicle.driver || !items.vehicle.vehicleID) {
            alert(
              "Driver and Vehicle are required before approving this request."
            );
            return; //
          }
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
          setResult(jsonData.message);
          console.log(jsonData);
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
          setResult(`Validation Error:\n${validationErrors}`);
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

    fetchrequests();
  };

  // // Handle opening the rejection modal
  // const handleOpenRejectionModal = () => {
  //   setShowRejectionModal(true);
  // };

  // Handle confirming rejection with reason
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

    setShowRejectionModal(false);
    setRejectionReason("");
    setModal(false);

    setSelectedRequest("");
  };

  // Handle canceling rejection
  const handleCancelRejection = () => {
    setShowRejectionModal(false);
    setRejectionReason("");
  };

  // Handle creating a new request
  const handleNewRequest = () => {
    // Get the next ID
    const newId =
      requests.length > 0 ? Math.max(...requests.map((r) => r.id)) + 1 : 1;

    // Create appropriate reference number based on selected type
    const type = "Job"; // Default type
    const typePrefix = getTypePrefix(type);
    const newReferenceNo = `OSO-${typePrefix}-${String(newId).padStart(
      4,
      "0"
    )}`;

    const newRequest = {
      id: newId,
      type: type,
      referenceNo: newReferenceNo,
      from: "",
      dateSubmitted: new Date().toLocaleDateString(),
      dateNeeded: "",
      status: "Pending",
      natureOfWork: "",
      dateCompleted: "",
      particulars: [{ qty: "", details: "" }],
    };

    setSelectedRequest(newRequest);
    setShowRequests(false);
  };

  // Helper function to get type prefix
  const getTypePrefix = (type) => {
    switch (type) {
      case "Vehicle":
        return "VR";
      case "Facility":
        return "FR";
      case "Purchase":
        return "PR";
      case "Job":
        return "JR";
      case "VR":
        return "Vehicle";
      case "FR":
        return "Facility";
      case "PR":
        return "Purchase";
      case "JR":
        return "Job";
      default:
        return "All";
    }
  };

  // Handle saving a new request
  const handleSaveNewRequest = () => {
    if (selectedRequest) {
      let requestToSave = { ...selectedRequest };

      // If this is a new request, add it
      if (!requests.find((r) => r.id === selectedRequest.id)) {
        setRequests([...requests, requestToSave]);
      } else {
        // Otherwise update the existing request
        setRequests(
          requests.map((req) =>
            req.id === requestToSave.id ? requestToSave : req
          )
        );
      }
    }
    setShowRequests(true);
  };

  // Handle type change in new request form
  const handleTypeChange = (type) => {
    if (selectedRequest) {
      setSelectedRequest({
        ...selectedRequest,
        type: type,
      });
    }
  };

  // Render the appropriate form based on request type
  const renderRequestForm = (request, readOnly = true, name) => {
    switch (request.request_type) {
      case "VR":
        return (
          <VehicleReservationForm
            request={request.service_request}
            name={request.user.lastname + ", " + request.user.lastname}
            onFieldChange={handleFieldChange}
            readOnly={isRead}
          />
        );
      case "FR":
        return (
          <FacilityReservationForm
            name={request.user.lastname + " , " + request.user.lastname}
            request={request.facility_request}
            onFieldChange={handleFieldChange}
            readOnly={readOnly}
          />
        );
      case "PR":
        return (
          <PurchaseRequestForm
            request={request}
            onFieldChange={handleFieldChange}
            readOnly={readOnly}
            onAddParticulars={handleAddParticulars}
          />
        );
      case "JR":
        return (
          <JobRequestForm
            request={request}
            onFieldChange={handleFieldChange}
            readOnly={readOnly}
            onAddParticulars={handleAddParticulars}
          />
        );
      default:
        return "Unknown Request Type";
    }

    // Reset to page 1 whenever filters change
  };
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedStatus, searchQuery]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  // Handle changing pages
  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="app-container">
      <div className="request-management-container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="title-container">
            <h1 className="title">
              {isRead ? "Recommending Approval" : "Request Management"}
            </h1>
            <p className="subtitle">Statuses of request are in this module.</p>
          </div>

          {/* Search Bar */}
          <div className="search-container" style={{ minWidth: "300px" }}>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by reference number or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  boxShadow: "none",
                  borderColor: "#dee2e6",
                }}
              />
              {searchQuery && (
                <button
                  className="btn btn-outline-secondary border-start-0"
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{ borderColor: "#dee2e6" }}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* <hr className="divider" /> */}
        <hr />

        {/* Content */}
        <div className="content-container">
          {showRequests ? (
            <>
              {/* Type filter tabs */}
              <div className="tabs-container mb-3">
                <div className="tabs">
                  {typeOptions.map((type, index) => (
                    <button
                      key={type}
                      className={`tab ${
                        selectedType === getTypePrefix(type) ? "active" : ""
                      } ${index === 0 ? "tab-first" : ""} ${
                        index === typeOptions.length - 1 ? "tab-last" : ""
                      }`}
                      onClick={() => setSelectedType(getTypePrefix(type))}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status filter dropdown */}
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label small text-muted mb-1">
                    Filter by Status
                  </label>
                  <div className="dropdown">
                    <select
                      className="form-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderColor: "#dee2e6",
                        fontSize: "0.875rem",
                      }}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="d-flex justify-content-end align-items-end h-100">
                    <small className="text-muted">
                      Showing {filteredRequests.length} of {allRequests.length}{" "}
                      requests
                    </small>
                  </div>
                </div>
              </div>

              {currentItems.length > 0 ? (
                <div>
                  {/* Request List */}
                  <table className="request-table">
                    <thead className="">
                      <tr className="">
                        {/* <th className="table-head checkbox-cell"></th> */}
                        <th className="table-head">Type</th>
                        <th className="table-head">Reference No.</th>
                        <th className="table-head">From</th>
                        <th className="table-head">Date Submission</th>
                        <th className="table-head">Date Needed</th>
                        {/* <th className="table-head">Date Bump</th> */}
                        <th className="table-head">Status</th>
                        <th className="table-head">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((request) => (
                        <React.Fragment key={request.id}>
                          <tr>
                            {/* 1 */}
                            {/* <td className="table-cell checkbox-cell">
                                                            <input
                                                                type="checkbox"
                                                                className="checkbox"
                                                            />
                                                        </td> */}
                            {/* 2 */}
                            <td className="table-cell">
                              {request.request_type}
                            </td>
                            {/* 3 */}
                            <td className="table-cell">{request.reqstCODE}</td>
                            {/* 4 */}
                            <td className="table-cell">
                              {request.user.lastname +
                                " , " +
                                request.user.firstname}
                            </td>
                            {/* 5 */}
                            <td className="table-cell">
                              {dateformat(request.created_at)}
                            </td>

                            {/* 6 */}
                            <td className="table-cell">
                              {
                                dateTimeFormat(
                                  request.facility_request?.activityDateStart ??
                                    request.service_request?.dateNeeded ??
                                    request.job_request?.dateNeeded ??
                                    request.purchase_request?.dateNeeded
                                ).date
                              }
                            </td>

                            {/* <td className="table-cell">
                              {request.dateBump
                                ? dateTimeFormat(request.dateBump).date
                                : "----"}
                            </td> */}
                            {/* 7 */}
                            <td className="table-cell">
                              <span
                                className={`status-badge status-${request.remark.toLowerCase()}`}
                              >
                                {request.remark}
                              </span>
                            </td>
                            {/* 8 */}
                            <td className="table-cell">
                              <button
                                className="view-button"
                                onClick={() => handleViewRequest(request)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">No requests found.</div>
              )}
            </>
          ) : (
            <div className="new-request-form">
              <h2 className="form-title">
                New {selectedRequest?.type} Request Form
              </h2>
              <div className="reference-number">
                {selectedRequest?.referenceNo}
              </div>

              <div className="form-type-selector-container">
                <div className="form-label">Request Type:</div>
                <div className="form-type-selector">
                  {typeOptions
                    .filter((type) => type !== "All")
                    .map((type) => (
                      <button
                        key={type}
                        className={`type-selector-button ${
                          selectedRequest?.type === type ? "active" : ""
                        }`}
                        onClick={() => handleTypeChange(type)}
                      >
                        {type}
                      </button>
                    ))}
                </div>
              </div>

              {/* Render the appropriate form based on the selected type */}
              {selectedRequest && renderRequestForm(selectedRequest, false)}

              <div className="action-buttons">
                <button
                  className="approve-button"
                  onClick={handleSaveNewRequest}
                >
                  Save
                </button>
                <button
                  className="reject-button"
                  onClick={() => setShowRequests(true)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredRequests.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing{" "}
            <span>
              {Math.min(indexOfFirstItem + 1, filteredRequests.length)}
            </span>{" "}
            to <span>{Math.min(indexOfLastItem, filteredRequests.length)}</span>{" "}
            of <span>{filteredRequests.length}</span> results
          </div>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-link"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="page-link"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <RecordViewModal
        isOpen={isModal}
        onClose={closeModal}
        handleApprovalRequest={handleApprovalRequest}
        handleConfirmRejection={handleConfirmRejection}
        approval={true}
        request={selectedRequest}
      />
    </div>
  );
}

export default RequestManagement;
