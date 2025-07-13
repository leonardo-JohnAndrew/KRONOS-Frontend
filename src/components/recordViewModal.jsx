/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useUserContext } from "../context/usercontextprovider";
import formatDate from "../functions/dateformat";
import "./modal.css";
import axios from "axios";
import cleanData from "../functions/cleandata";
import { _, r } from "fonts/defaultFont";

// A single, generic component to render a form field
const FormField = ({ label, value }) => (
  <div className="form-group">
    <div className="form-label">{label}</div>
    <div className="form-value">{value || "-"}</div>
  </div>
);

// Facility Reservation Form Component
const FacilityReservationForm = ({
  request,
  name,
  dateNeeded,
  isReject,
  reason,
}) => {
  const { dateTimeFormat, dateformat } = formatDate();
  const [formattedDate, setFormattedDate] = useState([]);
  const { usertoken } = useUserContext();
  //console.log(request);

  return (
    <div className="modal-form-grid">
      <div className="form-column">
        <FormField label="Requestor: " value={name} />
        <FormField label="Venue: " value={request.facilities.facilityName} />
        <FormField label="Nature of Activity: " value={request.activityType} />
        <FormField label="Activity: " value={request.activity} />
        <FormField label="Purpose: " value={request.purpose} />
        {isReject && reason && (
          <div className="form-group">
            <label className="form-label">Reason for Rejection:</label>
            <textarea className="form-control" value={reason} readOnly />
          </div>
        )}
      </div>
      <div className="form-column">
        <FormField
          label="Date Submitted"
          value={dateformat(request.created_at)}
        />
        <FormField label="Date Needed: " value={dateNeeded} />
        <FormField label="Date Start: " value={request.activityDateStart} />
        <FormField label=" End: " value={request.activityDateEnd} />
        <FormField label="Special Instruction" value={request.note} />
        <FormField
          label="Materials and Equipment"
          value={request.materials.map((item) => (
            <div key={item.id}>
              {item.materialName} - {item.quantity}
            </div>
          ))}
        />
      </div>
    </div>
  );
};

// Vehicle Reservation Form Component
const VehicleReservationForm = ({
  request,
  name,
  canEdit,
  dateNeeded,
  setVehicleItem,
  isReject,
  reason,
}) => {
  const [vehiclelist, setVehicleList] = useState([]);
  const { usertoken, userInfo } = useUserContext();
  const [updateData, setUpdateData] = useState({
    vehicleID: request.gso_service?.vehicleID || "",
    driver: request.gso_service?.driver || "---",
  });
  //role permmission
  const GSO =
    userInfo.userRole === "GSO Officer" || userInfo.userRole === "GSO Director";
  const vehicleFetch = async () => {
    await axios
      .get(`/api/vehicles/available/${request.reqstCODE}`, {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((response) => {
        const list = cleanData(response, "noError");
        setVehicleList(
          list.filter((n) => Number(n.maxSeat) > Number(request.noOfPassenger))
        );
      })
      .catch((err) => {
        console.log("Error", err);
      });
  };

  useEffect(() => {
    vehicleFetch();
  }, [request.id]);

  // console.log(vehiclelist);
  // update the vehicle
  const update = (e) => {
    const newData = { ...updateData, [e.target.name]: e.target.value };
    setUpdateData(newData);
    setVehicleItem(newData); // updated version sent to parent
  };

  const { dateformat, dateTimeFormat, formatTime } = formatDate();

  return (
    <div className="modal-form-grid">
      <div className="form-column">
        <FormField label="Requestor: " value={name} />
        <FormField
          label="Time of Departure: "
          value={formatTime(request.timeDeparture)}
        />
        <FormField
          label="Timeo
          f Arrival: "
          value={formatTime(request.timeArrival)}
        />

        {(request.gso_service || GSO) && (
          <>
            {canEdit ? (
              <div className="form-group">
                <label className="form-label">Set Driver:</label>
                <input
                  className="form-control"
                  type="text"
                  name="driver"
                  value={updateData.driver}
                  onChange={update}
                  placeholder="Input Driver"
                  required
                />
              </div>
            ) : (
              <FormField
                label="Driver: "
                value={request.gso_service?.driver || "---"}
              />
            )}
            {/* added */}
            {canEdit ? (
              <div className="form-group">
                <label className="form-label">Set Vehicle:</label>
                <select
                  className="form-control"
                  name="vehicleID"
                  value={updateData.vehicleID}
                  onChange={update}
                  required
                >
                  <option value="" disabled>
                    {request.gso_service?.vehicleID
                      ? `${request.gso_service.vehicle.brand} : ${request.gso_service.vehicle.plateNo}`
                      : "Select Vehicle"}
                  </option>

                  {vehiclelist.map((vehicle) => (
                    <option key={vehicle.vehicleID} value={vehicle.vehicleID}>
                      {`${vehicle.brand} : ${vehicle.plateNo} max seat: ${vehicle.maxSeat}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <FormField
                label="Vehicle Plate No: "
                value={
                  request.gso_service?.vehicleID
                    ? `${request.gso_service.vehicle.brand} : ${request.gso_service.vehicle.plateNo}`
                    : "--"
                }
              />
            )}
          </>
        )}

        <FormField label="Destination: " value={request.destination} />
        <FormField label="Purpose: " value={request.purpose} />
      </div>
      <div className="form-column">
        <FormField
          label="Date Submitted: "
          value={dateformat(request.created_at)}
        />
        <FormField label="Date Needed: " value={dateNeeded} />
        <FormField label="No. of Passenger: " value={request.noOfPassenger} />
        <FormField label="Passengers: " value={request.passengerName} />
        {request.file_url && (
          <a
            href={request.file_url}
            download
            style={{ color: "darkblue", textShadow: "2px 4px lightblue" }}
          >
            {"Travel Order"}
          </a>
        )}
        {isReject && reason && (
          <div className="form-group">
            <label className="form-label">Reason for Rejection:</label>
            <textarea className="form-control" value={reason} readOnly />
          </div>
        )}
      </div>
    </div>
  );
};

// Job Request Form Component
const JobRequestForm = ({
  request,
  name,
  canEdit,
  dateNeeded,
  setJobItems,
  jobItems,
  isReject,
  reason,
}) => {
  const { dateformat } = formatDate();
  const [items, setItems] = useState({
    items: request.joblist,
    remove: [],
  });
  const handleUpdate = async (indexToUpdate, e, columname) => {
    const value =
      columname === "quantity" ? Number(e.target.value) : e.target.value;
    setItems((prev) => ({
      ...prev,
      items: prev.items.map((row, i) =>
        i === indexToUpdate ? { ...row, [columname]: value } : row
      ),
    }));
  };
  const handleRemoveRow = (indexToRemove) => {
    const itemsRemove = items.items.find((_, i) => i === indexToRemove);
    // console.log(itemsRemove.id);
    addToRemove(itemsRemove.id);
    setItems((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== indexToRemove),
    }));
  };
  const addToRemove = async (item) => {
    setItems((prevState) => ({
      ...prevState,
      remove: [...prevState.remove, item],
    }));
  };

  useEffect(() => {
    setJobItems(items);
  }, [items]);
  return (
    <>
      <div className="modal-form-grid">
        <div className="form-column">
          <FormField label="Requestor: " value={name} />
          <FormField
            label="Date Submitted: "
            value={dateformat(request.created_at)}
          />
          <FormField label="Date Needed" value={request.dateNeeded} />
        </div>
        <div className="form-column">
          <FormField label="Purpose: " value={request.purpose} />
          <FormField
            label="Date Completed: "
            value={
              request.dateCompleted ? dateformat(request.dateCompleted) : "---"
            }
          />
        </div>
        <div className="modal-particulars-section">
          <table className="modal-particulars-table">
            <thead>
              <tr>
                <th>Particulars</th>
                <th>Qty</th>
                <th>Nature of Works</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {items.items && items.items.length > 0 ? (
                items.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {canEdit ? (
                        <input
                          className="form-control"
                          value={item.particulars}
                          onChange={(e) => {
                            handleUpdate(index, e, "particulars");
                          }}
                        />
                      ) : (
                        item.particulars
                      )}
                    </td>
                    <td>
                      {canEdit ? (
                        <input
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => {
                            handleUpdate(index, e, "quantity");
                          }}
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td>
                      {canEdit ? (
                        <input
                          className="form-control"
                          value={item.natureofWork}
                          onChange={(e) => {
                            handleUpdate(index, e, "natureofWork");
                          }}
                        />
                      ) : (
                        item.natureofWork
                      )}
                    </td>
                    <td>
                      {canEdit ? (
                        <input
                          className="form-control"
                          value={item.jbrqremarks}
                          onChange={(e) => {
                            handleUpdate(index, e, "jbrqremarks");
                          }}
                        />
                      ) : (
                        item.jbrqremarks
                      )}
                    </td>
                    {canEdit && (
                      <td>
                        <button
                          className="form-control"
                          onClick={(e) => handleRemoveRow(index)}
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isReject && reason && (
          <div className="form-group">
            <label className="form-label">Reason for Rejection:</label>
            <textarea className="form-control" value={reason} readOnly />
          </div>
        )}
      </div>
    </>
  );
};

// Purchase Request Form Component
const PurchaseRequestForm = ({
  request,
  name,
  canEdit,
  dateNeeded,
  updated,
  setPurchaseItems,
  isReject,
  reason,
}) => {
  // console.log(request.material);
  const { dateformat } = formatDate();
  const [items, setItems] = useState({
    items: request.material,
    remove: [],
  });
  const handleUpdate = async (indexToUpdate, e, columname) => {
    const value =
      columname === "quantity" ? Number(e.target.value) : e.target.value;
    setItems((prev) =>
      prev.map((row, i) =>
        i === indexToUpdate ? { ...row, [columname]: value } : row
      )
    );
  };

  useEffect(() => {
    setPurchaseItems(items);
  }, [items]);
  const handleRemoveRow = (indexToRemove) => {
    const itemsRemove = items.items.find((_, i) => i === indexToRemove);
    addToRemove(itemsRemove.id);
    setItems((prev) => ({
      ...prev,
      items: prev.filter((_, i) => i !== indexToRemove),
    }));
  };
  const addToRemove = async (item) => {
    setItems((prevState) => ({
      ...prevState,
      remove: [...prevState.remove, item],
    }));
  };

  return (
    <>
      <div className="modal-form-grid">
        <div className="form-column">
          <FormField label="Requestor: " value={name} />
          <FormField label="Category: " value={request.category || "---"} />
          <FormField label="Purpose: " value={request.purpose} />
        </div>
        <div className="form-column">
          <FormField
            label="Date Submitted"
            value={dateformat(request.created_at)}
          />
          <FormField label="Date Needed" value={request.dateNeeded} />
        </div>
      </div>
      <div className="modal-particulars-section">
        <table className="modal-particulars-table">
          <thead>
            <tr>
              <th className="qty-column">Qty</th>
              <th> Particulars / Item Description / Specifications</th>
            </tr>
          </thead>
          <tbody>
            {items.items && items.items.length > 0 ? (
              items.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    {canEdit ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          handleUpdate(index, e, "quantity");
                        }}
                        className="form-control"
                      />
                    ) : (
                      item.quantity || "--"
                    )}
                  </td>
                  <td>
                    {canEdit ? (
                      <input
                        type="text"
                        value={item.materialName}
                        onChange={(e) => {
                          handleUpdate(index, e, "materialName");
                        }}
                        className="form-control"
                      />
                    ) : (
                      item.materialName || "--"
                    )}
                  </td>
                  {canEdit && (
                    <td>
                      <button
                        className="form-control"
                        onClick={() => handleRemoveRow(index)}
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">-</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {isReject && reason && (
        <div className="form-group">
          <label className="form-label">Reason for Rejection:</label>
          <textarea className="form-control" value={reason} readOnly />
        </div>
      )}
    </>
  );
};

// Main Modal Component
const RecordViewModal = ({
  isOpen,
  onClose,
  approval,
  handleApprovalRequest,
  handleConfirmRejection,
  request,
  isAdd,
}) => {
  // alert(approval);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [result, setResult] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { usertoken, userInfo } = useUserContext();
  const [vehicleItem, setVehicleItem] = useState(null);
  const [purchaseItem, setPurchaseItems] = useState(null);
  const [jobItems, setJobItems] = useState(null);
  //  console.log(request);
  const myRequest = request && request.user?.userid === userInfo.userid;

  useEffect(() => {
    if (request) {
      axios
        .post(
          "/api/notification/officer",
          {
            reqstCODE: request.reqstCODE,
          },
          {
            headers: {
              Authorization: `Bearer ${usertoken}`,
            },
          }
        )
        .then((res) => {})
        .catch((e) => {
          console.log("error", e);
        });
    }
  }, [request]);
  const forApproval =
    userInfo.userRole === "Faculty Adviser" ||
    userInfo.userRole === "Dean/Head";
  const GSO =
    userInfo.userRole === "GSO Officer" ||
    usertoken.userRole === "GSO Director";
  const canEdit =
    approval &&
    (userInfo.userRole === "GSO Officer" ||
      userInfo.userRole === "GSO Director");
  if (!isOpen || !request) return null;
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
  const handleBump = async (id) => {
    // bump
    // alert(id);
    // alert(id);
    await axios
      .post(
        `/api/bump/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      )
      .then((res) => {
        alert(cleanData(res, "noError").message);
      })
      .catch((err) => {
        console.error("Failed to Bump", err);
      });
  };

  const getFormForType = () => {
    const name = request.user.lastname + " , " + request.user.firstname;
    switch (request.request_type) {
      case "VR":
        return (
          <VehicleReservationForm
            request={request.service_request}
            _request
            name={name}
            reason={request.reason || ""}
            isReject={request.remark === "Reject" ? true : false}
            dateNeeded={request.dateNeeded}
            canEdit={canEdit}
            setVehicleItem={setVehicleItem}
          />
        );
      case "FR":
        return (
          <FacilityReservationForm
            request={request.facility_request}
            name={name}
            reason={request.reason || ""}
            isReject={request.remark === "Reject" ? true : false}
            dateNeeded={request.dateNeeded}
            canEdit={canEdit}
          />
        );
      case "JR":
        return (
          <JobRequestForm
            request={request.job_request}
            name={name}
            dateNeeded={request.dateNeeded}
            canEdit={canEdit}
            reason={request.reason || ""}
            isReject={request.remark === "Reject" ? true : false}
            jobItems={jobItems}
            setJobItems={setJobItems}
          />
        );
      case "PR":
        return (
          <PurchaseRequestForm
            request={request.purchase_request}
            reason={request.reason || ""}
            isReject={request.remark === "Reject" ? true : false}
            name={name}
            dateNeeded={request.dateNeeded}
            canEdit={canEdit}
            setPurchaseItems={setPurchaseItems}
          />
        );
      default:
        return <div>Unknown request type</div>;
    }
  };

  const getFormTitle = () => {
    switch (request.request_type) {
      case "VR":
        return "Vehicle Reservation Form";
      case "FR":
        return "Facility Reservation Form";
      case "JR":
        return "Job Request Form";
      case "PR":
        return "Purchase Requisition Form";
      default:
        return "Request Form";
    }
  };
  // Handle opening the rejection modal
  const handleOpenRejectionModal = () => {
    setShowRejectionModal(true);
  };

  const handleComplete = () => {
    axios
      .post(`/api/mark-completed/${request.id}`, "", {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((response) => {
        alert(cleanData(response, "noError").message);
      })
      .catch((error) => {
        console.log("error: ", error);
      });
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container view-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{getFormTitle()}</h2>
          <div className="modal-reference-number">{request.reqstCODE}</div>
        </div>
        <div className="modal-form-content">{getFormForType()}</div>
        <div className="modal-footer">
          {!approval &&
            (request.remark === "Ongoing" || request.remark === "Pending") &&
            myRequest &&
            userInfo.userRole !== "GSO Director" && (
              <button
                className="modal-bump-button"
                onClick={() => handleBump(request.id)}
              >
                Bump
              </button>
            )}

          {/* APPROVE / REJECT BUTTON */}
          {approval && !myRequest && request.remark !== "Approved" && (
            <>
              <button
                className="approve-button"
                onClick={() => {
                  handleApprovalRequest(request.request_type, request.id, {
                    job: jobItems,
                    purchase: purchaseItem,
                    vehicle: vehicleItem ?? {},
                  });
                }}
              >
                Approve
              </button>
              <button
                className="rejects-button"
                onClick={handleOpenRejectionModal}
              >
                Rejected
              </button>
            </>
          )}
          {request.remark === "Approved" && (
            <button className="complete-button" onClick={handleComplete}>
              Complete
            </button>
          )}
          <button className="modal-close-button" onClick={onClose}>
            Close
          </button>

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
                    onClick={() => {
                      handleConfirmRejection(rejectionReason);
                    }}
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
                  +
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordViewModal;
