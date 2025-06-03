import React from 'react';
import PreviousButton from '../PreviousButton';

const VehicleModelStep = ({ title, value, onChange, onNext, onPrevious, canGoPrevious, vehicleData, selectedYear, selectedMake }) => {
  // Get models available for the selected year and make
  const models = selectedYear && selectedMake && vehicleData[selectedYear] && vehicleData[selectedYear][selectedMake] 
    ? vehicleData[selectedYear][selectedMake].sort() 
    : [];

  const handleSelect = (selectedModel) => {
    onChange(selectedModel);
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <div>
      <PreviousButton onPrevious={onPrevious} canGoPrevious={canGoPrevious} />
      <h2 className="step-title">{title}</h2>
      <div className="options-container">
        {models.map((model) => (
          <button
            key={model}
            className={`option-button ${value === model ? 'selected' : ''}`}
            onClick={() => handleSelect(model)}
          >
            {model}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehicleModelStep; 