import React from 'react';

const MilitaryStep = ({ value, onChange, onNext, maritalStatus }) => {
  const options = ['Yes', 'No'];

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 300);
  };

  const getTitle = () => {
    if (maritalStatus === 'Married') {
      return 'Have you or your spouse ever honorably served in the U.S. military?';
    } else {
      return 'Have you ever honorably served in the U.S. military?';
    }
  };

  return (
    <div>
      <h2 className="step-title">
        {getTitle()}
      </h2>
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

export default MilitaryStep; 