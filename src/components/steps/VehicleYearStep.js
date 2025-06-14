import React from 'react';

const VehicleYearStep = ({ title, value, onChange, onNext, vehicleData }) => {
  // Get available years from vehicleData and sort them in descending order (newest first)
  const years = Object.keys(vehicleData).sort((a, b) => parseInt(b) - parseInt(a));

  const handleSelect = (selectedYear) => {
    onChange(selectedYear);
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 300);
  };

  return (
    <div>
      <h2 className="step-title">{title}</h2>
      <div className="options-container">
        {years.slice(0, 10).map((year) => (
          <button
            key={year}
            className={`option-button ${value === year ? 'selected' : ''}`}
            onClick={() => handleSelect(year)}
          >
            {year}
          </button>
        ))}
        {years.length > 10 && (
          <details className="more-years">
            <summary>More years...</summary>
            {years.slice(10).map((year) => (
              <button
                key={year}
                className={`option-button ${value === year ? 'selected' : ''}`}
                onClick={() => handleSelect(year)}
              >
                {year}
              </button>
            ))}
          </details>
        )}
      </div>
    </div>
  );
};

export default VehicleYearStep; 