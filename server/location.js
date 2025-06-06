const express = require('express');
const axios = require('axios');

async function getLocationFromIP(ip) {
  try {
    // Use a free IP geolocation service
    const response = await axios.get(`http://ip-api.com/json/${ip}`);
    const data = response.data;
    
    if (data.status === 'success') {
      return {
        zip: data.zip || '',
        region: data.region || data.regionName || '',
        city: data.city || '',
        country: data.country || '',
        lat: data.lat || '',
        lon: data.lon || ''
      };
    } else {
      throw new Error('Location lookup failed');
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    // Return default values for Seattle, WA if lookup fails
    return {
      zip: '98101',
      region: 'WA',
      city: 'Seattle',
      country: 'US',
      lat: '47.6062',
      lon: '-122.3321'
    };
  }
}

module.exports = { getLocationFromIP }; 