// src/components/Header.js
import React from 'react';
import './Header.css';

function Header() {
  return (
    <div className="header">
      <div className="search-bar">
        <input type="text" placeholder="Search..." />
        <button>F</button> {/* Placeholder for search icon */}
      </div>
      <div className="notification-icon">
        <span role="img" aria-label="notification">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-10h2v6h-2v-6zm0-4h2v2h-2z"/>
          </svg>
          {/* Using a simple bell icon from SVG for better visual consistency */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.93 6 11v5l-2 2v1h16v-1l-2-2z"/>
          </svg>
        </span>
      </div>
    </div>
  );
}

export default Header;