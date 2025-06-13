import React from 'react';
import './LegalPage.css';

const PrivacyPolicyPage = ({ onBack }) => {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <button className="back-button" onClick={onBack}>← Back to Form</button>
        
        <div className="legal-header">
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">Last updated: January 2025</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account, 
              request an insurance quote, or contact us for support. This may include:
            </p>
            <ul>
              <li>Personal information (name, email address, phone number, date of birth)</li>
              <li>Address and location information</li>
              <li>Vehicle information (make, model, year, VIN)</li>
              <li>Driving history and insurance history</li>
              <li>Financial information (credit score, income)</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide you with insurance quotes and recommendations</li>
              <li>Connect you with insurance providers</li>
              <li>Improve our services and user experience</li>
              <li>Communicate with you about our services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Information Sharing</h2>
            <p>
              We may share your information with insurance companies and agents to provide you with 
              quotes and coverage options. We do not sell your personal information to third parties 
              for their marketing purposes.
            </p>
          </section>

          <section className="legal-section">
            <h2>Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section className="legal-section">
            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and update your personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Cookies</h2>
            <p>
              We use cookies and similar technologies to improve your experience on our website, 
              analyze usage patterns, and provide personalized content.
            </p>
          </section>

          <section className="legal-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p>
              Email: privacy@truequote.com<br />
              Phone: 1-800-TRUE-QUOTE<br />
              Address: TrueQuote, Inc., 123 Insurance Ave, Suite 100, Insurance City, IC 12345
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 