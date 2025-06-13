import React from 'react';
import './PreviousButton.css';

const PreviousButton = ({ onPrevious, canGoPrevious }) => {
  if (!canGoPrevious) return null;

  return (
    <button 
      type="button"
      className="previous-button"
      onClick={onPrevious}
    >
      ←
    </button>
  );
};

export default PreviousButton;

