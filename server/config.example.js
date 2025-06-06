// Copy this file to config.js and update with your actual values
// DO NOT commit config.js to version control

module.exports = {
  database: {
    host: 'localhost',
    user: 'smartautoinsider_user',
    password: '6UU2^5$dK)2_?^n3K6',
    database: 'smartautoinsider_db'
  },
  
  quoteWizard: {
    contractID: 'E29908C1-CA19-4D3D-9F59-703CD5C12649',
    productionUrl: 'https://quotewizard.com/LeadAPI/Services/SubmitVendorLead',
    stagingUrl: 'https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead'
  },
  
  ignite: {
    apiUrl: 'https://app-dp-tst-wu3.azurewebsites.net/api/Upload/SingleUpload?auth_token=B4YMZ43H31g0o0B9Xxx9'
  },
  
  server: {
    port: 5000,
    environment: 'development'
  }
}; 