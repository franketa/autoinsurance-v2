import React from 'react';
import './Footer.css';

const Footer = ({ onContactClick, onPrivacyClick, onTermsClick }) => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="trust-message">
          <div className="trust-icon">
            <img 
              src={`${process.env.PUBLIC_URL}/images/brands/badge.png`} 
              alt="Trust Badge" 
              className="trust-badge-image"
            />
          </div>
          <span>Free quotes, secure form, competitive offers.</span>
        </div>

        {/* <div className="trust-badges">
          <div className="badge bbb-badge">
            <span className="badge-text">BBB</span>
            <span className="badge-subtext">ACCREDITED BUSINESS</span>
          </div>
          <div className="badge rating-badge">
            <span className="badge-text">A+</span>
          </div>
        </div> */}

        <div className="footer-info">
          <p className="copyright">© 2025 SmartAutoInsider</p>
          <div className="footer-links">
            <button className="footer-link" onClick={onContactClick}>Contact Us</button>
            <button className="footer-link" onClick={onPrivacyClick}>Privacy Policy</button>
            <button className="footer-link" onClick={onTermsClick}>Terms of Use</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 