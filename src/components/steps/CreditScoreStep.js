import React from 'react';

const CreditScoreStep = ({ value, onChange, onNext }) => {
  const options = [
    'Excellent (720+)',
    'Good (680-719)',
    'Fair/Average (580-679)',
    'Poor (below 580)',
    'Not Sure (that\'s okay!)'
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
      <h2 className="step-title">What is your credit score?</h2>
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

export default CreditScoreStep; 