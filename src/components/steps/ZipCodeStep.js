import React, { useState } from 'react';
import PreviousButton from '../PreviousButton';

const ZipCodeStep = ({ value, onChange, onNext, onPrevious, canGoPrevious }) => {
  const [zipcode, setZipcode] = useState(value || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (zipcode.length === 5 && /^\d{5}$/.test(zipcode)) {
      onChange(zipcode);
      onNext();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D+/g, '').slice(0, 5);
    setZipcode(value);
  };

  return (
    <div>
      <PreviousButton onPrevious={onPrevious} canGoPrevious={canGoPrevious} />
      <h2 className="step-title">Enter zip code</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="form-input"
          placeholder="00000"
          value={zipcode}
          onChange={handleChange}
          maxLength={5}
          autoFocus
        />
        <button 
          type="submit" 
          className="primary-button"
          disabled={zipcode.length !== 5}
        >
          CHECK RATES
        </button>
      </form>
    </div>
  );
};

export default ZipCodeStep; 