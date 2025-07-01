import React from 'react';

const CurrentAutoInsuranceStep = ({ value, onChange, onNext }) => {
  const options = [
    'AAA',
    'Allstate', 
    'Farmers',
    'Geico',
    'Liberty',
    'Nationwide',
    'Other',
    'Progressive',
    'State Farm',
    'USAA'
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
      <h2 className="step-title">Current Auto Insurance</h2>
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

export default CurrentAutoInsuranceStep; 