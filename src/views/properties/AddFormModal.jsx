/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/AddFormModal.js
import { useCallback, useEffect, useState } from "react";
import Modal from "./Modal";
import "./FormModal.css"; // Shared styling for form modals
import { useUserContext } from "../../context/usercontextprovider";
import axios from "axios";
import cleanData from "../../functions/cleandata";

function AddFormModal({ title, onSave, onCancel, fields, type, setId }) {
  const [formData, setFormData] = useState({});
  const { usertoken } = useUserContext();
  const [ID, setID] = useState();

  const fetchID = useCallback(() => {
    var select;
    if (type === "facility") {
      select = "facilities";
    } else {
      select = "vehicles";
    }
    axios
      .get(`/api/${select}/ID`, {
        headers: {
          Authorization: `Bearer ${usertoken}`,
        },
      })
      .then((res) => {
        setID(cleanData(res, "noError").id);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [fields, usertoken]);

  useEffect(() => {
    fetchID();
  }, [usertoken, onSave]);
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  const firstColumnCount = type === "facility" ? 3 : 4;

  const handleSubmit = (e) => {
    e.preventDefault();
    var newData;
    if (type === "facility") {
      newData = {
        ...formData,
        facilityID: ID,
        archive: "No",
      };
    } else {
      newData = {
        ...formData,
        vehicleID: ID,
        archive: "No",
      };
    }

    onSave(newData);
  };

  return (
    <Modal>
      <div className="form-modal">
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* First Column: index 0–3 */}
            <div className="col-md-6">
              {fields.slice(0, firstColumnCount).map((field, index) => (
                <div className="form-group mb-3" key={index}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    type={field.type || "text"}
                    id={field.name}
                    name={field.name}
                    className="form-control"
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    disabled={field.placeholder ? false : true}
                    placeholder={field.placeholder || ID}
                  />
                </div>
              ))}
            </div>

            {/* Second Column: index 4 and onward */}
            <div className="col-md-6">
              {fields.slice(firstColumnCount).map((field, index) => (
                <div className="form-group mb-3" key={index + firstColumnCount}>
                  <label htmlFor={field.name}>{field.label}</label>
                  <input
                    type={field.type || "text"}
                    id={field.name}
                    name={field.name}
                    className="form-control"
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={
                      field.placeholder || `Add ${field.label.toLowerCase()}`
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions mt-4">
            <button type="submit" className="save-button">
              Save
            </button>
            <button type="button" className="cancel-button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default AddFormModal;
