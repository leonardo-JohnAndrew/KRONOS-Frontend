/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./VehicleReservation.css";
import "bootstrap/dist/css/bootstrap.min.css";
import cleanData from "../../../functions/cleandata";
import { useUserContext } from "../../../context/usercontextprovider";
import ConfirmationPopup from "../../../components/confimationbox/ConfirmationPopup";
import PopModal from "../../../components/confimationbox/popModal";
import { Modal } from "bootstrap";
import { data } from "react-router";

const VehicleReservationForm = () => {
  const [formValue, setFormValues] = useState({
    reqstType: "Service Request",
    noOfPassenger: "",
    destination: "",
    purpose: "",
    timeDeparture: "",
    timeArrival: "",
    dateNeeded: "",
    dateArrival: "",
    passengerName: "",
    notification: "Your Vehicle Request is Submitted. Wait for Approval!",
  });
  const { usertoken, userInfo } = useUserContext();
  const [result, setResult] = useState();
  const [reqstCODE, setCODE] = useState();
  const [actualreqstCODE, setactualCODE] = useState();
  const [errors, setErrors] = useState({});
  const [isModal, setModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isModalCode, setModalCode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  // Refs for input fields
  const noOfPassengerRef = useRef();
  const destinationRef = useRef();
  const purposeRef = useRef();
  const timeDepartureRef = useRef();
  const timeArrivalRef = useRef();
  const dateNeededRef = useRef();
  const dateArrivalRef = useRef();
  const passengerNameRef = useRef();
  const travelRef = useRef();
  const exceptFile = userInfo.userRole === "Student";

  // alert(usertoken);
  // Handle input change
  const [file, setFile] = useState(null); //
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (
      selectedFile &&
      ![
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
      ].includes(selectedFile.type)
    ) {
      setResult("Please upload a valid image file.");
      return;
    }
    console.log(selectedFile);
    if (selectedFile) {
      setFile(selectedFile);
      // console.log("File name:", selectedFile.name); // this will show
    }
  };

  const handleChange = (e) => {
    setFormValues({ ...formValue, [e.target.name]: e.target.value });
  };

  const latestcode = useCallback(() => {
    axios
      .get(`/api/service-request`, {
        headers: { Authorization: `Bearer ${usertoken}` },
      })
      .then((res) => {
        const jsonData = cleanData(res, "noError");
        setCODE(jsonData.reqstCODE);
        return jsonData.reqstCODE;
      })
      .catch((error) => {
        console.error(" Error:", error);
      });
  }, []);

  useEffect(() => {
    if (errors) {
      const timeout = setTimeout(() => {
        setErrors({});
        setResult("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [errors]);
  //validations
  const validateForm = () => {
    const newErrors = {};
    if (!noOfPassengerRef.current.value)
      newErrors.noOfPassenger = "Number of passengers is required";
    if (!destinationRef.current.value.trim())
      newErrors.destination = "Destination is required";
    if (!purposeRef.current.value) newErrors.purpose = "Purpose is required";
    if (!timeDepartureRef.current.value)
      newErrors.timeDeparture = "Time of departure is required";
    if (!timeArrivalRef.current.value)
      newErrors.timeArrival = "Time of arrival is required";
    if (!dateNeededRef.current.value)
      newErrors.dateNeeded = "Date needed is required";
    if (!dateArrivalRef.current.value)
      newErrors.dateArrival = "Date of arrival is required";

    if (!passengerNameRef.current.value.trim())
      newErrors.passengerName = "Passenger name is required";
    const departureDateTime = new Date(
      `${dateNeededRef.current.value}T${timeDepartureRef.current.value}`
    );
    const arrivalDateTime = new Date(
      `${dateArrivalRef.current.value}T${timeArrivalRef.current.value}`
    );

    if (
      dateNeededRef.current.value &&
      timeDepartureRef.current.value &&
      dateArrivalRef.current.value &&
      timeArrivalRef.current.value &&
      arrivalDateTime <= departureDateTime
    ) {
      newErrors.dateError = "Arrival must be after departure.";
    }

    setErrors(newErrors);
    return newErrors;
    // alert(errors);
    // console.log(newErrors.dateError);
    // alert(errors.dateError);
    // return Object.keys(newErrors).length === 0;
  };
  useEffect(() => {
    if (actualreqstCODE) {
      setModal(true); //
    }
  }, [actualreqstCODE]);

  useEffect(() => {
    latestcode();
  }, []);
  const handleConfirmSubmit = async (e) => {
    setIsSubmitting(true);
    // setactualCODE(reqstCODE);
    setShowConfirmation(false);
    await handleSubmit();
  };

  const handleCancelSubmit = async () => {
    setShowConfirmation(false);
  };
  const handleCloseModal = async () => {
    setModal(false);
  };

  const handleSubmit = async () => {
    //  setactualCODE(reqstCODE);
    const data = new FormData();
    Object.entries(formValue).forEach(([key, value]) => {
      if (key === "noOfPassenger") {
        data.append(key, parseInt(value));
      } else {
        data.append(key, value);
      }
    });
    if (file) {
      data.append("image", file);
    }
    for (let [key, value] of data.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.post("/api/service-request/submit", data, {
        headers: { Authorization: `Bearer ${usertoken}` },
      });

      const cleanData = response.data.replace(/<!--.*?-->/g, "").trim();
      const jsonData = JSON.parse(cleanData, "noError");
      if (jsonData.message.includes("Submitted")) {
        setactualCODE(reqstCODE);
        //  setModal(true);
      }

      setResult(jsonData.message);
      setFormValues({
        reqstType: "Service Request",
        noOfPassenger: "",
        destination: "",
        purpose: "",
        timeDeparture: "",
        timeArrival: "",
        dateNeeded: "",
        dateArrival: "",
        passengerName: "",
        notification: "Your Vehicle Request is Submitted. Wait for Approval!",
      });
      setFile(null);
      travelRef.current.value = null;
    } catch (error) {
      console.error("Error:", error);
      const cleanData = error.response.data.replace(/<!--.*?-->/g, "").trim();
      const jsonData = JSON.parse(cleanData);
      const validationErrors = Object.values(jsonData.errors).flat().join("\n");
      setResult(`Validation Error:\n${validationErrors}`);
    } finally {
      setIsSubmitting(false);
      const newCode = await latestcode();
      setCODE(newCode);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card vehicle-reservation-card">
        <div className="card-body">
          <div className="form-number">{reqstCODE}</div>
          <h2 className="form-title">Vehicle Reservation Form</h2>
          <p className="form-subtitle">
            Kindly fill out all the required fields.
          </p>
          <p className="form-recommendation">
            Recommendation: Reserve Vehicle 7 days before the trip.
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
          <form
            encType="multipart/form-data"
            onSubmit={(e) => {
              e.preventDefault();
              const newErrors = validateForm();
              if (Object.keys(newErrors).length > 0) {
                const errorMessage =
                  newErrors.dateError ||
                  "Validation Error: Please fill in all required fields.";
                setResult(errorMessage);
                return;
              }

              setShowConfirmation(true);
            }}
          >
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Time of Departure</label>
                  <input
                    type="time"
                    name="timeDeparture"
                    className="form-control"
                    value={formValue.timeDeparture}
                    onChange={handleChange}
                    ref={timeDepartureRef}
                  />
                  {errors.timeDeparture && (
                    <small className="text-danger">
                      {errors.timeDeparture}
                    </small>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Time of Arrival</label>
                  <input
                    type="time"
                    name="timeArrival"
                    className="form-control"
                    value={formValue.timeArrival}
                    onChange={handleChange}
                    ref={timeArrivalRef}
                  />
                  {errors.timeArrival && (
                    <small className="text-danger">{errors.timeArrival}</small>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>Date Needed</label>
                  <input
                    type="date"
                    name="dateNeeded"
                    className="form-control"
                    value={formValue.dateNeeded}
                    onChange={handleChange}
                    ref={dateNeededRef}
                  />
                  {errors.dateNeeded && (
                    <small className="text-danger">{errors.dateNeeded}</small>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Date of Arrival</label>
                  <input
                    type="date"
                    name="dateArrival"
                    className="form-control"
                    value={formValue.dateArrival}
                    onChange={handleChange}
                    ref={dateArrivalRef}
                  />
                  {errors.dateArrival && (
                    <small className="text-danger">{errors.dateArrival}</small>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <label>No. of Passengers</label>
                  <input
                    type="number"
                    name="noOfPassenger"
                    className="form-control"
                    value={formValue.noOfPassenger}
                    onChange={handleChange}
                    ref={noOfPassengerRef}
                  />
                  {errors.noOfPassenger && (
                    <small className="text-danger">
                      {errors.noOfPassenger}
                    </small>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <label>Destination</label>
                  <input
                    type="text"
                    name="destination"
                    className="form-control"
                    value={formValue.destination}
                    onChange={handleChange}
                    ref={destinationRef}
                  />
                  {errors.destination && (
                    <small className="text-danger">{errors.destination}</small>
                  )}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Passengers</label>
              <textarea
                name="passengerName"
                className="form-control"
                rows="3"
                value={formValue.passengerName}
                onChange={handleChange}
                ref={passengerNameRef}
              ></textarea>
              {errors.passengerName && (
                <small className="text-danger">{errors.passengerName}</small>
              )}
            </div>
            <div className="form-group">
              <label>Purpose</label>
              <input
                type="text"
                name="purpose"
                className="form-control"
                value={formValue.purpose}
                onChange={handleChange}
                ref={purposeRef}
              />
              {errors.purpose && (
                <small className="text-danger">{errors.purpose}</small>
              )}
            </div>

            <div className="form-group">
              <label>Travel Order</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="form-control"
                onChange={handleFileChange}
                ref={travelRef}
              />
              {errors.travelOrder && (
                <small className="text-danger">{errors.travelOrder}</small>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-100 mt-3"
            >
              {isSubmitting ? "Submitting...." : "Submit Request"}
            </button>
          </form>
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
      </div>
    </div>
  );
};

export default VehicleReservationForm;
