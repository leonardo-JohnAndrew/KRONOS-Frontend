/* eslint-disable react/prop-types */
// src/components/EditFormModal.js
import { useState, useEffect } from "react";
import Modal from "./Modal";
import "./FormModal.css"; // Shared styling for form modals

function EditFormModal({ title, data, onSave, onCancel, type, fields }) {
  const [formData, setFormData] = useState({});
  const firstColumnCount = type === "facility" ? 3 : 4;

  useEffect(() => {
    // Initialize form data with the item's data when component mounts or data changes
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal>
      <div className="form-modal">
        <h3>{title}</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* First Column: index 0–2 */}
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
                    readOnly={field.readOnly}
                    placeholder={
                      field.placeholder || `Add ${field.label.toLowerCase()}`
                    }
                  />
                </div>
              ))}
            </div>

            {/* Second Column: index 3 and onward */}
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
                    readOnly={field.readOnly}
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

export default EditFormModal;
