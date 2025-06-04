import React, { useState } from 'react';
import PreviousButton from '../PreviousButton';

const ContactInfoStep = ({ 
  firstName, 
  lastName, 
  email,
  phoneNumber,
  streetAddress,
  onFirstNameChange, 
  onLastNameChange, 
  onEmailChange,
  onPhoneNumberChange,
  onStreetAddressChange,
  onNext,
  onPrevious,
  canGoPrevious
}) => {
  const [localFirstName, setLocalFirstName] = useState(firstName || '');
  const [localLastName, setLocalLastName] = useState(lastName || '');
  const [localEmail, setLocalEmail] = useState(email || '');
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber || '');
  const [localStreetAddress, setLocalStreetAddress] = useState(streetAddress || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localFirstName && localLastName && localEmail && localEmail.includes('@') && localPhoneNumber && localStreetAddress) {
      onFirstNameChange(localFirstName);
      onLastNameChange(localLastName);
      onEmailChange(localEmail);
      onPhoneNumberChange(localPhoneNumber);
      onStreetAddressChange(localStreetAddress);
      onNext();
    }
  };

  const isFormValid = localFirstName && localLastName && localEmail && localEmail.includes('@') && localPhoneNumber && localStreetAddress;

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setLocalPhoneNumber(formatted);
  };

  return (
    <div>
      <PreviousButton onPrevious={onPrevious} canGoPrevious={canGoPrevious} />
      <h2 className="step-title">Contact Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-input"
            value={localFirstName}
            onChange={(e) => setLocalFirstName(e.target.value)}
            autoFocus
          />
        </div>
        
        <div className="form-section">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-input"
            value={localLastName}
            onChange={(e) => setLocalLastName(e.target.value)}
          />
        </div>
        
        <div className="form-section">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className="form-input"
            value={localEmail}
            onChange={(e) => setLocalEmail(e.target.value)}
          />
        </div>

        <div className="form-section">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-input"
            value={localPhoneNumber}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
            maxLength="14"
          />
        </div>

        <div className="form-section">
          <label className="form-label">Street Address</label>
          <input
            type="text"
            className="form-input"
            value={localStreetAddress}
            onChange={(e) => setLocalStreetAddress(e.target.value)}
            placeholder="123 Main Street"
          />
        </div>

        <button 
          type="submit" 
          className="primary-button"
          disabled={!isFormValid}
        >
          CONTINUE
        </button>
        <p className="submit-disclaimer">By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>, and consent to receive important notices and other communications electronically. You also consent to receive marketing and informational calls, text messages, and pre-recorded messages from us and third-party marketers we work with at the phone number you provide, including via an autodialer or prerecorded voice. Consent is not a condition of our services. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out, HELP for help.</p>
      </form>
    </div>
  );
};

export default ContactInfoStep; 