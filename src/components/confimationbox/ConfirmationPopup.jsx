/* eslint-disable react/prop-types */

import "./confirmation-popup.css";

const ConfirmationPopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h2 className="popup-title">
          Are you sure you want to submit this request?
        </h2>
        <p className="popup-message">
          Information cannot be edited once it is submitted. Do you wish to
          proceed?
        </p>
        <div className="popup-buttons">
          <button className="popup-button confirm-button" onClick={onConfirm}>
            Submit Request
          </button>
          <button className="popup-button cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
