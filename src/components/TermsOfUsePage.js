import React from 'react';
import './LegalPage.css';

const TermsOfUsePage = ({ onBack }) => {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <button className="back-button" onClick={onBack}>← Back to Form</button>
        
        <div className="legal-header">
          <h1 className="legal-title">Terms of Use</h1>
          <p className="legal-subtitle">Last updated: January 2025</p>
        </div>

        <div className="legal-body">
          <section className="legal-section">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using TrueQuote's website and services, you accept and agree to be 
              bound by these Terms of Use. If you do not agree to these terms, please do not use 
              our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>Description of Service</h2>
            <p>
              TrueQuote provides an online platform that allows users to request and compare 
              insurance quotes from various insurance providers. We act as an intermediary to 
              connect you with insurance companies and agents.
            </p>
          </section>

          <section className="legal-section">
            <h2>User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate and complete information when requesting quotes</li>
              <li>Use our services only for lawful purposes</li>
              <li>Not interfere with or disrupt our services</li>
              <li>Not attempt to gain unauthorized access to our systems</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Quote Accuracy</h2>
            <p>
              The quotes provided through our platform are estimates based on the information you 
              provide. Final rates and coverage terms are determined by the insurance companies. 
              We do not guarantee the accuracy of quotes or the availability of coverage.
            </p>
          </section>

          <section className="legal-section">
            <h2>Third Party Services</h2>
            <p>
              Our platform may contain links to third-party websites or integrate with third-party 
              services. We are not responsible for the content, privacy policies, or practices of 
              these third parties.
            </p>
          </section>

          <section className="legal-section">
            <h2>Intellectual Property</h2>
            <p>
              All content on our website, including text, graphics, logos, and software, is the 
              property of TrueQuote or our licensors and is protected by copyright and other 
              intellectual property laws.
            </p>
          </section>

          <section className="legal-section">
            <h2>Limitation of Liability</h2>
            <p>
              TrueQuote shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages arising out of your use of our services. Our total liability 
              shall not exceed the amount you paid for our services.
            </p>
          </section>

          <section className="legal-section">
            <h2>Disclaimers</h2>
            <p>
              Our services are provided "as is" and "as available" without warranties of any kind. 
              We disclaim all warranties, express or implied, including warranties of merchantability 
              and fitness for a particular purpose.
            </p>
          </section>

          <section className="legal-section">
            <h2>Termination</h2>
            <p>
              We may terminate or suspend your access to our services at any time, with or without 
              cause, and with or without notice.
            </p>
          </section>

          <section className="legal-section">
            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Use at any time. Changes will be 
              effective immediately upon posting on our website. Your continued use of our services 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>Contact Information</h2>
            <p>
              If you have any questions about these Terms of Use, please contact us at:
            </p>
            <p>
              Email: legal@truequote.com<br />
              Phone: 1-800-TRUE-QUOTE<br />
              Address: TrueQuote, Inc., 123 Insurance Ave, Suite 100, Insurance City, IC 12345
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUsePage; 