import React from 'react';
import PreviousButton from '../PreviousButton';

const VehicleMakeStep = ({ title, value, onChange, onNext, onPrevious, canGoPrevious, makes }) => {
  const handleSelect = (selectedMake) => {
    onChange(selectedMake);
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 300);
  };

  const getBrandLogo = (make) => {
    const logos = {
      'BMW': '🔵',
      'Buick': '🔴',
      'Cadillac': '⚪',
      'Chevrolet': '🟡',
      'Chrysler': '⚫',
      'Ford': '🔵',
      'Honda': '🔴',
      'Hyundai': '⚪',
      'Kia': '🔴',
      'Nissan': '⚫',
      'Toyota': '🔴'
    };
    return logos[make] || '🔘';
  };

  return (
    <div>
      <PreviousButton onPrevious={onPrevious} canGoPrevious={canGoPrevious} />
      <h2 className="step-title">{title}</h2>
      <div className="options-container">
        {makes.map((make) => (
          <button
            key={make}
            className={`vehicle-make-option ${value === make ? 'selected' : ''}`}
            onClick={() => handleSelect(make)}
          >
            <div className="vehicle-logo">
              {getBrandLogo(make)}
            </div>
            {make}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehicleMakeStep; 