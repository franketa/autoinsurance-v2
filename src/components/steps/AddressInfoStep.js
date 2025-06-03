import React, { useState } from 'react';
import PreviousButton from '../PreviousButton';

const AddressInfoStep = ({ 
  streetAddress, 
  zipcode, 
  phoneNumber, 
  onStreetAddressChange, 
  onPhoneNumberChange, 
  onNext,
  onPrevious,
  canGoPrevious
}) => {
  const [localStreetAddress, setLocalStreetAddress] = useState(streetAddress || '');
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localStreetAddress && localPhoneNumber) {
      onStreetAddressChange(localStreetAddress);
      onPhoneNumberChange(localPhoneNumber);
      onNext();
    }
  };

  const isFormValid = localStreetAddress && localPhoneNumber;

  return (
    <div>
      <PreviousButton onPrevious={onPrevious} canGoPrevious={canGoPrevious} />
      <h2 className="step-title">Great news! We've found matches for you.</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label className="form-label">Street Address</label>
          <input
            type="text"
            className="form-input"
            placeholder="E.G. 123 MAIN ST"
            value={localStreetAddress}
            onChange={(e) => setLocalStreetAddress(e.target.value)}
            autoFocus
          />
        </div>
        
        <div className="form-section">
          <label className="form-label">Zip Code</label>
          <input
            type="text"
            className="form-input"
            value={zipcode}
            disabled
            style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}
          />
        </div>
        
        <div className="form-section">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            className="form-input"
            value={localPhoneNumber}
            onChange={(e) => setLocalPhoneNumber(e.target.value)}
          />
        </div>

        <button 
          type="submit" 
          className="primary-button"
          disabled={!isFormValid}
        >
          GET MY QUOTES
        </button>
      </form>
    </div>
  );
};

export default AddressInfoStep; 