import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
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
          Get fast, cheap car insurance quotes with one simple form!.
        </p>
      </div>
    </header>
  );
};

export default Header; 