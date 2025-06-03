import React from 'react';
import PreviousButton from '../PreviousButton';

const CoverageTypeStep = ({ value, onChange, onNext, onPrevious, canGoPrevious }) => {
  const options = ['Full Coverage', 'Liability Only'];

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
      <h2 className="step-title">Which coverage type do you need?</h2>
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

export default CoverageTypeStep; 