import React from 'react';

const VehicleOwnershipStep = ({ title, value, onChange, onNext }) => {
  const options = [
    { value: 'owned', label: 'Owned' },
    { value: 'financed', label: 'Financed' },
    { value: 'leased', label: 'Leased' }
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

export default VehicleOwnershipStep; 