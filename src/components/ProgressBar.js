import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, location, onExitClick }) => {
  return (
    <div className="progress-container">
      <div className="progress-content">
        <div className="progress-bar-wrapper">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-info">
            <span className="progress-text">{progress}% Complete</span>
            <div className="progress-icons">
              <button className="help-icon" title="Help">?</button>
              <button className="close-icon" title="Close" onClick={onExitClick}>×</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar; 