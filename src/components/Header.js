import React, { useState } from 'react';
import './Header.css';
import { getFullStateName } from '../utils/stateMapping';

const Header = ({ state }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Create the tagline with state if available
  const createTagline = () => {
    if (state) {
      const fullStateName = getFullStateName(state);
      return `Get fast, cheap car insurance quotes in ${fullStateName} with one simple form`;
    }
    return 'Get fast, cheap car insurance quotes with one simple form';
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-container">
          <div className="logo">
            {!imageError ? (
              <img 
                src={`${process.env.PUBLIC_URL}/truequote-logo.png`} 
                alt="TrueQuote" 
                className="logo-image"
                onError={handleImageError}
              />
            ) : (
              <div className="logo-fallback">
                <span className="logo-text">TrueQuote</span>
              </div>
            )}
          </div>
        </div>
        <p className="tagline">
          {createTagline()}
        </p>
      </div>
    </header>
  );
};

export default Header; 