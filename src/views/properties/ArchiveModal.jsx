/* eslint-disable react/prop-types */
// src/components/ArchiveModal.js
import { useState } from "react";
import Modal from "./Modal";
import "./ArchiveModal.css";

function ArchiveModal({ itemName, handleArchive, onCancel }) {
  const [reason, setReason] = useState("");

  return (
    <Modal>
      <div className="archive-modal">
        <h3>ARCHIVE</h3>
        <p>Are you sure you want to archive {itemName}?</p>
        <p className="warning">
          Warning: Data from the past transactions might be corrupted once
          archived.
        </p>
        <div className="form-group">
          <textarea
            placeholder="Type your reason of deletion..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="4"
          ></textarea>
        </div>
        <div className="modal-actions">
          <button
            className="archive-button"
            disabled={reason.trim() === ""}
            onClick={() => handleArchive(reason)}
          >
            Confirm
          </button>

          <button className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ArchiveModal;
