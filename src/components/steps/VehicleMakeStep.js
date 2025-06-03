import React from 'react';
import PreviousButton from '../PreviousButton';

const VehicleMakeStep = ({ title, value, onChange, onNext, onPrevious, canGoPrevious, vehicleData, selectedYear }) => {
  // Get makes available for the selected year
  const makes = selectedYear && vehicleData[selectedYear] 
    ? Object.keys(vehicleData[selectedYear]).sort() 
    : [];

  const handleSelect = (selectedMake) => {
    onChange(selectedMake);
    // Auto-advance after selection
    setTimeout(() => {
      onNext();
    }, 300);
  };

  const getBrandLogo = (make) => {
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
      'VOLKSWAGEN': 'volkswagen.png'
    };

    // Fallback emojis for brands without logo images
    const fallbackLogos = {
      'ACURA': '🔴',
      'ALFA ROMEO': '🔴',
      'AUDI': '⚪',
      'DAIHATSU': '🔵',
      'EAGLE': '🟤',
      'GEO': '🟡',
      'INFINITI': '⚫',
      'ISUZU': '🟡',
      'JAGUAR': '🟢',
      'LAND ROVER': '🟢',
      'MAZDA': '🔴',
      'MERCEDES-BENZ': '⚪',
      'MERCURY': '🔵',
      'MITSUBISHI': '🔴',
      'OLDSMOBILE': '🔴',
      'PLYMOUTH': '🔵',
      'PONTIAC': '🔴',
      'PORSCHE': '🟡',
      'SAAB': '🔵',
      'SUZUKI': '🔴',
      'VOLVO': '🔵'
    };

    // Return image if logo exists, otherwise return emoji
    if (brandLogos[make]) {
      return (
        <img 
          src={`/images/brands/${brandLogos[make]}`} 
          alt={`${make} logo`}
          className="brand-logo-image"
        />
      );
    }
    
    return fallbackLogos[make] || '🔘';
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