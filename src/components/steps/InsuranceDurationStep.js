import React from 'react';

const InsuranceDurationStep = ({ value, onChange, onNext }) => {
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