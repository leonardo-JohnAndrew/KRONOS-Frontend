/* eslint-disable react/prop-types */

const PopModal = ({ isOpen, onClose, referenceCode }) => {
  if (!isOpen) {
    return null;
  }

  const successModalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  };

  const successModalContainerStyle = {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    margin: "20px",
  };

  const successModalTitleStyle = {
    margin: 0,
    fontSize: "16px",
    color: "#4b5563",
    fontWeight: "500",
  };

  const successModalCodeStyle = {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#3b82f6",
    letterSpacing: "1px",
    fontFamily: "Courier New, monospace",
  };

  const successModalButtonStyle = {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    width: "100%",
    marginTop: "16px",
    transition: "background-color 0.2s",
  };

  return (
    <div style={successModalOverlayStyle} onClick={onClose}>
      <div
        style={successModalContainerStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={successModalTitleStyle}>Your reference code is:</p>
        <p style={successModalCodeStyle}>{referenceCode}</p>
        <button style={successModalButtonStyle} onClick={onClose}>
          Okay
        </button>
      </div>
    </div>
  );
};

export default PopModal;
