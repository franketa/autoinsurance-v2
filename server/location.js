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

async function getLocationFromZip(zipCode) {
  try {
    // Use zippopotam.us for US zip code lookups
    const response = await axios.get(`http://api.zippopotam.us/us/${zipCode}`);
    const data = response.data;
    
    if (data && data.places && data.places.length > 0) {
      const place = data.places[0];
      return {
        zip: zipCode,
        region: place['state abbreviation'] || '',
        city: place['place name'] || '',
        country: data.country || 'US',
        lat: place.latitude || '',
        lon: place.longitude || ''
      };
    } else {
      throw new Error('Zip code not found');
    }
  } catch (error) {
    console.error('Error fetching location from zip:', error);
    // Return the zip code with empty city/state if lookup fails
    return {
      zip: zipCode,
      region: '',
      city: '',
      country: 'US',
      lat: '',
      lon: ''
    };
  }
}

module.exports = { getLocationFromIP, getLocationFromZip }; 