/* eslint-disable react/prop-types */

const JobRequestSection = ({ summary, requests, dateRange, onDateChange }) => {
  return (
    <div className="job-request-section">
      <div className="section-header">
        <h3>Job Request</h3>
        <div className="date-filter">
          <span>Set date</span>
          <div className="date-inputs">
            <div className="date-input">
              <label>Start</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => onDateChange("startDate", e.target.value)}
              />
            </div>
            <div className="date-input">
              <label>End</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => onDateChange("endDate", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="summary-section">
        <div className="total-request">
          <span className="label">Total Request:</span>
          <span className="value">{summary.total}</span>
        </div>
        <div className="status-summary">
          <div className="status-item completed">
            <span className="status-label">Completed</span>
            <span className="status-value">{summary.completed}</span>
          </div>
          <div className="status-item approved">
            <span className="status-label">Approved</span>
            <span className="status-value">{summary.approved}</span>
          </div>
          <div className="status-item ongoing">
            <span className="status-label">Ongoing</span>
            <span className="status-value">{summary.ongoing}</span>
          </div>
          <div className="status-item rejected">
            <span className="status-label">Rejected</span>
            <span className="status-value">{summary.rejected}</span>
          </div>
          <div className="status-item submitted">
            <span className="status-label">Submitted</span>
            <span className="status-value">{summary.submitted}</span>
          </div>
        </div>
      </div>

      <div
        className="request-table"
        style={{ maxHeight: "300px", overflowY: "auto" }}
      >
        <table>
          <thead>
            <tr>
              <th>Reference No.</th>
              <th>Requestor Name</th>
              <th>Department</th>
              <th>Request Date</th>
              <th>Date Remarked</th>
              <th>Purpose</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr key={index}>
                <td>{request.refNo}</td>
                <td>{request.requestor}</td>
                <td>{request.department}</td>
                <td>{request.requestDate}</td>
                <td>{request.dateRemarked}</td>
                <td>{request.purpose}</td>
                <td>
                  <span
                    className={`status-badge ${request.status.toLowerCase()}`}
                  >
                    {request.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JobRequestSection;
