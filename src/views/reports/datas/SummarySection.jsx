/* eslint-disable react/prop-types */
// SummarySection.js
// import React from 'react';

const SummarySection = ({ data }) => {
  return (
    <div className="summary-section">
      <div className="total-request">
        <span className="label">Total Request:</span>
        <span className="value">{data.total}</span>
      </div>
      <div className="status-summary">
        <div className="status-item completed">
          <span className="status-label">Completed</span>
          <span className="status-value">{data.completed}</span>
        </div>
        <div className="status-item approved">
          <span className="status-label">Approved</span>
          <span className="status-value">{data.approved}</span>
        </div>
        <div className="status-item ongoing">
          <span className="status-label">Ongoing</span>
          <span className="status-value">{data.ongoing}</span>
        </div>
        <div className="status-item rejected">
          <span className="status-label">Rejected</span>
          <span className="status-value">{data.rejected}</span>
        </div>
        <div className="status-item submitted">
          <span className="status-label">Submitted</span>
          <span className="status-value">{data.submitted}</span>
        </div>
      </div>
    </div>
  );
};

export default SummarySection;
