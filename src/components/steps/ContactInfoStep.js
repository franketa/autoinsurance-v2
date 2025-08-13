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
  const [agreementChecked, setAgreementChecked] = useState(false);

  // Load TrustedForm and Jornaya scripts when component mounts
  useEffect(() => {
    const loadTrustedForm = () => {
      // Only load if script hasn't been loaded already
      if (!document.querySelector('script[src*="trustedform.js"]')) {
        const tf = document.createElement("script");
        tf.type = "text/javascript";
        tf.async = true;
        tf.src = "https://api.trustedform.com/trustedform.js?field=xxTrustedFormCertUrl&l=" +
          new Date().getTime() + Math.random();
        
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(tf, firstScript);
        
        // Add noscript fallback
        const noscript = document.createElement("noscript");
        const img = document.createElement("img");
        img.src = "https://api.trustedform.com/ns.gif";
        noscript.appendChild(img);
        document.head.appendChild(noscript);
      }
    };

    const loadJornaya = () => {
      // Only load if script hasn't been loaded already
      if (!document.querySelector('script#LeadiDscript_campaign')) {
        // First create the base LeadiDscript if it doesn't exist
        if (!document.getElementById('LeadiDscript')) {
          const leadIdBase = document.createElement('script');
          leadIdBase.id = 'LeadiDscript';
          leadIdBase.type = 'text/javascript';
          document.head.appendChild(leadIdBase);
        }
        
        // Now create and insert the campaign script
        const s = document.createElement('script');
        s.id = 'LeadiDscript_campaign';
        s.type = 'text/javascript';
        s.async = true;
        s.src = '//create.lidstatic.com/campaign/79baaed6-d254-23be-3049-b9e04bb5b8d1.js?snippet_version=2';
        
        const LeadiDscript = document.getElementById('LeadiDscript');
        LeadiDscript.parentNode.insertBefore(s, LeadiDscript);
      }
    };

    loadTrustedForm();
    loadJornaya();
  }, []);

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

  // Check if form is valid (all fields filled, no errors, and agreement checked)
  const isFormValid = localFirstName && localLastName && localEmail && localPhoneNumber && localStreetAddress && localCity && localState && Object.keys(errors).length === 0 && agreementChecked;

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
        
        <div className="form-section">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <input
              type="checkbox"
              id="agreement"
              checked={agreementChecked}
              onChange={(e) => setAgreementChecked(e.target.checked)}
              style={{ marginTop: '3px' }}
            />
            <label htmlFor="agreement" style={{ fontSize: '14px', lineHeight: '1.4', cursor: 'pointer' }}>
              By clicking "Get My Auto Quotes", you agree to our <span style={{color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}} onClick={onTermsClick}>Terms and Conditions</span> and <span style={{color: '#007bff', cursor: 'pointer', textDecoration: 'underline'}} onClick={onPrivacyClick}>Privacy Policy</span>, and consent to receive important notices and other communications electronically. You also expressly consent to receive marketing and promotional calls, text messages, and pre-recorded messages from Vision Media Group, its subsidiaries, and third-party marketers acting on its behalf at the phone number you provide, including via an automatic telephone dialing system or pre-recorded or artificial voice messages. Consent is not a condition of our services. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out, HELP for help.
            </label>
          </div>
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