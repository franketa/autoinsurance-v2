import React from 'react';

const DriverRelationshipStep = ({ value, onChange, onNext }) => {
  const options = [
    { value: 'self', label: 'Self' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'child', label: 'Child' },
    { value: 'grandparent', label: 'Grandparent' },
    { value: 'grandchild', label: 'Grandchild' },
    { value: 'other', label: 'Other' }
  ];

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setTimeout(() => {
      onNext();
    }, 100);
  };

  return (
    <div className="step-container">
      <h2 className="step-title">What is your relationship to the primary driver?</h2>
      
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

export default DriverRelationshipStep; 