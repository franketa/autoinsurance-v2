import React, { useState } from 'react';

const VehicleMakeStep = ({ title, value, onChange, onNext, vehicleData, selectedYear }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Get makes available for the selected year
  const makes = selectedYear && vehicleData[selectedYear] 
    ? Object.keys(vehicleData[selectedYear]).sort() 
    : [];

  // Brands that have actual logo images
  const brandLogos = {
    'BMW': 'bmw.png',
    'BUICK': 'buick.png',
    'CADILLAC': 'cadillac.png',
    'CHEVROLET': 'chevrolet.png',
    'CHRYSLER': 'chrysler.png',
    'DODGE': 'dodge.png',
    'FORD': 'ford.png',
    'GMC': 'gmc.png',
    'HONDA': 'honda.png',
    'HYUNDAI': 'hyundai.png',
    'JEEP': 'jeep.png',
    'KIA': 'kia.png',
    'LEXUS': 'lexus.png',
    'LINCOLN': 'lincoln.png',
    'NISSAN': 'nissan.png',
    'RAM': 'ram.png',
    'SUBARU': 'subaru.png',
    'TOYOTA': 'toyota.png',
    'VOLKSWAGEN': 'volkswagen.png',
    'PONTIAC': 'pontiac.png',
    'MERCURY': 'mercury.png',
    'MERCEDES-BENZ': 'mercedes.png',
  };

  // Split makes into those with and without images
  const makesWithImages = makes.filter(make => brandLogos[make]);
  const makesWithoutImages = makes.filter(make => !brandLogos[make]);

  const handleSelect = (selectedMake) => {
    onChange(selectedMake);
    setDropdownOpen(false); // Close dropdown if open
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 300);
  };

  const handleDropdownSelect = (selectedMake) => {
    handleSelect(selectedMake);
  };

  return (
    <div>
      <h2 className="step-title">{title}</h2>
      
      {/* Makes with images - show as buttons */}
      <div className="options-container">
        {makesWithImages.map((make) => (
          <button
            key={make}
            className={`vehicle-make-option ${value === make ? 'selected' : ''}`}
            onClick={() => handleSelect(make)}
          >
            <div className="vehicle-logo">
              <img 
                src={`${process.env.PUBLIC_URL}/images/brands/${brandLogos[make]}`} 
                alt={`${make} logo`}
                className="brand-logo-image"
              />
            </div>
            {make}
          </button>
        ))}
      </div>

      {/* Makes without images - show as dropdown */}
      {makesWithoutImages.length > 0 && (
        <div className="other-makes-section">
          <h3 className="other-makes-title">Browse other makes</h3>
          <div className="dropdown-container">
            <button 
              className={`dropdown-trigger ${dropdownOpen ? 'open' : ''} ${value && makesWithoutImages.includes(value) ? 'selected' : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {value && makesWithoutImages.includes(value) ? value : 'Select other make'}
              <span className="dropdown-arrow">▼</span>
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu">
                {makesWithoutImages.map((make) => (
                  <button
                    key={make}
                    className={`dropdown-item ${value === make ? 'selected' : ''}`}
                    onClick={() => handleDropdownSelect(make)}
                  >
                    {make}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleMakeStep; 