import React from 'react';
import PreviousButton from '../PreviousButton';

const VehicleYearStep = ({ title, value, onChange, onNext, onPrevious, canGoPrevious }) => {
  // Generate years from 2025 down to 1987
  const years = [];
  for (let year = 2025; year >= 1987; year--) {
    years.push(year.toString());
  }

  const handleSelect = (selectedYear) => {
    onChange(selectedYear);
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