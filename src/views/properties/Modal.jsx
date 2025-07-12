// src/components/Modal.js
import React from 'react';
import './Modal.css';

function Modal({ children }) { // Removed isOpen and onClose props as they are managed by parent
                              // and the Modal component is rendered conditionally by parent
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
}

export default Modal;