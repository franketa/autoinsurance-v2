import React from 'react';
import PreviousButton from '../PreviousButton';

const InsuranceHistoryStep = ({ value, onChange, onNext, onPrevious, canGoPrevious }) => {
  const options = ['Yes', 'No'];

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
      <h2 className="step-title">Have you had auto insurance in the past 30 days?</h2>
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

export default InsuranceHistoryStep; 