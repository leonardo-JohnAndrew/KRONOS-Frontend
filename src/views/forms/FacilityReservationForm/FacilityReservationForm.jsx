/* eslint-disable no-unused-vars */
import { useContext, useEffect, useReducer, useRef, useState } from "react";
import "./FacilityReservationForm.css";
import axios from "axios";
import { initials, reducer, actions } from "../../../functions/formrequest";
import { useCallback } from "react";
import cleanData from "../../../functions/cleandata";
import { useUserContext } from "../../../context/usercontextprovider";
import ConfirmationPopup from "../../../components/confimationbox/ConfirmationPopup";
import PopModal from "../../../components/confimationbox/popModal";

const FacilityReservationForm = () => {
  const { usertoken } = useUserContext();
  const [state, dispatch] = useReducer(reducer, initials);
  const [showOtherInput, setShowOtherInput] = useState(false);

  const [errors, setErrors] = useState({});
  const [result, setResult] = useState();
  const [isModal, setIsModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState(null);
  const [venueRawData, setVenueRawData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reqstCODE, setCODE] = useState();
  const [actualreqstCODE, setactualCODE] = useState();
  const [formData, setFormData] = useState({
    facilityID: "FCT-000",
    reqstType: "Facility",
    participants: 0,
    activityType: "TYpe",
    activity: "",
    activityDateStart: "",
    activityTimestart: "",
    activityDateEnd: "",
    activityTimeEnd: "",
    note: "---",
    notification:
      "Your Facility Request is Submitted Wait for Faculty Approval!",
    purpose: "",
    materials: [],
  });
  const venueRef = useRef();
  const natureRef = useRef();
  const dateStartRef = useRef();
  const timeStartRef = useRef();
  const dateEndRef = useRef();
  const timeEndRef = useRef();
  const activityRef = useRef();
  const purposeRef = useRef();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (errors) {
      const timeout = setTimeout(() => {
        setErrors({});
        setResult("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [errors]);

  useEffect(() => {
    if (actualreqstCODE) {
      setIsModal(true); //
    }
  }, [actualreqstCODE]);

  const venue = useCallback(() => {
    if (!state) return; // Prevent running if state is undefined

    axios
      .get(`/api/venue`, {
        headers: { Authorization: `Bearer ${usertoken}` },
      })
      .then((res) => {
        const jsonData = cleanData(res, "noError");
        setCODE(jsonData.reqstCODE);
        if (!jsonData.facility || !Array.isArray(jsonData.facility)) {
          return;
        }

        dispatch({
          type: actions.fetch_success,
          payload: jsonData.facility,
        });
        setVenueRawData(jsonData);
        // console.log("Dispatched Data:", jsonData.facility);
      })
      .catch((error) => {
        console.error(" Error:", error);
      });
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!venueRef.current.value) newErrors.venue = "Venue is Required";
    if (!natureRef.current.value)
      newErrors.nature = "Nature Activity is Required";
    if (!dateStartRef.current.value)
      newErrors.dateStart = "Date Start is Required";
    if (!dateEndRef.current.value) newErrors.dateEnd = "Date End is Required";
    if (!timeStartRef.current.value)
      newErrors.timeStart = "Time Start is Required";
    if (!timeEndRef.current.value) newErrors.timeEnd = "Time End is Required";
    if (!activityRef.current.value) newErrors.Activity = "Activity is Required";
    if (!purposeRef.current.value) newErrors.purpose = "Purpose is Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    venue();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (venueRawData && venueRawData.request) {
      const newStart = new Date(
        `${formData.activityDateStart}T${formData.activityTimeStart}:00`
      );
      const newEnd = new Date(
        `${formData.activityDateEnd}T${formData.activityTimeEnd}:00`
      );

      const isOverlapping = venueRawData.request.some((req) => {
        const facility = req.facility_request;
        return (
          req.remark === "Approved" &&
          facility &&
          facility.facilityID === formData.facilityID &&
          new Date(facility.activityDateStart) <= newEnd &&
          new Date(facility.activityDateEnd) >= newStart
        );
      });

      if (isOverlapping) {
        setResult(
          "This facility is already reserved for the selected schedule."
        );
        return;
      }
    }

    if (!validateForm()) {
      setResult("Validation Error: Please fill in all required fields.");
      return;
    }
    const start = new Date(
      `${formData.activityDateStart}T${formData.activityTimeStart}:00`
    );
    const end = new Date(
      `${formData.activityDateEnd}T${formData.activityTimeEnd}:00`
    );

    if (isNaN(start) || isNaN(end)) {
      setResult("Invalid start or end datetime format.");
      return false;
    }
    6;
    if (end <= start) {
      setResult("End date/time must be after start date/time.");
      return false;
    }
    const formatDateTime = (date, time) =>
      date && time ? `${date} ${time}:00` : "";

    const formattedData = {
      ...formData,
      activityDateStart: formatDateTime(
        formData.activityDateStart,
        formData.activityTimeStart
      ),
      activityDateEnd: formatDateTime(
        formData.activityDateEnd,
        formData.activityTimeEnd
      ),
    };
    setPendingSubmitData(formattedData);
    setShowConfirmation(true);
    //  console.log("Data being sent:", formattedData);
  };
  const handleConfirmSubmit = async () => {
    if (!pendingSubmitData) return;

    try {
      const response = await axios.post(
        "/api/facility-request",
        pendingSubmitData,
        {
          headers: {
            Authorization: `Bearer ${usertoken}`,
          },
        }
      );

      const cleanData = response.data.replace(/<!--.*?-->/g, "").trim();
      const jsonData = JSON.parse(cleanData);
      if (jsonData.message.includes("Submitted")) {
        setactualCODE(reqstCODE);
      }
      setResult(jsonData.message);
    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        try {
          const cleanData = error.response.data
            .replace(/<!--.*?-->/g, "")
            .trim();
          const jsonData = JSON.parse(cleanData);

          const validationErrors = jsonData.errors
            ? Object.values(jsonData.errors).flat().join("\n")
            : "An unknown validation error occurred.";
          setResult("Submit Failed");
          //setResult(`Validation Error:\n${validationErrors}`);
        } catch (parseErr) {
          setResult("An error occurred while parsing the response.");
          console.error("Parsing Error:", parseErr);
        }
      }
    } finally {
      setShowConfirmation(false);
      setIsSubmitting(false);
      venue();
      setFormData({
        facilityID: "",
        reqstType: "",
        participants: 0,
        activityType: "",
        activity: "",
        activityDateStart: "",
        activityTimeStart: "",
        activityDateEnd: "",
        activityTimeEnd: "",
        note: "---",
        notification:
          "Your Facility Request is Submitted Wait for Faculty Approval!",
        purpose: "",
        materials: [],
      });
      //  setactualCODE("");
      setPendingSubmitData(null);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
    setPendingSubmitData(null);
    setIsSubmitting(false);
  };
  const handleCloseModal = () => {
    setShowConfirmation(false);
    setIsSubmitting(false);
    setIsModal(false);
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h6 className="form-coder">{reqstCODE}</h6>
        <h2 className="form-title">Facility Reservation form</h2>
        <p className="form-subtitle">
          Kindly fill out all the required fields.
        </p>
        <p className="form-recommendation">
          Recommendation: Reserve facility 7 days before the event.
        </p>
        {result && (
          <div
            className={`alert ${
              result.includes("Submitted") ? "alert-success" : "alert-danger"
            }`}
          >
            {result}
          </div>
        )}

        {/* Venue and Activity */}
        <div className="form-row">
          <div className="form-group">
            <label>Venue</label>
            <select
              name="facilityID"
              onChange={handleChange}
              value={formData.facilityID}
              ref={venueRef}
            >
              <option>Select Venue</option>
              {state.items.length > 0 ? (
                state.items.map((venue, index) => (
                  <option key={index} value={venue.facilityID}>
                    {venue.facilityName}
                  </option>
                ))
              ) : (
                <option>VENUE...</option>
              )}
            </select>
            {errors.venue && (
              <small className="text-danger">{errors.venue}</small>
            )}
          </div>

          <div className="form-group">
            <label>Nature of Activity</label>
            <select
              value={formData.activityType}
              name="activityType"
              onChange={handleChange}
              ref={natureRef}
            >
              <option>Select Activity Type</option>
              <option value="Curricular">Curricular</option>
              <option value="Co-Curricular">Co-Curricular</option>
              <option value="Extra-Curricular">Extra-Curricular</option>
            </select>
            {errors.nature && (
              <small className="text-danger">{errors.nature}</small>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="form-row">
          <div className="form-group">
            <label>Date Start</label>
            <input
              type="date"
              value={formData.activityDateStart}
              name="activityDateStart"
              onChange={handleChange}
              ref={dateStartRef}
            />
            {errors.dateStart && (
              <small className="text-danger">{errors.dateStart}</small>
            )}
          </div>
          <div className="form-group">
            <label>Time Start</label>
            <input
              type="time"
              value={formData.activityTimeStart}
              name="activityTimeStart"
              ref={timeStartRef}
              onChange={handleChange}
            />
            {errors.timeStart && (
              <small className="text-danger">{errors.timeStart}</small>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date Ended</label>
            <input
              type="date"
              value={formData.activityDateEnd}
              name="activityDateEnd"
              ref={dateEndRef}
              onChange={handleChange}
            />
            {errors.dateEnd && (
              <small className="text-danger">{errors.dateEnd}</small>
            )}
          </div>
          <div className="form-group">
            <label>Time End</label>
            <input
              type="time"
              value={formData.activityTimeEnd}
              name="activityTimeEnd"
              ref={timeEndRef}
              onChange={handleChange}
            />
            {errors.timeEnd && (
              <small className="text-danger">{errors.timeEnd}</small>
            )}
          </div>
        </div>

        {/* Activity and Purpose */}
        <div className="form-group">
          <label>Activity</label>
          <input
            type="text"
            value={formData.activity}
            name="activity"
            onChange={handleChange}
            ref={activityRef}
          />
          {errors.Activity && (
            <small className="text-danger">{errors.Activity}</small>
          )}
        </div>

        <div className="form-group">
          <label>Purpose</label>
          <input
            type="text"
            value={formData.purpose}
            name="purpose"
            onChange={handleChange}
            ref={purposeRef}
          />
          {errors.purpose && (
            <small className="text-danger">{errors.purpose}</small>
          )}
        </div>

        {/* Materials and Equipment */}
        {/* Materials and Equipment */}
        <div className="form-group">
          <label>Materials and Equipment Needed</label>
          <div className="grid-container">
            {[
              "Projector",
              "Microphone",
              "Chairs",
              "Tables",
              "LED Monitor",
              "LCD Projector",
              "Electric Fans",
              "Whiteboards",
              "Water Dispenser",
            ].map((item, index) => (
              <div key={index} className="grid-item">
                <label>{item}</label>
                <input
                  type="number"
                  min="0"
                  value={
                    formData.materials.find((mat) => mat.materialName === item)
                      ?.quantity || 0
                  }
                  onChange={(e) => {
                    const quantity = Number(e.target.value);
                    setFormData((prevData) => {
                      const updatedMaterials = prevData.materials.filter(
                        (mat) => mat.materialName !== item
                      );

                      if (quantity > 0) {
                        updatedMaterials.push({
                          materialName: item,
                          quantity,
                        });
                      }

                      return {
                        ...prevData,
                        materials: updatedMaterials,
                      };
                    });
                  }}
                />
              </div>
            ))}

            {/* Others Checkbox and Input */}
            {/* Others Checkbox and Input */}
            <div className="grid-item">
              <div className="others-container">
                <input
                  type="checkbox"
                  onChange={() => setShowOtherInput(!showOtherInput)}
                />
                <label>Others</label>
              </div>
            </div>
          </div>

          {showOtherInput && (
            <div className="others-input">
              <input
                type="text"
                placeholder="Specify material..."
                value={formData.otherMaterial || ""}
                onChange={(e) => {
                  const materialName = e.target.value;
                  setFormData((prevData) => {
                    const updatedMaterials = prevData.materials.filter(
                      (mat) => mat.materialName !== prevData.otherMaterial
                    );

                    if (materialName.trim()) {
                      updatedMaterials.push({
                        materialName,
                        quantity: prevData.otherQuantity || 1,
                      });
                    }

                    return {
                      ...prevData,
                      materials: updatedMaterials,
                      otherMaterial: materialName,
                    };
                  });
                }}
              />
              <input
                type="number"
                min="1"
                placeholder="Quantity"
                value={formData.otherQuantity || ""}
                onChange={(e) => {
                  const quantity = Number(e.target.value);
                  setFormData((prevData) => {
                    const updatedMaterials = prevData.materials.map((mat) =>
                      mat.materialName === prevData.otherMaterial
                        ? { ...mat, quantity }
                        : mat
                    );

                    return {
                      ...prevData,
                      materials: updatedMaterials,
                      otherQuantity: quantity,
                    };
                  });
                }}
              />
            </div>
          )}
        </div>

        {/* Special Note */}
        <div className="form-group">
          <label>Special Note</label>
          <textarea
            value={formData.note}
            name="note"
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button
          className="submit-button"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
      {/* Render the confirmation popup conditionally */}
      {showConfirmation && (
        <ConfirmationPopup
          onConfirm={handleConfirmSubmit}
          onCancel={handleCancelSubmit}
        />
      )}
      <PopModal
        isOpen={isModal}
        onClose={handleCloseModal}
        referenceCode={actualreqstCODE}
      />
    </div>
  );
};

export default FacilityReservationForm;
