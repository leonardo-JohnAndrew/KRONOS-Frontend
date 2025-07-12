// src/components/ConfirmationModal.js
import React from 'react';
import Modal from './Modal';
import './ConfirmationModal.css';

function ConfirmationModal({ title, message, onConfirm, onCancel, confirmText, cancelText }) {
  return (
    <Modal> {/* Modal is always open when this component is rendered */}
      <div className="confirmation-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="confirm-button" onClick={onConfirm}>{confirmText}</button>
          <button className="cancel-button" onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmationModal;