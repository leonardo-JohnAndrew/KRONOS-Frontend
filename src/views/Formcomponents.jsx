import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { actions, initials, reducer } from "../../functions/formrequest";
import axios from "axios";
import { useUserContext } from "../../context/usercontextprovider";
import cleanData from "../../functions/cleandata";
import formatDate from "../../functions/dateformat";

// Vehicle Reservation Form Component
export const VehicleReservationForm = ({
    name,
    request,
    onFieldChange,
    readOnly,
}) => {
    return (
        <div className="form-grid">
            <div className="form-left">
                <div className="form-group">
                    <div className="form-label">Requestor:</div>
                    {readOnly ? (
                        <div className="form-value">{name || "-"}</div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={name || ""}
                            onChange={(e) =>
                                onFieldChange("requestor", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Time of Departure:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.timeDeparture || "-"}
                        </div>
                    ) : (
                        <input
                            type="time"
                            className="text-input"
                            value={request.timeDeparture || ""}
                            onChange={(e) =>
                                onFieldChange("departureTime", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Time of Arrival:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.timeArrival || "-"}
                        </div>
                    ) : (
                        <input
                            type="time"
                            className="text-input"
                            value={request.timeArrival || ""}
                            onChange={(e) =>
                                onFieldChange("arrivalTime", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Driver:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.gso_service.driver || "-"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.gso_service.driver || ""}
                            onChange={(e) =>
                                onFieldChange("driver", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Destination:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.destination || "-"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.destination || ""}
                            onChange={(e) =>
                                onFieldChange("destination", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Purpose:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.purpose || "-"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.purpose || ""}
                            onChange={(e) =>
                                onFieldChange("purpose", e.target.value)
                            }
                        />
                    )}
                </div>
            </div>
            <div className="form-right">
                <div className="form-group">
                    <div className="form-label">Date Submitted:</div>
                    <div className="form-value">
                        {request.created_at || "-"}
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-label">Date Needed:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.dateNeeded || "-"}
                        </div>
                    ) : (
                        <input
                            type="date"
                            className="date-input"
                            value={request.dateNeeded || ""}
                            onChange={(e) =>
                                onFieldChange("dateNeeded", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">No. of Passengers:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.noOfPassenger || "-"}
                        </div>
                    ) : (
                        <input
                            type="number"
                            className="text-input"
                            value={request.noOfPassenger || ""}
                            onChange={(e) =>
                                onFieldChange("passengerCount", e.target.value)
                            }
                            min="1"
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Passengers:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.passengerName || "-"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.passengerName || ""}
                            onChange={(e) =>
                                onFieldChange("passengers", e.target.value)
                            }
                            placeholder="Comma separated list of names"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Facility Reservation Form Component
export const FacilityReservationForm = ({
    request,
    onFieldChange,
    readOnly,
    name,
}) => {
    const [state, dispatch] = useReducer(reducer, initials);
    const { dateTimeFormat, dateformat } = formatDate();
    const [formattedDate, setFormattedDate] = useState([]);
    const { usertoken } = useUserContext();

    useEffect(() => {
        setFormattedDate({
            start: dateTimeFormat(request.activityDateStart),
            end: dateTimeFormat(request.activityDateEnd),
        });
    }, [request]);
    const venue = useCallback(() => {
        if (!state) return; // Prevent running if state is undefined

        axios
            .get(`/api/venue`, {
                headers: { Authorization: `Bearer ${usertoken}` },
            })
            .then((res) => {
                const jsonData = cleanData(res, "noError");

                if (!jsonData.facility || !Array.isArray(jsonData.facility)) {
                    return;
                }

                dispatch({
                    type: actions.fetch_success,
                    payload: jsonData.facility,
                });

                // console.log("Dispatched Data:", jsonData.facility);
            })
            .catch((error) => {
                console.error(" Error:", error);
            });
    }, []);

    const hasFetched = useRef(false);
    useEffect(() => {
        if (!hasFetched.current) {
            venue();
            hasFetched.current = true;
        }
    }, []);
    return (
        <div className="form-grid">
            <div className="form-left">
                <div className="form-group">
                    <div className="form-label">Requestor:</div>

                    <div className="form-value">{name || "-"}</div>
                </div>
                <div className="form-group">
                    <div className="form-label">Venue:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.facilities.facilityName || "-"}
                        </div>
                    ) : (
                        <select
                            required
                            name="facilityID"
                            // onChange={}
                            // value={formData.facilityID}
                        >
                            <option>{request.facilities.facilityName}</option>
                            {state.items.length > 0 ? (
                                state.items.map((venue, index) => (
                                    <option
                                        key={index}
                                        value={venue.facilityID}
                                    >
                                        {venue.facilityName}
                                    </option>
                                ))
                            ) : (
                                <option>VENUE...</option>
                            )}
                        </select>
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Nature of Activity:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.activityType || "-"}
                        </div>
                    ) : (
                        <select
                            // value={formData.activityType}
                            name="activityType"
                            // onChange={handleChange}
                        >
                            <option>{request.activityType}</option>
                            <option value="Curricular">Curricular</option>
                            <option value="Co-Curricular">Co-Curricular</option>
                            <option value="Extra-Curricular">
                                Extra-Curricular
                            </option>
                        </select>
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Activity:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.activity || "-"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.activity || ""}
                            onChange={(e) =>
                                onFieldChange("activity", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Purpose:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.purpose || "-"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.purpose || ""}
                            onChange={(e) =>
                                onFieldChange("purpose", e.target.value)
                            }
                        />
                    )}
                </div>
            </div>
            <div className="form-right">
                <div className="form-group">
                    <div className="form-label">Date Submitted:</div>
                    <div className="form-value">
                        {dateformat(request.dateSubmit) || "-"}
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-label">Date Needed:</div>
                    <div className="form-value">
                        {formattedDate.start.date +
                            " - " +
                            formattedDate.end.date || "-"}
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-label">Time Start:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {formattedDate.start.time +
                                " - " +
                                formattedDate.end.time || "-"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            // value={request.timeStart || ""}
                            onChange={(e) =>
                                onFieldChange("timeStart", e.target.value)
                            }
                            placeholder="e.g. 8:00 am - 5:00 pm"
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Special Instruction:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.note || "N/A"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.note || ""}
                            onChange={(e) =>
                                onFieldChange(
                                    "specialInstruction",
                                    e.target.value
                                )
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Materials and Equipment:</div>
                    ld;lad; {request.materials}
                    {readOnly ? (
                        request.materials.map((item, index) => {
                            <div key={item.id}>
                                {item.materialName} - {item.quantity}
                            </div>;
                        })
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            // value={request.materialsEquipment || ""}
                            onChange={(e) =>
                                onFieldChange(
                                    "materialsEquipment",
                                    e.target.value
                                )
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// Job Request Form Component
export const JobRequestForm = ({
    request,
    onFieldChange,
    readOnly,
    onAddParticulars,
}) => {
    return (
        <div className="form-grid">
            <div className="form-left">
                <div className="form-group">
                    <div className="form-label">Date Submitted:</div>
                    <div className="form-value">
                        {request.dateSubmitted || "-"}
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-label">Date Needed:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.dateNeeded || "-"}
                        </div>
                    ) : (
                        <input
                            type="date"
                            className="date-input"
                            value={request.dateNeeded || ""}
                            onChange={(e) =>
                                onFieldChange("dateNeeded", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Date Completed:</div>
                    <div className="form-value">
                        {request.dateCompleted || "-"}
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-label">Nature of Work:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.natureOfWork || "-"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.natureOfWork || ""}
                            onChange={(e) =>
                                onFieldChange("natureOfWork", e.target.value)
                            }
                        />
                    )}
                </div>
            </div>
            <div className="form-right">
                <table className="particulars-table">
                    <thead>
                        <tr>
                            <th className="particulars-header">Qty</th>
                            <th className="particulars-header">Particulars</th>
                        </tr>
                    </thead>
                    <tbody>
                        {request.particulars.map((item, index) => (
                            <tr key={index}>
                                <td className="particulars-cell">
                                    {readOnly ? (
                                        <div className="form-value">
                                            {item.qty || "-"}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            className="qty-input"
                                            value={item.qty}
                                            onChange={(e) =>
                                                onFieldChange(
                                                    "particulars",
                                                    request.particulars.map(
                                                        (p, i) =>
                                                            i === index
                                                                ? {
                                                                      ...p,
                                                                      qty: e
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : p
                                                    )
                                                )
                                            }
                                        />
                                    )}
                                </td>
                                <td className="particulars-cell">
                                    {readOnly ? (
                                        <div className="form-value">
                                            {item.details || "-"}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            className="details-input"
                                            value={item.details}
                                            onChange={(e) =>
                                                onFieldChange(
                                                    "particulars",
                                                    request.particulars.map(
                                                        (p, i) =>
                                                            i === index
                                                                ? {
                                                                      ...p,
                                                                      details:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : p
                                                    )
                                                )
                                            }
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!readOnly && (
                    <button
                        className="add-item-button"
                        onClick={onAddParticulars}
                    >
                        + Add item
                    </button>
                )}
            </div>
        </div>
    );
};

// Purchase Request Form Component
export const PurchaseRequestForm = ({
    request,
    onFieldChange,
    readOnly,
    onAddParticulars,
}) => {
    return (
        <div className="form-grid">
            <div className="form-left">
                <div className="form-group">
                    <div className="form-label">From:</div>
                    {readOnly ? (
                        <div className="form-value">{request.from || "-"}</div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.from || ""}
                            onChange={(e) =>
                                onFieldChange("from", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Date Submitted:</div>
                    <div className="form-value">
                        {request.dateSubmitted || "-"}
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-label">Date Needed:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.dateNeeded || "-"}
                        </div>
                    ) : (
                        <input
                            type="date"
                            className="date-input"
                            value={request.dateNeeded || ""}
                            onChange={(e) =>
                                onFieldChange("dateNeeded", e.target.value)
                            }
                        />
                    )}
                </div>
                <div className="form-group">
                    <div className="form-label">Nature of Work:</div>
                    {readOnly ? (
                        <div className="form-value">
                            {request.natureOfWork || "-"}
                        </div>
                    ) : (
                        <input
                            type="text"
                            className="text-input"
                            value={request.natureOfWork || ""}
                            onChange={(e) =>
                                onFieldChange("natureOfWork", e.target.value)
                            }
                        />
                    )}
                </div>
            </div>
            <div className="form-right">
                <table className="particulars-table">
                    <thead>
                        <tr>
                            <th className="particulars-header">Qty</th>
                            <th className="particulars-header">Particulars</th>
                        </tr>
                    </thead>
                    <tbody>
                        {request.particulars.map((item, index) => (
                            <tr key={index}>
                                <td className="particulars-cell">
                                    {readOnly ? (
                                        <div className="form-value">
                                            {item.qty || "-"}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            className="qty-input"
                                            value={item.qty}
                                            onChange={(e) =>
                                                onFieldChange(
                                                    "particulars",
                                                    request.particulars.map(
                                                        (p, i) =>
                                                            i === index
                                                                ? {
                                                                      ...p,
                                                                      qty: e
                                                                          .target
                                                                          .value,
                                                                  }
                                                                : p
                                                    )
                                                )
                                            }
                                        />
                                    )}
                                </td>
                                <td className="particulars-cell">
                                    {readOnly ? (
                                        <div className="form-value">
                                            {item.details || "-"}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            className="details-input"
                                            value={item.details}
                                            onChange={(e) =>
                                                onFieldChange(
                                                    "particulars",
                                                    request.particulars.map(
                                                        (p, i) =>
                                                            i === index
                                                                ? {
                                                                      ...p,
                                                                      details:
                                                                          e
                                                                              .target
                                                                              .value,
                                                                  }
                                                                : p
                                                    )
                                                )
                                            }
                                        />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!readOnly && (
                    <button
                        className="add-item-button"
                        onClick={onAddParticulars}
                    >
                        + Add item
                    </button>
                )}
            </div>
        </div>
    );
};
