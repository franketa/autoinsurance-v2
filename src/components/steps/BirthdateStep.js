import React, { useState } from 'react';
import PreviousButton from '../PreviousButton';

const BirthdateStep = ({ value, onChange, onNext, onPrevious, canGoPrevious }) => {
  const [birthdate, setBirthdate] = useState(value || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (birthdate) {
      onChange(birthdate);
      onNext();
    }
  };

  const handleChange = (e) => {
    setBirthdate(e.target.value);
  };

  return (
    <div>
      <PreviousButton onPrevious={onPrevious} canGoPrevious={canGoPrevious} />
      <h2 className="step-title">What is your birthdate?</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          className="date-input"
          value={birthdate}
          onChange={handleChange}
          max={new Date().toISOString().split('T')[0]}
          autoFocus
        />
        <button 
          type="submit" 
          className="primary-button"
          disabled={!birthdate}
        >
          CONTINUE
        </button>
      </form>
    </div>
  );
};

export default BirthdateStep; 