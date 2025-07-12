/* eslint-disable react/prop-types */
// RequestTrends.js

const RequestTrends = ({ data }) => {
  // Calculate dimensions and scales for the line graph
  const months = data.map((item) => item.month);
  const maxValue = Math.max(
    ...data.map((item) =>
      Math.max(
        Number(item.facility),
        Number(item.vehicle),
        Number(item.purchase),
        Number(item.job)
      )
    )
  );

  // Create points for each line
  const createPoints = (key) => {
    const points = data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (Number(item[key]) / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");
    return points;
  };

  return (
    <div className="request-trends">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Axes and grid lines would go here */}

        {/* Facility Line */}
        <polyline
          points={createPoints("facility")}
          fill="none"
          stroke="#3498db"
          strokeWidth="1"
        />

        {/* Vehicle Line */}
        <polyline
          points={createPoints("vehicle")}
          fill="none"
          stroke="#2ecc71"
          strokeWidth="1"
        />

        {/* Purchase Line */}
        <polyline
          points={createPoints("purchase")}
          fill="none"
          stroke="#f39c12"
          strokeWidth="1"
        />

        {/* Job Line */}
        <polyline
          points={createPoints("job")}
          fill="none"
          stroke="#f1c40f"
          strokeWidth="1"
        />
      </svg>
      <div className="trend-x-axis">
        {months.map((month, index) => (
          <div key={index} className="month-label">
            {month}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestTrends;
