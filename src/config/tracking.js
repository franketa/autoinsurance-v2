// Tracking configuration and environment variables documentation
// This file documents all available environment variables for tracking systems

/*
Environment Variables for Tracking Configuration:

Copy these to your .env file and update with your actual values:

# Google Tag Manager
REACT_APP_GTM_ID=GTM-PPVZD2QR

# Google Analytics  
REACT_APP_GA_ID=G-2XF3PGJPD1

# Everflow Tracking
REACT_APP_EVERFLOW_AID=118
REACT_APP_EVERFLOW_SCRIPT_URL=https://www.iqno4trk.com/scripts/sdk/everflow.js

# Push Engage
REACT_APP_PUSHENGAGE_APP_ID=ea076673-6ca3-43d0-a40f-19e23e59de74
REACT_APP_PUSHENGAGE_SCRIPT_URL=https://clientcdn.pushengage.com/sdks/pushengage-web-sdk.js

# Development/Production flags
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_TRACKING=true
*/

// Configuration object for different environments
export const trackingConfig = {
  development: {
    gtm: {
      id: 'GTM-PPVZD2QR'
    },
    ga: {
      id: 'G-2XF3PGJPD1'
    },
    everflow: {
      aid: 118,
      scriptUrl: 'https://www.iqno4trk.com/scripts/sdk/everflow.js'
    },
    pushEngage: {
      appId: 'ea076673-6ca3-43d0-a40f-19e23e59de74',
      scriptUrl: 'https://clientcdn.pushengage.com/sdks/pushengage-web-sdk.js'
    },
    debug: true
  },
  production: {
    gtm: {
      id: process.env.REACT_APP_GTM_ID || 'GTM-PPVZD2QR'
    },
    ga: {
      id: process.env.REACT_APP_GA_ID || 'G-2XF3PGJPD1'
    },
    everflow: {
      aid: parseInt(process.env.REACT_APP_EVERFLOW_AID) || 118,
      scriptUrl: process.env.REACT_APP_EVERFLOW_SCRIPT_URL || 'https://www.iqno4trk.com/scripts/sdk/everflow.js'
    },
    pushEngage: {
      appId: process.env.REACT_APP_PUSHENGAGE_APP_ID || 'ea076673-6ca3-43d0-a40f-19e23e59de74',
      scriptUrl: process.env.REACT_APP_PUSHENGAGE_SCRIPT_URL || 'https://clientcdn.pushengage.com/sdks/pushengage-web-sdk.js'
    },
    debug: false
  }
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const environment = process.env.REACT_APP_ENVIRONMENT || process.env.NODE_ENV || 'development';
  return trackingConfig[environment] || trackingConfig.development;
};

export default getCurrentConfig; 