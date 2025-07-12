/* eslint-disable no-unused-vars */
import { useCallback, useEffect, useState } from "react";
import "./JobRequestForm.css";
import ConfirmationPopup from "../../../components/confimationbox/ConfirmationPopup";
import axios from "axios";
import cleanData from "../../../functions/cleandata";
import { useUserContext } from "../../../context/usercontextprovider";
import PopModal from "../../../components/confimationbox/popModal";

const JobRequestForm = () => {
  //   {
  //     "dateNeeded":"2025-10-03",
  //     "purpose":"purpose",
  //     "notification":"Your Job Request is Submited wait for the approval",
  //     "jobList":[{
  //         "quantity":"4",
  //         "natureofWork":"nature",
  //         "particulars":"particulars",
  //         "remarks":"Pending"

  //     }]
  // }
  const { usertoken } = useUserContext();
  const [Submitted, setSubmitted] = useState(false);
  const [reqstCODE, setCODE] = useState("");
  const [actualreqstCODE, setactualCODE] = useState("");
  //  const token = localStorage.getItem("token");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    notification: "Your Job Request is Submitted wait for the Approval",
    dateNeeded: "",
    purpose: "",
    jobList: [
      { quantity: "", particulars: "", natureofWork: "", remarks: "" },
      { quantity: "", particulars: "", natureofWok: "", remarks: "" },
      { quantity: "", particulars: "", natureofWork: "", remarks: "" },
      { quantity: "", particulars: "", natureofWork: "", remarks: "" },
    ],
  });
  const [isModal, setIsModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const latestcode = useCallback(() => {
    axios
      .get(`/api/job-request`, {
        headers: { Authorization: `Bearer ${usertoken}` },
      })
      .then((res) => {
        const jsonData = cleanData(res, "noError");
        setCODE(jsonData.reqstCODE);
        return jsonData.reqstCODE;
        // alert(jsonData.reqstCODE)
      })
      .catch((error) => {
        console.error(" Error:", error);
      });
  }, []);

  useEffect(() => {
    latestcode();
  }, []);

  useEffect(() => {
    if (actualreqstCODE) {
      setIsModal(true); //
    }
  }, [actualreqstCODE]);
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const formattedDate = date.toISOString().split("T")[0];
    setFormData({
      ...formData,
      dateNeeded: formattedDate,
    });
  };

  const handlePurposeChange = (e) => {
    setFormData({
      ...formData,
      purpose: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.jobList];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      jobList: updatedItems,
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      jobList: [
        ...formData.jobList,
        {
          quantity: "",
          particulars: "",
          natureofWork: "",
          remarks: "",
        },
      ],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async (e) => {
    setSubmitted(true);
    e.preventDefault();
    const filter = formData.jobList.filter(
      (item) =>
        item.quantity.trim() !== "" &&
        item.particulars.trim() !== "" &&
        item.quantity.trim()
    );

    const updatedata = {
      ...formData,
      jobList: filter,
    };
    await requestsubmit(updatedata);
    setShowConfirmation(false);
    //setIsModal(true);
  };
  const requestsubmit = async (updatedata) => {
    try {
      const response = await axios.post("/api/job-request/submit", updatedata, {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      });
      const jsonData = cleanData(response, "noError");
      console.log("uploaded: ", jsonData);
      if (jsonData.message.includes("Submitted")) {
        setactualCODE(reqstCODE);
        // setIsModal(true);
        //  setModal(true);
      }
      setSubmitted(false);
      setStatus(
        jsonData.message.includes("Submitted") ? "Submitted" : "Failed Submit"
      );
      setFormData({
        notification: "Your Job Request is Submitted wait for the Approval",
        dateNeeded: "",
        purpose: "",
        jobList: [
          {
            quantity: "",
            particulars: "",
            natureofWork: "",
            remarks: "",
          },
          {
            quantity: "",
            particulars: "",
            natureofWork: "",
            remarks: "",
          },
          {
            quantity: "",
            particulars: "",
            natureofWork: "",
            remarks: "",
          },
          {
            quantity: "",
            particulars: "",
            natureofWork: "",
            remarks: "",
          },
        ],
      });
      // setactualCODE("");
    } catch (error) {
      console.error("error: ", error);
      const jsonData = cleanData(error, "Error");
      if (jsonData && jsonData.errors) {
        const validationErrors = Object.values(jsonData.errors)
          .flat()
          .join("\n");
        console.log("Error: ", validationErrors);
        setStatus(validationErrors);
      }
    }
    setIsSubmitting(false);
    const newCode = await latestcode();
    setCODE(newCode);
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
  };

  const handleCloseModal = () => {
    setIsModal(false);
    setShowConfirmation(false);
  };

  return (
    <div className="job-form-container">
      <div className="form-number">{reqstCODE}</div>

      <div className="job-form-header">
        <h1>Job Request Form</h1>
        <p>Kindly fill out all the required fields.</p>
        <p className="sub-text">
          Advance requisition of items are highly recommended.
        </p>

        {status && (
          <div
            className={`alert ${
              status.includes("Submitted") ? "alert-success" : "alert-danger"
            }`}
          >
            {" "}
            {status}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="date-field">
          <label htmlFor="dateNeeded">Date Needed</label>
          <input
            type="date"
            className="form-input"
            style={{ width: "150px" }}
            id="dateNeeded"
            value={formData.dateNeeded}
            onChange={handleDateChange}
          />
        </div>

        <div className="purpose-field">
          <label htmlFor="purpose">Purpose</label>
          <input
            type="text"
            className="form-input"
            id="purpose"
            value={formData.purpose}
            onChange={handlePurposeChange}
          />
        </div>

        <div className="job-items-table">
          <div className="form-table-labels">
            <div className="qty-label">Qty</div>
            <div className="particulars-label">Particulars</div>
            <div className="nature-label">Nature of Work</div>
            <div className="remarks-label">Remarks</div>
          </div>

          {formData.jobList.map((item, index) => (
            <div key={index} className="job-item-row">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleItemChange(index, "quantity", e.target.value)
                }
                min="0"
                className="qty-input"
              />
              <input
                type="text"
                value={item.particulars}
                onChange={(e) =>
                  handleItemChange(index, "particulars", e.target.value)
                }
                className="particulars-input"
              />
              <input
                type="text"
                value={item.natureofWork}
                onChange={(e) =>
                  handleItemChange(index, "natureofWork", e.target.value)
                }
                className="nature-input"
              />
              <input
                type="text"
                value={item.remarks}
                onChange={(e) =>
                  handleItemChange(index, "remarks", e.target.value)
                }
                className="remarks-input"
              />
            </div>
          ))}

          {/* <div className="add-button-container">
          </div> */}
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "Submitting...." : "Submit Request"}
        </button>
      </form>
      {/* <button type="button" className="add-button" onClick={handleAddItem}>
        add
      </button> */}

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

export default JobRequestForm;
