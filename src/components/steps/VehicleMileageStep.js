import React from 'react';

const VehicleMileageStep = ({ title, value, onChange, onNext }) => {
  const options = [
    { value: 'under_10k', label: 'Under 10,000 miles' },
    { value: '10k_25k', label: '10,000 - 25,000 miles' },
    { value: '25k_50k', label: '25,000 - 50,000 miles' },
    { value: '50k_75k', label: '50,000 - 75,000 miles' },
    { value: '75k_100k', label: '75,000 - 100,000 miles' },
    { value: 'over_100k', label: 'Over 100,000 miles' }
  ];

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setTimeout(() => {
      onNext();
    }, 100);
  };

  return (
    <div className="step-container">
      <h2 className="step-title">{title}</h2>
      <div className="options-grid">
        {options.map((option) => (
          <button
            key={option.value}
            className={`option-button ${value === option.value ? 'selected' : ''}`}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehicleMileageStep; 