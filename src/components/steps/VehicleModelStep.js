import React from 'react';

const VehicleModelStep = ({ title, value, onChange, onNext, vehicleData, selectedYear, selectedMake }) => {
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
      <div className="step-header">
        <div className="step-year">{selectedYear}</div>
        <h2 className="step-title">{selectedMake} Select your vehicle model</h2>
      </div>
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