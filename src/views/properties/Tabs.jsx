// src/components/Tabs.js
import React from 'react';
import './Tabs.css';

function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="tabs">
      <button
        className={activeTab === 'facility' ? 'tab-button active' : 'tab-button'}
        onClick={() => setActiveTab('facility')}
      >
        Facility
      </button>
      <button
        className={activeTab === 'vehicle' ? 'tab-button active' : 'tab-button'}
        onClick={() => setActiveTab('vehicle')}
      >
        Vehicle
      </button>
    </div>
  );
}

export default Tabs;