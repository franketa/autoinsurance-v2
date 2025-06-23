import React, { useState } from 'react';

const DriverOccupationStep = ({ value, onChange, onNext }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { value: 'administrative_clerical', label: 'Administrative/Clerical' },
    { value: 'architect', label: 'Architect' },
    { value: 'business_owner', label: 'Business Owner' },
    { value: 'certified_public_accountant', label: 'Certified Public Accountant' },
    { value: 'clergy', label: 'Clergy' },
    { value: 'construction_trades', label: 'Construction/Trades' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'homemaker', label: 'Homemaker' },
    { value: 'lawyer', label: 'Lawyer' },
    { value: 'manager_supervisor', label: 'Manager/Supervisor' },
    { value: 'military_enlisted', label: 'Military Enlisted' },
    { value: 'military_officer', label: 'Military Officer' },
    { value: 'minor_na', label: 'Minor (N/A)' },
    { value: 'other_non_technical', label: 'Other Non-Technical' },
    { value: 'other_technical', label: 'Other Technical' },
    { value: 'physician', label: 'Physician' },
    { value: 'professional_salaried', label: 'Professional Salaried' },
    { value: 'professor', label: 'Professor' },
    { value: 'retail', label: 'Retail' },
    { value: 'retired', label: 'Retired' },
    { value: 'sales_inside', label: 'Sales (Inside)' },
    { value: 'sales_outside', label: 'Sales (Outside)' },
    { value: 'school_teacher', label: 'School Teacher' },
    { value: 'scientist', label: 'Scientist' },
    { value: 'self_employed', label: 'Self Employed' },
    { value: 'skilled_semi_skilled', label: 'Skilled/Semi-Skilled' },
    { value: 'student', label: 'Student' },
    { value: 'unemployed', label: 'Unemployed' }
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
      <h2 className="step-title">What is your occupation?</h2>
      
      <div className="dropdown-container">
        <button
          className={`dropdown-trigger ${isOpen ? 'open' : ''} ${value ? 'selected' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedOption ? selectedOption.label : 'Select occupation'}</span>
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

export default DriverOccupationStep; 