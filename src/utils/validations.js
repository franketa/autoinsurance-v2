// Validation utilities for form fields

// US Zip Code validation
export const validateZipCode = (zipcode) => {
  // Remove any non-digit characters
  const cleanZip = zipcode.replace(/\D/g, '');
  
  // Check if it's a valid 5-digit US zip code
  if (cleanZip.length !== 5) {
    return { isValid: false, message: 'Zip code must be 5 digits' };
  }
  
  // Basic US zip code range validation (00001-99999)
  const zipNumber = parseInt(cleanZip);
  if (zipNumber < 1 || zipNumber > 99999) {
    return { isValid: false, message: 'Please enter a valid US zip code' };
  }
  
  // Additional validation for known invalid zip codes
  const invalidZipCodes = [
    '00000', '11111', '22222', '33333', '44444', 
    '55555', '66666', '77777', '88888', '99999'
  ];
  
  if (invalidZipCodes.includes(cleanZip)) {
    return { isValid: false, message: 'Please enter a valid US zip code' };
  }
  
  return { isValid: true, message: '' };
};

// US Phone Number validation
export const validatePhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if it's empty
  if (!cleanPhone) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  // Check if it has the right number of digits
  // US phone numbers: 10 digits (with area code) or 11 digits (with country code)
  if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    // Valid with country code +1
    return { isValid: true, message: '' };
  } else if (cleanPhone.length === 10) {
    // Valid 10-digit number
    const areaCode = cleanPhone.substring(0, 3);
    
    // Check for invalid area codes
    const invalidAreaCodes = ['000', '555', '911'];
    if (invalidAreaCodes.includes(areaCode)) {
      return { isValid: false, message: 'Please enter a valid phone number' };
    }
    
    // Area code cannot start with 0 or 1
    if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
      return { isValid: false, message: 'Please enter a valid phone number' };
    }
    
    return { isValid: true, message: '' };
  } else {
    return { isValid: false, message: 'Phone number must be 10 digits' };
  }
};

// Format phone number for display
export const formatPhoneNumber = (phone) => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
  } else if (cleanPhone.length === 11 && cleanPhone.startsWith('1')) {
    return `+1 (${cleanPhone.slice(1, 4)}) ${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
  }
  
  return phone; // Return original if not standard format
};

// Check if all required contact info is valid
export const validateContactInfo = (contactData) => {
  const errors = {};
  
  // First name validation
  if (!contactData.firstName || contactData.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  }
  
  // Last name validation
  if (!contactData.lastName || contactData.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!contactData.email || !emailRegex.test(contactData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Phone validation
  const phoneValidation = validatePhoneNumber(contactData.phoneNumber || '');
  if (!phoneValidation.isValid) {
    errors.phoneNumber = phoneValidation.message;
  }
  
  // Street address validation
  if (!contactData.streetAddress || contactData.streetAddress.trim().length < 5) {
    errors.streetAddress = 'Please enter a valid street address';
  }
  
  // City validation
  if (!contactData.city || contactData.city.trim().length < 2) {
    errors.city = 'City must be at least 2 characters';
  }
  
  // State validation (US states - 2 character abbreviation)
  if (!contactData.state || contactData.state.trim().length !== 2) {
    errors.state = 'Please enter a valid 2-letter state code (e.g., CA, NY)';
  } else {
    // Convert to uppercase for validation
    const stateUpper = contactData.state.toUpperCase();
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      'DC'  // District of Columbia
    ];
    
    if (!validStates.includes(stateUpper)) {
      errors.state = 'Please enter a valid US state code';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 