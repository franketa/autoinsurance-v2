import React from 'react';

const VehicleMileageStep = ({ title, value, onChange, onNext }) => {
  const options = [
    { value: '<5000', label: 'Less than 5,000' },
    { value: '5000-10000', label: '5,000 - 10,000' },
    { value: '10000-15000', label: '10,000 - 15,000' },
    { value: '15000-20000', label: '15,000 - 20,000' },
    { value: '>20000', label: 'More than 20,000' }
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