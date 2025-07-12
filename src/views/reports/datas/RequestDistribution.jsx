/* eslint-disable react/prop-types */
// RequestDistribution.js
// import React from 'react';

const RequestDistribution = ({ data }) => {
  // Calculate percentages and positioning for pie chart
  const total = data.reduce((sum, item) => sum + Number(item.value), 0);
  let currentAngle = 0;

  return (
    <div className="request-distribution">
      <div className="pie-chart">
        <svg viewBox="0 0 100 100">
          {/* Background circle */}
          <circle cx="50" cy="50" r="25" fill="white" />

          {/* Pie segments */}
          {data.map((item, index) => {
            const startAngle = currentAngle;
            const percentage = item.value / total;
            const angleSize = percentage * 360;
            currentAngle += angleSize;

            const startX =
              50 + 25 * Math.cos(((startAngle - 90) * Math.PI) / 180);
            const startY =
              50 + 25 * Math.sin(((startAngle - 90) * Math.PI) / 180);
            const endX =
              50 + 25 * Math.cos(((currentAngle - 90) * Math.PI) / 180);
            const endY =
              50 + 25 * Math.sin(((currentAngle - 90) * Math.PI) / 180);

            const largeArc = angleSize > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M 50 50 L ${startX} ${startY} A 25 25 0 ${largeArc} 1 ${endX} ${endY} Z`}
                fill={item.color}
              />
            );
          })}

          {/* Center hole for donut effect */}
          <circle cx="50" cy="50" r="12" className="donut-hole" />
        </svg>
      </div>
      <div className="distribution-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div
              className="legend-color"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="legend-label">{item.name}</span>
            <span className="legend-value">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestDistribution;
