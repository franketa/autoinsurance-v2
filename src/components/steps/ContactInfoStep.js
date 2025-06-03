import React, { useState } from 'react';
import PreviousButton from '../PreviousButton';

const ContactInfoStep = ({ 
  firstName, 
  lastName, 
  email, 
  onFirstNameChange, 
  onLastNameChange, 
  onEmailChange, 
  onNext,
  onPrevious,
  canGoPrevious
}) => {
  const [localFirstName, setLocalFirstName] = useState(firstName || '');
  const [localLastName, setLocalLastName] = useState(lastName || '');
  const [localEmail, setLocalEmail] = useState(email || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localFirstName && localLastName && localEmail && localEmail.includes('@')) {
      onFirstNameChange(localFirstName);
      onLastNameChange(localLastName);
      onEmailChange(localEmail);
      onNext();
    }
  };

  const isFormValid = localFirstName && localLastName && localEmail && localEmail.includes('@');

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

        <button 
          type="submit" 
          className="primary-button"
          disabled={!isFormValid}
        >
          CONTINUE
        </button>
      </form>
    </div>
  );
};

export default ContactInfoStep; 