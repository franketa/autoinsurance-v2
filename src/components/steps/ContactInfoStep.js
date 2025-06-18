import React, { useState, useEffect } from 'react';
import { validateContactInfo, formatPhoneNumber } from '../../utils/validations';

const ContactInfoStep = ({ 
  firstName, 
  lastName, 
  email,
  phoneNumber,
  streetAddress,
  city,
  state,
  onFirstNameChange, 
  onLastNameChange, 
  onEmailChange,
  onPhoneNumberChange,
  onStreetAddressChange,
  onCityChange,
  onStateChange,
  onNext,
  onPrivacyClick,
  onTermsClick
}) => {
  const [localFirstName, setLocalFirstName] = useState(firstName || '');
  const [localLastName, setLocalLastName] = useState(lastName || '');
  const [localEmail, setLocalEmail] = useState(email || '');
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber || '');
  const [localStreetAddress, setLocalStreetAddress] = useState(streetAddress || '');
  const [localCity, setLocalCity] = useState(city || '');
  const [localState, setLocalState] = useState(state || '');
  const [errors, setErrors] = useState({});

  // Update parent state immediately when local state changes
  useEffect(() => {
    if (localFirstName) onFirstNameChange(localFirstName);
  }, [localFirstName, onFirstNameChange]);

  useEffect(() => {
    if (localLastName) onLastNameChange(localLastName);
  }, [localLastName, onLastNameChange]);

  useEffect(() => {
    if (localEmail) onEmailChange(localEmail);
  }, [localEmail, onEmailChange]);

  useEffect(() => {
    if (localPhoneNumber) onPhoneNumberChange(localPhoneNumber);
  }, [localPhoneNumber, onPhoneNumberChange]);

  useEffect(() => {
    if (localStreetAddress) onStreetAddressChange(localStreetAddress);
  }, [localStreetAddress, onStreetAddressChange]);

  useEffect(() => {
    if (localCity) onCityChange(localCity);
  }, [localCity, onCityChange]);

  useEffect(() => {
    if (localState) onStateChange(localState);
  }, [localState, onStateChange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all contact information
    const contactData = {
      firstName: localFirstName,
      lastName: localLastName,
      email: localEmail,
      phoneNumber: localPhoneNumber,
      streetAddress: localStreetAddress,
      city: localCity,
      state: localState
    };
    
    const validation = validateContactInfo(contactData);
    
    if (validation.isValid) {
      // Clear any previous errors
      setErrors({});
      
      // Parent state should already be updated via useEffect hooks
      onNext();
    } else {
      // Set validation errors
      setErrors(validation.errors);
    }
  };

  // Check if form is valid (all fields filled and no errors)
  const isFormValid = localFirstName && localLastName && localEmail && localPhoneNumber && localStreetAddress && localCity && localState && Object.keys(errors).length === 0;

  // Clear specific field error when user starts typing
  const clearFieldError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setLocalPhoneNumber(formatted);
    clearFieldError('phoneNumber');
  };

  return (
    <div>
      <h2 className="step-title">Contact Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className={`form-input ${errors.firstName ? 'error' : ''}`}
            value={localFirstName}
            onChange={(e) => {
              setLocalFirstName(e.target.value);
              clearFieldError('firstName');
            }}
            autoFocus
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </div>
        
        <div className="form-section">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className={`form-input ${errors.lastName ? 'error' : ''}`}
            value={localLastName}
            onChange={(e) => {
              setLocalLastName(e.target.value);
              clearFieldError('lastName');
            }}
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </div>
        
        <div className="form-section">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            value={localEmail}
            onChange={(e) => {
              setLocalEmail(e.target.value);
              clearFieldError('email');
            }}
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>

        <div className="form-section">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className={`form-input ${errors.phoneNumber ? 'error' : ''}`}
            value={localPhoneNumber}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
            maxLength="14"
          />
          {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
        </div>

        <div className="form-section">
          <label className="form-label">Street Address</label>
          <input
            type="text"
            className={`form-input ${errors.streetAddress ? 'error' : ''}`}
            value={localStreetAddress}
            onChange={(e) => {
              setLocalStreetAddress(e.target.value);
              clearFieldError('streetAddress');
            }}
            placeholder="123 Main Street"
          />
          {errors.streetAddress && <div className="error-message">{errors.streetAddress}</div>}
        </div>

        <div className="form-section">
          <label className="form-label">City</label>
          <input
            type="text"
            className={`form-input ${errors.city ? 'error' : ''}`}
            value={localCity}
            onChange={(e) => {
              setLocalCity(e.target.value);
              clearFieldError('city');
            }}
            placeholder="Your City"
          />
          {errors.city && <div className="error-message">{errors.city}</div>}
        </div>

        <div className="form-section">
          <label className="form-label">State</label>
          <input
            type="text"
            className={`form-input ${errors.state ? 'error' : ''}`}
            value={localState}
            onChange={(e) => {
              setLocalState(e.target.value.toUpperCase());
              clearFieldError('state');
            }}
            placeholder="CA"
            maxLength="2"
            style={{ textTransform: 'uppercase' }}
          />
          {errors.state && <div className="error-message">{errors.state}</div>}
        </div>

        <button 
          type="submit" 
          className="primary-button"
          disabled={!isFormValid}
        >
          CONTINUE
        </button>
        <p className="submit-disclaimer">By clicking continue, you agree to our <span style={{color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}} onClick={onTermsClick}>Terms of Service</span> and <span style={{color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}} onClick={onPrivacyClick}>Privacy Policy</span>, and consent to receive important notices and other communications electronically. You also consent to receive marketing and informational calls, text messages, and pre-recorded messages from us and third-party marketers we work with at the phone number you provide, including via an autodialer or prerecorded voice. Consent is not a condition of our services. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out, HELP for help.</p>
      </form>
    </div>
  );
};

export default ContactInfoStep; 