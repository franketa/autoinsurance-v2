import React, { useState, useEffect } from 'react';

const BirthdateStep = ({ value, onChange, onNext }) => {
  // Parse existing value or set empty
  const parseDate = (dateStr) => {
    if (!dateStr) return { month: '', day: '', year: '' };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { month: '', day: '', year: '' };
    
    return {
      month: String(date.getMonth() + 1).padStart(2, '0'),
      day: String(date.getDate()).padStart(2, '0'),
      year: String(date.getFullYear())
    };
  };

  const [dateFields, setDateFields] = useState(parseDate(value));
  const [errors, setErrors] = useState({});

  const handleFieldChange = (field, value) => {
    // Remove any non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    // Apply field-specific length limits
    let limitedValue = numericValue;
    if (field === 'month' || field === 'day') {
      limitedValue = numericValue.slice(0, 2);
    } else if (field === 'year') {
      limitedValue = numericValue.slice(0, 4);
    }

    setDateFields(prev => ({ ...prev, [field]: limitedValue }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-advance to next field
    if (field === 'month' && limitedValue.length === 2) {
      document.getElementById('day-input').focus();
    } else if (field === 'day' && limitedValue.length === 2) {
      document.getElementById('year-input').focus();
    }
  };

  const validateDate = () => {
    const newErrors = {};
    const { month, day, year } = dateFields;

    if (!month || month.length < 1) {
      newErrors.month = 'Required';
    } else if (parseInt(month) < 1 || parseInt(month) > 12) {
      newErrors.month = 'Invalid month';
    }

    if (!day || day.length < 1) {
      newErrors.day = 'Required';
    } else if (parseInt(day) < 1 || parseInt(day) > 31) {
      newErrors.day = 'Invalid day';
    }

    if (!year || year.length < 4) {
      newErrors.year = 'Required';
    } else {
      const currentYear = new Date().getFullYear();
      const birthYear = parseInt(year);
      if (birthYear < 1900 || birthYear > currentYear) {
        newErrors.year = 'Invalid year';
      }
    }

    // Check if the date is valid
    if (!newErrors.month && !newErrors.day && !newErrors.year) {
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (dateObj.getMonth() !== parseInt(month) - 1 || 
          dateObj.getDate() !== parseInt(day) || 
          dateObj.getFullYear() !== parseInt(year)) {
        newErrors.day = 'Invalid date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateDate()) {
      const { month, day, year } = dateFields;
      const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      onChange(formattedDate);
      onNext();
    }
  };

  const isFormValid = () => {
    const { month, day, year } = dateFields;
    return month.length >= 1 && day.length >= 1 && year.length === 4;
  };

  return (
    <div>
      <h2 className="step-title">What is your birthdate?</h2>
      <form onSubmit={handleSubmit}>
        <div className="date-input-container">
          <div className="date-field-group">
            <input
              id="month-input"
              type="text"
              className={`date-field ${errors.month ? 'error' : ''}`}
              value={dateFields.month}
              onChange={(e) => handleFieldChange('month', e.target.value)}
              placeholder="mm"
              maxLength="2"
              autoFocus
            />
            <span className="date-separator">/</span>
            <input
              id="day-input"
              type="text"
              className={`date-field ${errors.day ? 'error' : ''}`}
              value={dateFields.day}
              onChange={(e) => handleFieldChange('day', e.target.value)}
              placeholder="dd"
              maxLength="2"
            />
            <span className="date-separator">/</span>
            <input
              id="year-input"
              type="text"
              className={`date-field ${errors.year ? 'error' : ''}`}
              value={dateFields.year}
              onChange={(e) => handleFieldChange('year', e.target.value)}
              placeholder="yyyy"
              maxLength="4"
            />
          </div>
        </div>
        
        {(errors.month || errors.day || errors.year) && (
          <div className="date-errors">
            {errors.month && <span className="error-message">{errors.month}</span>}
            {errors.day && <span className="error-message">{errors.day}</span>}
            {errors.year && <span className="error-message">{errors.year}</span>}
          </div>
        )}

        <button 
          type="submit" 
          className="primary-button"
          disabled={!isFormValid()}
        >
          CONTINUE
        </button>
      </form>
    </div>
  );
};

export default BirthdateStep; 