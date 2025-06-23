import React, { useState } from 'react';

const DriverEducationStep = ({ value, onChange, onNext }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { value: 'some_high_school', label: 'Some High School' },
    { value: 'high_school', label: 'High School' },
    { value: 'ged', label: 'GED' },
    { value: 'some_college', label: 'Some College' },
    { value: 'associates_degree', label: 'Associates Degree' },
    { value: 'bachelors_degree', label: 'Bachelor\'s Degree' },
    { value: 'masters_degree', label: 'Master\'s Degree' },
    { value: 'doctorate', label: 'Doctorate' },
    { value: 'other_profession_degree', label: 'Other Professional Degree' },
    { value: 'other_non_professional_degree', label: 'Other Non-Professional Degree' },
    { value: 'trade_vocational', label: 'Trade/Vocational' }
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
      <h2 className="step-title">What is your highest level of education?</h2>
      
      <div className="dropdown-container">
        <button
          className={`dropdown-trigger ${isOpen ? 'open' : ''} ${value ? 'selected' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption ? selectedOption.label : 'Select education level'}</span>
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

export default DriverEducationStep; 