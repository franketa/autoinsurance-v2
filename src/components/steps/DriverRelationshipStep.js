import React, { useState } from 'react';

const DriverRelationshipStep = ({ value, onChange, onNext }) => {
  const [isOpen, setIsOpen] = useState(false);
  
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

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
    setTimeout(() => {
      onNext();
    }, 100);
  };

  return (
    <div className="step-container">
      <h2 className="step-title">What is your relationship to the primary driver?</h2>
      
      <div className="dropdown-container">
        <button
          className={`dropdown-trigger ${isOpen ? 'open' : ''} ${value ? 'selected' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption ? selectedOption.label : 'Select relationship'}</span>
          <span className="dropdown-arrow">▼</span>
        </button>
        
        {isOpen && (
          <div className="dropdown-menu">
            {options.map((option) => (
              <div
                key={option.value}
                className={`dropdown-item ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRelationshipStep; 