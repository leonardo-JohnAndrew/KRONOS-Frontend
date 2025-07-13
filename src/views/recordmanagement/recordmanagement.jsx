/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useReducer, useState } from "react";
import {
  Search,
  Bell,
  Edit2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { actions, initials, reducer } from "../../functions/formrequest";
import {
  VehicleReservationForm,
  FacilityReservationForm,
  JobRequestForm,
  PurchaseRequestForm,
} from "../requestmanagement/Formcomponents";
import "../requestmanagement/requestmanagement.css";
import axios from "axios";
import cleanData from "../../functions/cleandata";
import formatDate from "../../functions/dateformat";
import { useUserContext } from "../../context/usercontextprovider";
import { Navigate, useNavigate } from "react-router";
import RecordViewModal from "../../components/recordViewModal";

function RecordManagement() {
  // Sample initial data

  const nav = useNavigate();
  const { dateformat, dateTimeFormat } = formatDate();
  const { usertoken, userInfo } = useUserContext();
  const [isModal, setIsModal] = useState(false);
  const [state, dispatch] = useReducer(reducer, initials);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequests, setShowRequests] = useState(true);
  const [requests, setRequests] = useState({});
  const [gsoRequests, setgsoRequests] = useState({});
  const [selectedType, setSelectedType] = useState("All"); // Type filter state
  const [selectedStatus, setSelectedStatus] = useState("All"); // Status filter state
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Set number of items per page
  const Authorization =
    userInfo.userRole === "GSO Officer" ||
    userInfo.userRole === "GSO Director" ||
    userInfo.userRole === "Faculty Adviser" ||
    userInfo.userRole === "Faculty" ||
    userInfo.userRole === "Dean/Head";

  const GSO =
    userInfo.userRole === "GSO Officer" || userInfo.userRole === "GSO Director";
  var statusOptions = ["All", "Vehicle", "Facility", "Job", "Purchase"];

  // Type options for filter bar
  var typeOptions = [
    "All",
    "Pending",
    "OnGoing",
    "Approved",
    "Completed",
    "Rejected",
  ];

  if (GSO) {
    typeOptions = ["All", "OnGoing", "Approved", "Completed", "Rejected"];
  } else if (userInfo.userRole === "Student") {
    statusOptions = ["All", "Vehicle", "Facility"];
  }

  // Status options for dropdown filter

  //fetch record for gso

  const fetchrequests = useCallback(() => {
    const headers = { Authorization: `Bearer ${usertoken}` };
    var role = " ";
    switch (userInfo.userRole) {
      case "GSO Officer":
        role = "officer";
        break;
      case "GSO Director":
        role = "director";
        break;
      default:
        break;
    }
    var apis = " ";
    if (GSO) {
      apis = Promise.all([
        axios.get(`/api/${role}/record/facility-request/all`, { headers }),
        axios.get(`/api/${role}/record/service-request/all`, { headers }),
        axios.get(`/api/${role}/record/job-request/all`, { headers }),
        axios.get(`/api/${role}/record/purchase-request/all`, { headers }),
      ]);
    } else if (!Authorization) {
      apis = Promise.all([
        axios.get(`/api/facility-request/all`, { headers }),
        axios.get(`/api/service-request/all`, { headers }),
      ]);
    } else {
      // Normal users get per-type
      apis = Promise.all([
        axios.get("/api/facility-request/all", { headers }),
        axios.get("/api/service-request/all", { headers }),
        axios.get("/api/job-request/all", { headers }),
        axios.get("/api/purchase-request/all", { headers }),
      ]);
    }
    apis
      .then(([facility, service, job, purchase]) => {
        setRequests({
          facility: cleanData(facility, "noError"),
          service: cleanData(service, "noError"),
          job: Authorization ? cleanData(job, "noError") : [],
          purchase: Authorization ? cleanData(purchase, "noError") : [],
        });
      })
      .catch((err) => console.error("Failed to fetch regular records:", err));
  }, [usertoken, GSO]);
  console.log(requests);
  const allRequests = [
    ...(requests.facility || []),
    ...(requests.service || []),
    ...(requests.job || []),
    ...(requests.purchase || []),
  ];
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
      case "Pending":
        return "Pending";
      case "OnGoing":
        return "OnGoing";
      case "Approved":
        return "Approved";
      case "Completed":
        return "Completed";
      case "Rejected":
        return "Reject";
      default:
        return "All";
    }
  };
  const filteredRequests = allRequests.filter((request) => {
    const matchesType =
      selectedType === "All" ||
      request.remark.toLowerCase() === selectedType.toLowerCase();

    const matchesStatus =
      selectedStatus === "All" ||
      getTypePrefix(request.request_type) === selectedStatus;

    const matchesSearch =
      (request.reqstCODE &&
        request.reqstCODE.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.userid &&
        request.userid.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesStatus && matchesSearch;
  });

  useEffect(() => {
    fetchrequests();
    // console.log(requests);
  }, [fetchrequests, usertoken]);
  // Filter requests based on selected type and search query

  // Handle viewing a request
  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setIsModal(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModal(false);
    setSelectedRequest(null);
  };

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, selectedStatus]);

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
  // Handle creating a new request

  return (
    <div className="app-container">
      <div className="request-management-container">
        {/* Header */}
        <div className="title-container">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="title">
                {GSO ? "Record Management" : "My Records"}
              </h1>
              <p className="subtitle">
                Statuses of request are in this module.
              </p>
            </div>
            {/* Search Bar */}
            <div className="search-container" style={{ width: "300px" }}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by Reference No. or User ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <hr />
        {/* {JSON.stringify(requests)} */}
        {/* Content */}
        <div className="content-container">
          {showRequests ? (
            <>
              {/* Type filter tabs */}
              <div className="tabs-container">
                <div className="tabs">
                  {/* {JSON.stringify.typeOptions} */}
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
              <div className="mb-3">
                <div className="row">
                  <div className="col-md-3">
                    <label
                      htmlFor="statusFilter"
                      className="form-label fw-semibold"
                    >
                      Filter by Request Type:
                    </label>
                    <select
                      id="statusFilter"
                      className="form-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {currentItems.length > 0 ? (
                <div>
                  {/* Request List */}
                  <table className="request-table">
                    <thead className="">
                      <tr className="">
                        <th className="table-head">Type</th>
                        <th className="table-head">Reference No.</th>
                        {GSO && <th className="table-head">From</th>}
                        <th className="table-head">Date Submitted</th>
                        <th className="table-head">Date Needed</th>
                        <th className="table-head">Date Bump</th>
                        <th className="table-head">Status</th>
                        <th className="table-head">View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((request) => (
                        <React.Fragment key={request.id}>
                          <tr>
                            <td className="table-cell">
                              {request.request_type}
                            </td>
                            <td className="table-cell">{request.reqstCODE}</td>
                            {GSO && (
                              <td className="table-cell">
                                {request.user.lastname +
                                  " , " +
                                  request.user.firstname}
                              </td>
                            )}
                            <td className="table-cell">
                              {dateTimeFormat(request.created_at).date}
                            </td>

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

                            <td className="table-cell">
                              {request.dateBump
                                ? dateTimeFormat(request.dateBump).date
                                : "----"}
                            </td>
                            <td className="table-cell">
                              <span
                                className={`status-badge status-${
                                  request.remark.toLowerCase() === "reject"
                                    ? "rejected"
                                    : request.remark.toLowerCase()
                                }`}
                              >
                                {request.remark === "Reject"
                                  ? "Rejected"
                                  : request.remark}
                              </span>
                            </td>
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
            ""
          )}

          {/* Floating Action Button */}
          {/* <div className="fab-container">
            <button
              className="fab"
              onClick={() => {
                nav("/main/content/reservation-forms");
              }}
            >
              <Edit2 size={20} className="fab-icon" />
            </button>
          </div> */}
        </div>
      </div>

      {/* Rejection Reason Modal */}

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
        request={selectedRequest}
      />
    </div>
  );
}

export default RecordManagement;
