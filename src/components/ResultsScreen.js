import React from 'react';
import './ResultsScreen.css';

const ResultsScreen = ({ userName = 'franco', onViewRate, onViewAllRates }) => {
  return (
    <div className="results-screen">
      <div className="results-content">
        <h1 className="results-title">
          <span className="user-name">{userName}</span>, we've found your best rate!
        </h1>
        
        <div className="carrier-card">
          <div className="top-rated-badge">
            ⭐ TOP RATED CARRIER
          </div>
          
          <div className="carrier-logo">
            <div className="usaa-logo">
              <div className="logo-lines">
                <div className="line line-1"></div>
                <div className="line line-2"></div>
                <div className="line line-3"></div>
                <div className="line line-4"></div>
              </div>
              <div className="logo-text">USAA</div>
            </div>
          </div>
          
          <button className="view-rate-button" onClick={onViewRate}>
            View My Rate
          </button>
        </div>
        
        <div className="additional-options">
          <p className="options-text">
            Want to see more options? We have additional carriers available.
          </p>
          <button className="view-all-button" onClick={onViewAllRates}>
            View All Rates
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen; 