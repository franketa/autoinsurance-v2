import React, { useState, useEffect, useRef } from 'react';
import PreviousButton from '../PreviousButton';
import { validateZipCode } from '../../utils/validations';

const ZipCodeStep = ({ value, onChange, onNext, onPrevious, canGoPrevious, onLocationUpdate }) => {
  const [zipcode, setZipcode] = useState(value || '');
  const [error, setError] = useState('');
  const hasAttemptedLocationFetch = useRef(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate the zip code
    const validation = validateZipCode(zipcode);
    
    if (validation.isValid) {
      setError(''); // Clear any previous errors
      onChange(zipcode);
      onNext();
    } else {
      setError(validation.message);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D+/g, '').slice(0, 5);
    setZipcode(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  // Auto-populate on component mount
  useEffect(() => {
    // Auto-populate zip code based on user's location
    const getZipcode = async () => {
      // Prevent multiple fetches
      if (hasAttemptedLocationFetch.current || zipcode) return;
      
      hasAttemptedLocationFetch.current = true;
      
      try {
        // First, get the user's IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIP = ipData.ip;
        
        console.log('User IP:', userIP);
        
        // Then get location data from our backend
        const locationResponse = await fetch(`/api/location?ip=${userIP}`);
        
        if (!locationResponse.ok) {
          throw new Error(`Location API responded with status: ${locationResponse.status}`);
        }
        
        const locationData = await locationResponse.json();
        console.log('Location data:', locationData);
        
        // Clean up zip code (remove dashes)
        const cleanZip = locationData.zip.replace(/-/g, '');
        
        if (cleanZip) {
          setZipcode(cleanZip);
          onChange(cleanZip); // Update parent component
          
          // Also update city and state if onLocationUpdate is provided
          if (onLocationUpdate) {
            onLocationUpdate({
              city: locationData.city,
              state: locationData.region,
              zipcode: cleanZip
            });
          }
        }
      } catch (error) {
        console.error('Error fetching location:', error);
        
        // If the backend is not running, just continue without auto-population
        if (error.message.includes('Failed to fetch') || error.message.includes('status: 404')) {
          console.warn('Backend server may not be running. Location auto-detection disabled.');
        }
      }
    };

    getZipcode();
  }, []); // Empty dependency array - only run once on mount

  return (
    <div>
      <PreviousButton onPrevious={onPrevious} canGoPrevious={canGoPrevious} />
      <h2 className="step-title">Enter zip code</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className={`form-input ${error ? 'error' : ''}`}
          placeholder="00000"
          value={zipcode}
          onChange={handleChange}
          maxLength={5}
          autoFocus
        />
        {error && <div className="error-message">{error}</div>}
        <button 
          type="submit" 
          className="primary-button"
          disabled={zipcode.length !== 5 || error}
        >
          CHECK RATES
        </button>
      </form>
    </div>
  );
};

export default ZipCodeStep; 