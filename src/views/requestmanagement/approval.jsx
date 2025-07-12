/* eslint-disable react/prop-types */
import "../../components/modal.css";

const RequestDetailsModal = ({
  request,
  onClose,
  onApprove,
  onReject,
  onMarkAsCompleted,
  renderForm,
}) => {
  if (!request) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container view-modal">
        <div className="request-details">
          <h2 className="form-title">{request.type} Request Form</h2>
          <div className="reference-number">{request.referenceNo}</div>

          {renderForm(request, true)}

          <div className="action-buttons">
            {request.status === "Pending" && (
              <>
                <button className="approve-button" onClick={onApprove}>
                  Approve
                </button>
                <button className="reject-button" onClick={onReject}>
                  Reject
                </button>
              </>
            )}
            {request.status === "Ongoing" && (
              <button className="approve-button" onClick={onMarkAsCompleted}>
                Mark as Completed
              </button>
            )}
            <button className="modal-cancel-button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
