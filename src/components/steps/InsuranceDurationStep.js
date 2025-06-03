import React from 'react';
import PreviousButton from '../PreviousButton';

const InsuranceDurationStep = ({ value, onChange, onNext, onPrevious, canGoPrevious }) => {
  const options = [
    'Less than a year',
    '1 to 2 years',
    '2 to 3 years',
    '4+ years'
  ];

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <div>
      <PreviousButton onPrevious={onPrevious} canGoPrevious={canGoPrevious} />
      <h2 className="step-title">How long have you continuously had auto insurance?</h2>
      <div className="options-container">
        {options.map((option) => (
          <button
            key={option}
            className={`option-button ${value === option ? 'selected' : ''}`}
            onClick={() => handleSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InsuranceDurationStep; 