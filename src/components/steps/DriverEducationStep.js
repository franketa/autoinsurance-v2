import React from 'react';

const DriverEducationStep = ({ value, onChange, onNext }) => {
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

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setTimeout(() => {
      onNext();
    }, 100);
  };

  return (
    <div className="step-container">
      <h2 className="step-title">What is your highest level of education?</h2>
      
      <div className="button-grid">
        {options.map((option) => (
          <button
            key={option.value}
            className={`choice-button ${value === option.value ? 'selected' : ''}`}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DriverEducationStep; 