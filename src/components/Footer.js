import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="trust-message">
          <div className="trust-icon">✓</div>
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
          <p className="copyright">© 2025 TrueQuote</p>
          {/* <div className="footer-links">
            <a href="#" className="footer-link">Contact Us</a>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Use</a>
            <a href="#" className="footer-link">Online Tracking</a>
            <a href="#" className="footer-link">Accessibility Statement</a>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer; 