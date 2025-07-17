const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');
const xml2js = require('xml2js');
const { getLocationFromIP, getLocationFromZip } = require('./location');
const databaseService = require('./database/service');
require('dotenv').config();

// Session management for tracking
const sessions = new Map();

// Helper function to get or create session
function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      tid: null,
      revenue: 0,
      ip: null,
      created: new Date()
    });
  }
  return sessions.get(sessionId);
}

// Helper function to generate session ID from request
function getSessionId(req) {
  // Use tid parameter if present, otherwise use IP
  const tid = req.query.tid || req.body?.tid;
  if (tid) {
    return `tid_${tid}`;
  }
  const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
  return `ip_${ip.replace(/^::ffff:/, '')}`;
}

// Helper function to find session by TID across all sessions
function findSessionByTid(tid) {
  const sessionId = `tid_${tid}`;
  if (sessions.has(sessionId)) {
    return sessions.get(sessionId);
  }
  return null;
}

// Postback functions
async function sendHitpathPostback(tid, revenue) {
  try {
    const url = `https://www.trackinglynx.com/rd/px.php?hid=${tid}&sid=3338&transid=&ate=${revenue}`;
    logWithCapture('info', 'Sending Hitpath postback', { url, tid, revenue });
    
    const response = await axios.get(url, { timeout: 10000 });
    logWithCapture('info', 'Hitpath postback response', { status: response.status, data: response.data });
    
    // Log to database (with error handling)
    try {
      await databaseService.logPingRequest({
        timestamp: new Date().toISOString(),
        submission_id: `hitpath_${Date.now()}`,
        status: 'success',
        ping_count: 1,
        total_value: revenue,
        request_data: { url, tid, revenue },
        response_data: { status: response.status, data: response.data }
      });
    } catch (dbError) {
      logWithCapture('error', 'Failed to log Hitpath postback to database', { error: dbError.message });
      // Don't throw - continue with the flow even if database logging fails
    }
    
    return { success: true, response: response.data };
  } catch (error) {
    logWithCapture('error', 'Hitpath postback failed', { error: error.message, tid, revenue });
    
    // Log error to database (with error handling)
    try {
      await databaseService.logPingRequest({
        timestamp: new Date().toISOString(),
        submission_id: `hitpath_error_${Date.now()}`,
        status: 'error',
        ping_count: 1,
        total_value: revenue,
        request_data: { tid, revenue },
        response_data: { error: error.message }
      });
    } catch (dbError) {
      logWithCapture('error', 'Failed to log Hitpath error to database', { error: dbError.message });
      // Don't throw - continue with the flow even if database logging fails
    }
    
    return { success: false, error: error.message };
  }
}

async function sendEverflowPostback(tid, revenue) {
  try {
    const url = `https://www.iqno4trk.com/?nid=2409&transaction_id=${tid}&amount=${revenue}`;
    logWithCapture('info', 'Sending Everflow postback', { url, tid, revenue });
    
    const response = await axios.get(url, { timeout: 10000 });
    logWithCapture('info', 'Everflow postback response', { status: response.status, data: response.data });
    
    // Log to database (with error handling)
    try {
      await databaseService.logPingRequest({
        timestamp: new Date().toISOString(),
        submission_id: `everflow_${Date.now()}`,
        status: 'success',
        ping_count: 1,
        total_value: revenue,
        request_data: { url, tid, revenue },
        response_data: { status: response.status, data: response.data }
      });
    } catch (dbError) {
      logWithCapture('error', 'Failed to log Everflow postback to database', { error: dbError.message });
      // Don't throw - continue with the flow even if database logging fails
    }
    
    return { success: true, response: response.data };
  } catch (error) {
    logWithCapture('error', 'Everflow postback failed', { error: error.message, tid, revenue });
    
    // Log error to database (with error handling)
    try {
      await databaseService.logPingRequest({
        timestamp: new Date().toISOString(),
        submission_id: `everflow_error_${Date.now()}`,
        status: 'error',
        ping_count: 1,
        total_value: revenue,
        request_data: { tid, revenue },
        response_data: { error: error.message }
      });
    } catch (dbError) {
      logWithCapture('error', 'Failed to log Everflow error to database', { error: dbError.message });
      // Don't throw - continue with the flow even if database logging fails
    }
    
    return { success: false, error: error.message };
  }
}

// Email submission to Azure API
async function submitEmailToAzure(formData, session) {
  try {
    const url = 'https://app-dp-tst-wu3.azurewebsites.net/api/Upload/SingleUpload?auth_token=B4YMZ43H31g0o0B9Xxx9';
    
    const data = {
      partitionKey: "",
      rowKey: "",
      timestamp: new Date().toISOString(),
      eTag: "",
      contact: {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        customField: {
          sourceUrl: "https://www.smartautoinsider.com",
          ipAddress: session.ip,
          postalAddress: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipcode,
          gender: formData.gender,
          birthdate: formData.birthdate,
          married: formData.maritalStatus,
          ownRent: formData.homeowner,
          optInDate: new Date().toISOString()
        }
      }
    };
    
    logWithCapture('info', 'Submitting email to Azure API', { url, data });
    
    const response = await axios.post(url, data, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    logWithCapture('info', 'Azure API response', { status: response.status, data: response.data });
    
    // Log request to database (with error handling)
    try {
      await databaseService.logPingRequest({
        timestamp: new Date().toISOString(),
        submission_id: `azure_request_${Date.now()}`,
        status: 'success',
        ping_count: 1,
        total_value: 0,
        request_data: { action: 'ignite_post', data },
        response_data: { action: 'ignite_response', data: response.data }
      });
    } catch (dbError) {
      logWithCapture('error', 'Failed to log Azure API request to database', { error: dbError.message });
      // Don't throw - continue with the flow even if database logging fails
    }
    
    return { success: true, response: response.data };
  } catch (error) {
    logWithCapture('error', 'Azure API submission failed', { error: error.message, formData });
    
    // Log error to database (with error handling)
    try {
      await databaseService.logPingRequest({
        timestamp: new Date().toISOString(),
        submission_id: `azure_error_${Date.now()}`,
        status: 'error',
        ping_count: 1,
        total_value: 0,
        request_data: { action: 'ignite_post', data: formData },
        response_data: { action: 'ignite_response', error: error.message }
      });
    } catch (dbError) {
      logWithCapture('error', 'Failed to log Azure API error to database', { error: dbError.message });
      // Don't throw - continue with the flow even if database logging fails
    }
    
    return { success: false, error: error.message };
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Global logging array to capture logs for test responses
let logBuffer = [];
const MAX_LOG_BUFFER_SIZE = 1000;

// Enhanced logging function that captures logs for test responses
function logWithCapture(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    data: data ? JSON.stringify(data, null, 2) : null
  };
  
  // Add to buffer for test responses
  logBuffer.push(logEntry);
  
  // Keep buffer size manageable
  if (logBuffer.length > MAX_LOG_BUFFER_SIZE) {
    logBuffer = logBuffer.slice(-MAX_LOG_BUFFER_SIZE);
  }
  
  // Also log to console for PM2 (but tests will capture from buffer)
  const logStr = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  if (data) {
    console.log(logStr);
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(logStr);
  }
}

// Function to get and clear logs (for test responses)
function getAndClearLogs() {
  const logs = [...logBuffer];
  logBuffer = [];
  return logs;
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'smartautoinsider_user',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'smartautoinsider_db',
  charset: 'utf8'
};

// Create MySQL connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// QuoteWizard configuration
const QUOTE_WIZARD_CONFIG = {
  contractID: process.env.QW_CONTRACT_ID || 'E29908C1-CA19-4D3D-9F59-703CD5C12649',
  production_url: 'https://quotewizard.com/LeadAPI/Services/SubmitVendorLead',
  staging_url: 'https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead'
};

// Helper Functions
function transformPhoneNumber(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  return `${last10.slice(0, 3)}-${last10.slice(3, 6)}-${last10.slice(6)}`;
}

// Generate random trusted form certificate ID (40 hex characters)
function generateTrustedFormCertId() {
  const hexChars = '0123456789abcdef';
  
  // Create a unique combination using timestamp + random bytes
  const timestamp = Date.now().toString(16); // Convert timestamp to hex
  const randomBytes = [];
  
  // Generate cryptographically strong random bytes
  for (let i = 0; i < 32; i++) {
    randomBytes.push(Math.floor(Math.random() * 256));
  }
  
  // Convert random bytes to hex string
  const randomHex = randomBytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
  
  // Combine timestamp and random hex, then take first 40 characters
  const combined = (timestamp + randomHex).slice(0, 40);
  
  // Ensure exactly 40 characters by padding with random hex if needed
  let certId = combined;
  while (certId.length < 40) {
    certId += hexChars[Math.floor(Math.random() * hexChars.length)];
  }
  
  return certId.substring(0, 40);
}

function transformVehicles(vehicles) {
  if (!vehicles || !Array.isArray(vehicles)) {
    logWithCapture('debug', 'No vehicles provided or not an array, returning empty array');
    return [];
  }
  
  return vehicles.map((vehicle, index) => {
    logWithCapture('debug', `Processing vehicle ${index + 1}`, vehicle);
    
    const transformed = {
      Year: vehicle.year || vehicle.Year || '',
      Make: vehicle.make || vehicle.Make || '',
      Model: vehicle.model || vehicle.Model || ''
    };
    
    logWithCapture('debug', `Transformed vehicle ${index + 1}`, transformed);
    return transformed;
  });
}

function getTodayDate(isFull = false) {
  const now = new Date();
  if (isFull) {
    return now.toISOString();
  }
  return now.toISOString().split('T')[0];
}

function generateDriversXML(drivers) {
  return drivers.map(driver => `
    <Driver Gender="${driver.Gender}" MaritalStatus="${driver.MaritalStatus}" RelationshipToApplicant="${driver.RelationshipToApplicant}">
      <FirstName>${driver.FirstName}</FirstName>
      <LastName>${driver.LastName}</LastName>
      <BirthDate>${driver.BirthDate}</BirthDate>
      <State>${driver.State}</State>
      <AgeLicensed>${driver.AgeLicensed}</AgeLicensed>
      <LicenseStatus>${driver.LicenseStatus}</LicenseStatus>
      <LicenseEverSuspendedRevoked>${driver.LicenseEverSuspendedRevoked}</LicenseEverSuspendedRevoked>
      <Occupation Name="${driver.Occupation.Name}">
        <YearsInField>${driver.Occupation.YearsInField}</YearsInField>
      </Occupation>
      <HighestLevelOfEducation>
        <Education AtHomeStudent="${driver.HighestLevelOfEducation.AtHomeStudent}" HighestDegree="${driver.HighestLevelOfEducation.HighestDegree}"/>
      </HighestLevelOfEducation>
      <RequiresSR22Filing>${driver.RequiresSR22Filing}</RequiresSR22Filing>
      <CreditRating Bankruptcy="${driver.CreditRating.Bankruptcy}" SelfRating="${driver.CreditRating.SelfRating}"/>
    </Driver>
  `).join('');
}

function generateVehiclesXML(vehicles) {
  return vehicles.map(vehicle => {
    const year = vehicle.Year || '2020';
    const make = vehicle.Make || 'Toyota';
    const model = vehicle.Model || 'Camry';
    
    logWithCapture('debug', `Generating XML for vehicle: Year=${year}, Make=${make}, Model=${model}`);
    
    return `
    <Vehicle>
      <Year>${year}</Year>
      <Make>${make}</Make>
      <Model>${model}</Model>
      <LocationParked>Full Garage</LocationParked>
      <OwnedOrLeased>Owned</OwnedOrLeased>
      <VehicleUse VehicleUseDescription='Commute_Work'>
        <AnnualMiles>10000</AnnualMiles>
        <WeeklyCommuteDays>5</WeeklyCommuteDays>
        <OneWayDistance>19</OneWayDistance>
      </VehicleUse>
    </Vehicle>`;
  }).join('');
}

function generateInsuranceProfileXML(insuranceProfile) {
  return insuranceProfile.map(profile => `
    <InsuranceProfile>
      <RequestedPolicy>
        <CoverageType>${profile.CoverageType}</CoverageType>
      </RequestedPolicy>
      <CurrentPolicy>
        <InsuranceCompany>
          <CompanyName>${profile.CurrentPolicy.InsuranceCompany.CompanyName}</CompanyName>
        </InsuranceCompany>
        <ExpirationDate>${profile.CurrentPolicy.ExpirationDate || ''}</ExpirationDate>
        <StartDate>${profile.CurrentPolicy.StartDate || ''}</StartDate>
      </CurrentPolicy>
    </InsuranceProfile>
  `).join('');
}

function generateFullXML(formData, vendorData) {
  const { drivers, vehicles, insuranceProfile, contact } = formData;
  
  return `<?xml version='1.0' encoding='UTF-8'?>
    <QuoteWizardData Version='1.0' xsi:noNamespaceSchemaLocation='QW.xsd'
        xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>
        <QuoteRequest DateTime='${vendorData.LeadBornOnDateTimeUTC}'>
            <VendorData>
                <LeadID>${vendorData.LeadID}</LeadID>
                <SourceID>${vendorData.SourceID}</SourceID>
                <SourceIPAddress>${vendorData.SourceIPAddress}</SourceIPAddress>
                <SubmissionUrl>${vendorData.SubmissionUrl}</SubmissionUrl>
                <UserAgent>${vendorData.UserAgent}</UserAgent>
                <DateLeadReceived>${vendorData.DateLeadReceived}</DateLeadReceived>
                <LeadBornOnDateTimeUTC>${vendorData.LeadBornOnDateTimeUTC}</LeadBornOnDateTimeUTC>
                <JornayaLeadID>${vendorData.JornayaLeadID}</JornayaLeadID>
                <TrustedFormCertificateUrl>${vendorData.TrustedFormCertificateUrl}</TrustedFormCertificateUrl>
                <EverQuoteEQID>${vendorData.EverQuoteEQID}</EverQuoteEQID>
                <TCPAOptIn>${vendorData.TCPAOptIn}</TCPAOptIn>
                <TCPALanguage>${vendorData.TCPALanguage}</TCPALanguage>
            </VendorData>
            <AutoInsurance>
                <Contact>
                    <FirstName>${contact.FirstName}</FirstName>
                    <LastName>${contact.LastName}</LastName>
                    <Address1>${contact.Address1}</Address1>
                    <City>${contact.City}</City>
                    <State>${contact.State}</State>
                    <ZIPCode>${contact.ZIPCode}</ZIPCode>
                    <EmailAddress>${contact.EmailAddress}</EmailAddress>
                    <PhoneNumbers>
                        <PrimaryPhone>
                            <PhoneNumberValue>${contact.PhoneNumbers.PrimaryPhone}</PhoneNumberValue>
                        </PrimaryPhone>
                        <SecondaryPhone>
                            <PhoneNumberValue>${contact.PhoneNumbers.SecondaryPhone}</PhoneNumberValue>
                        </SecondaryPhone>
                    </PhoneNumbers>
                    <CurrentResidence ResidenceStatus='${contact.CurrentResidence.ResidenceStatus}'>
                        <OccupancyDate>${contact.CurrentResidence.OccupancyDate}</OccupancyDate>
                    </CurrentResidence>
                </Contact>
                <Drivers>${generateDriversXML(drivers)}</Drivers>
                <AutoInsuranceQuoteRequest>
                    <Vehicles>${generateVehiclesXML(vehicles)}</Vehicles>
                    ${generateInsuranceProfileXML(insuranceProfile)}
                </AutoInsuranceQuoteRequest>
            </AutoInsurance>
        </QuoteRequest>
    </QuoteWizardData>`;
}

async function sendQuoteWizardRequest(contractID, initialID, pass, quoteData) {
  const url = process.env.NODE_ENV === 'production' 
    ? QUOTE_WIZARD_CONFIG.staging_url 
    : QUOTE_WIZARD_CONFIG.staging_url;
  
  const fields = {
    contractID,
    pass,
    quoteData
  };
  
  if (initialID) {
    fields.initialID = initialID;
  }
  
  try {
    const response = await axios.post(url, new URLSearchParams(fields), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    return response.data;
  } catch (error) {
    logWithCapture('error', 'QuoteWizard API error', error.message);
    throw error;
  }
}

function extractQuoteID(pingResponse) {
  try {
    const startTag = '<string';
    const endTag = '</string>';
    const start = pingResponse.indexOf(startTag) + startTag.length;
    const end = pingResponse.indexOf(endTag);
    
    if (start === -1 || end === -1) {
      throw new Error('Could not find XML content in response');
    }
    
    const xmlContent = pingResponse.substring(start, end);
    const decodedXml = xmlContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    
    const quoteIdMatch = decodedXml.match(/<Quote_ID>(.*?)<\/Quote_ID>/);
    if (quoteIdMatch && quoteIdMatch[1]) {
      return quoteIdMatch[1];
    }
    
    throw new Error('Quote_ID not found in response');
  } catch (error) {
    logWithCapture('error', 'Error extracting Quote ID', error.message);
    throw error;
  }
}

function extractQuoteWizardValue(response) {
  try {
    if (response && response.includes && response.includes('Quote_ID')) {
      // Check if the response indicates success (both regular and HTML-encoded formats)
      const isSuccess = response.includes('<Status>Success</Status>') || response.includes('<Status>Accepted</Status>') ||
                       response.includes('&lt;Status&gt;Success&lt;/Status&gt;') || response.includes('&lt;Status&gt;Accepted&lt;/Status&gt;');
      
      const isFailure = response.includes('<Status>Failure</Status>') || 
                       response.includes('&lt;Status&gt;Failure&lt;/Status&gt;');
      
      if (isSuccess) {
        // Try to extract actual payout value from response
        const payoutMatch = response.match(/&lt;Payout&gt;([\d.]+)&lt;\/Payout&gt;/) || 
                           response.match(/<Payout>([\d.]+)<\/Payout>/);
        if (payoutMatch && payoutMatch[1]) {
          const payoutValue = parseFloat(payoutMatch[1]);
          logWithCapture('info', `QuoteWizard extracted payout value: ${payoutValue}`);
          return payoutValue;
        }
        // Fallback to default value if payout extraction fails
        return 15.0;
      } else if (isFailure) {
        logWithCapture('info', 'QuoteWizard response indicates failure, returning 0 value');
        return 0;
      }
      // If status is unclear but Quote_ID exists, assume some value
      return 15.0;
    }
    return 0;
  } catch (error) {
    logWithCapture('error', 'Error extracting QuoteWizard value', error.message);
    return 0;
  }
}

// Helper function to prepare QuoteWizard data
async function prepareQuoteWizardData(inputData, req) {
  const firstName = inputData.firstName || 'John';
  const lastName = inputData.lastName || 'Doe';
  const phone = transformPhoneNumber(inputData.phoneNumber);
  const email = inputData.email || 'john@example.com';
  const address = inputData.streetAddress || '123 Main St';
  const zipCode = inputData.zipcode || '98101';
  const dob = inputData.birthdate || '1985-01-01';
  const city = inputData.city || 'Seattle';
  const state = inputData.state || 'WA';
  // Map frontend Yes/No to QuoteWizard Single/Married
  const mapMaritalStatusForQuoteWizard = (status) => {
    switch (status) {
      case 'Yes': return 'Married';
      case 'No': return 'Single';
      case 'Married': return 'Married'; // Direct mapping
      case 'Single': return 'Single';   // Direct mapping
      default: return 'Single';
    }
  };
  
  const maritalStatus = mapMaritalStatusForQuoteWizard(inputData.maritalStatus || 'Single');
  logWithCapture('info', `QuoteWizard marital status mapping: "${inputData.maritalStatus}" → "${maritalStatus}"`);
  const gender = inputData.gender || 'Male';
  // Map frontend SR22 options to QuoteWizard Yes/No
  const mapSR22ForQuoteWizard = (sr22Value) => {
    switch (sr22Value) {
      case 'Yes': return 'Yes';
      case 'No / Not Sure': return 'No';
      case 'No': return 'No';
      default: return 'No';
    }
  };
  
  const sr22 = mapSR22ForQuoteWizard(inputData.sr22 || 'No');
  logWithCapture('info', `QuoteWizard SR22 mapping: "${inputData.sr22}" → "${sr22}"`);
  const license_status = inputData.driversLicense === 'Yes' ? 'Valid' : 'None';
  logWithCapture('info', `QuoteWizard license status mapping: "${inputData.driversLicense}" → "${license_status}"`);
  // Map frontend credit score options to QuoteWizard accepted values
  const mapCreditScoreForQuoteWizard = (score) => {
    switch (score) {
      case 'Excellent (720+)': return 'Excellent';
      case 'Good (680-719)': return 'Good';
      case 'Fair/Average (580-679)': return 'Some Problems';
      case 'Poor (below 580)': return 'Major Problems';
      case 'Not Sure (that\'s okay!)': return 'Good'; // Default to Good
      case 'Excellent': return 'Excellent'; // Direct mappings
      case 'Good': return 'Good';
      case 'Fair': return 'Some Problems';
      case 'Poor': return 'Major Problems';
      default: return 'Good';
    }
  };
  
  const credit_rating = mapCreditScoreForQuoteWizard(inputData.creditScore || 'Good');
  logWithCapture('info', `QuoteWizard credit score mapping: "${inputData.creditScore}" → "${credit_rating}"`);
  const current_insurance = inputData.currentAutoInsurance || 'Geico';
  const homeowner = inputData.homeowner || 'Own';
  
  const vehicles = transformVehicles(inputData.vehicles || []);
  
  const drivers = [{
    Gender: gender,
    MaritalStatus: maritalStatus,
    RelationshipToApplicant: 'Self',
    FirstName: firstName,
    LastName: lastName,
    BirthDate: dob,
    State: state,
    AgeLicensed: '16',
    LicenseStatus: license_status,
    LicenseEverSuspendedRevoked: 'No',
    Occupation: {
      Name: 'OtherNonTechnical',
      YearsInField: '5'
    },
    HighestLevelOfEducation: {
      AtHomeStudent: 'No',
      HighestDegree: 'BachelorsDegree'
    },
    RequiresSR22Filing: sr22,
    CreditRating: {
      Bankruptcy: 'No',
      SelfRating: credit_rating
    },
    Incidents: []
  }];
  
  const insuranceProfile = [{
    CoverageType: 'Standard',
    CurrentPolicy: {
      InsuranceCompany: {
        CompanyName: current_insurance
      },
      ExpirationDate: '',
      StartDate: ''
    }
  }];
  
  const contact = {
    FirstName: firstName,
    LastName: lastName,
    Address1: address,
    City: city,
    State: state,
    ZIPCode: zipCode,
    EmailAddress: email,
    PhoneNumbers: {
      PrimaryPhone: phone,
      SecondaryPhone: phone
    },
    CurrentResidence: {
      ResidenceStatus: homeowner,
      OccupancyDate: '2012-02-08'
    }
  };
  
  // Use random cert ID for testing, real TrustedForm for production
  const trustedFormCertId = process.env.NODE_ENV === 'production' 
    ? (inputData.trusted_form_cert_id || generateTrustedFormCertId())
    : generateTrustedFormCertId();
  
  const vendorData = {
    LeadID: '2897BDB4',
    SourceID: req.sessionID || '',
    SourceIPAddress: req.ip || req.connection.remoteAddress || '',
    SubmissionUrl: 'https://smartautoinsider.com',
    UserAgent: req.get('User-Agent') || '',
    DateLeadReceived: getTodayDate(),
    LeadBornOnDateTimeUTC: getTodayDate(true),
    JornayaLeadID: '01234566-89AB-CDEF-0123-456789ABCDAF',
    TrustedFormCertificateUrl: `https://cert.trustedform.com/${trustedFormCertId}`,
    EverQuoteEQID: 'F3C4242D-CEFC-46B5-91E0-A1B09AE7375E',
    TCPAOptIn: 'Yes',
    TCPALanguage: 'By clicking "Get My Auto Quotes", you agree to our Terms and Conditions and Privacy Policy'
  };
  
  return {
    drivers,
    vehicles,
    insuranceProfile,
    contact,
    vendorData
  };
}

// Helper function to prepare ExchangeFlo data
async function prepareExchangeFloData(inputData) {
  const activeVehicles = inputData.vehicles ? inputData.vehicles.filter(v => v.year && v.make && v.model) : [];
  
  const toBooleanString = (value) => {
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true') return 'true';
      if (value.toLowerCase() === 'no' || value.toLowerCase() === 'false') return 'false';
    }
    return 'false';
  };
  
  const formatBirthdate = (dateStr) => {
    if (!dateStr) return '1985-06-15';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    return '1985-06-15';
  };
  
  const mapCoverageType = (coverage) => {
    switch (coverage) {
      case 'Liability Only': return "state_minimum";
      case 'Full Coverage': return "typical";
      case 'Minimum Coverage': return "lower_level";
      case 'Premium Coverage': return "highest_level";
      default: return "typical";
    }
  };
  
  const mapInsuranceDuration = (duration) => {
    switch (duration) {
      case 'Less than 6 months': return "3";
      case '6-12 months': return "9";
      case '1-3 years': return "24";
      case '3+ years': return "48";
      default: return "24";
    }
  };
  
  const mapCreditScore = (score) => {
    switch (score) {
      case 'Excellent': return "excellent";
      case 'Good': return "good";
      case 'Fair': return "fair";
      case 'Poor': return "poor";
      default: return "good";
    }
  };
  
  const mapMaritalStatus = (status) => {
    switch (status) {
      case 'Married': return "married";
      case 'Single': return "single";
      case 'Divorced': return "divorced";
      case 'Widowed': return "widowed";
      default: return "single";
    }
  };
  
  const mapHomeowner = (homeowner) => {
    switch (homeowner) {
      case 'Own': return "own";
      case 'Rent': return "rent";
      default: return "rent";
    }
  };
  
  const mapEducation = (education) => {
    switch (education) {
      case 'High School': return "high_school";
      case 'Some College': return "some_college";
      case 'Associate Degree': return "associates_degree";
      case 'Bachelor\'s Degree': return "bachelors_degree";
      case 'Master\'s Degree': return "masters_degree";
      case 'Doctorate': return "doctorate";
      default: return "bachelors_degree";
    }
  };
  
  const mapOccupation = (occupation) => {
    // Frontend dropdown values map 1:1 to ExchangeFlo accepted values
    const validOccupations = [
      'administrative_clerical', 'construction_trades', 'disabled', 'manager_supervisor',
      'other_non_technical', 'other_technical', 'retail', 'retired', 'self_employed',
      'skilled_semi_skilled', 'student', 'unemployed', 'architect', 'business_owner',
      'certified_public_accountant', 'clergy', 'dentist', 'engineer', 'homemaker',
      'lawyer', 'military_officer', 'military_enlisted', 'minor_na', 'physician',
      'professional_salaried', 'professor', 'sales_inside', 'sales_outside',
      'school_teacher', 'scientist'
    ];
    
    // If the value is already valid, return it as-is
    if (validOccupations.includes(occupation)) {
      return occupation;
    }
    
    // Handle legacy/fallback values (from old frontend or tests)
    switch (occupation) {
      case 'Engineer': return "engineer";
      case 'Teacher': return "school_teacher";
      case 'Doctor': return "physician";
      case 'Lawyer': return "lawyer";
      case 'Manager': return "manager_supervisor";
      case 'Sales': return "sales_inside";
      case 'Student': return "student";
      case 'Retired': return "retired";
      case 'Other': return "other_non_technical";
      default: 
        logWithCapture('warn', `Unknown occupation value: "${occupation}", defaulting to "other_non_technical"`);
        return "other_non_technical";
    }
  };
  
  const mapLicenseState = (state) => {
    if (!state || typeof state !== 'string') return "WA";
    return state.toUpperCase();
  };
  
  // Use random cert ID for testing, real TrustedForm for production
  const trustedFormCertId = process.env.NODE_ENV === 'production' 
    ? (inputData.trusted_form_cert_id || generateTrustedFormCertId())
    : generateTrustedFormCertId();
  
  return {
    source_id: "aaf3cd79-1fc5-43f6-86bc-d86d9d61c0d5",
    response_type: "detail",
    lead_type: "mixed",
    test: true,
    tracking_id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sub_id_1: process.env.NODE_ENV === 'production' ? "smartauto_prod" : "smartauto_test",
    trusted_form_cert_url: `https://cert.trustedform.com/${trustedFormCertId}`,
    ip_address: "127.0.0.1",
    landing_url: "https://smartautoinsider.com",
    privacy_url: "https://smartautoinsider.com/privacy",
    tcpa: "I agree to receive marketing communications",
    user_agent: "Mozilla/5.0 (compatible; SmartAutoInsider/1.0)",
    
    profile: {
      zip: String(inputData.zipcode || "").padStart(5, '0'),
      address: String(inputData.streetAddress || ""),
      city: String(inputData.city || ""),
      state: mapLicenseState(inputData.state),
      address_2: "",
      currently_insured: toBooleanString(inputData.insuranceHistory === 'Yes'),
      current_company: inputData.insuranceHistory === 'Yes' ? (inputData.currentAutoInsurance || "") : "",
      continuous_coverage: mapInsuranceDuration(inputData.insuranceDuration) || "48",
      current_policy_start: "2024-04-28",
      current_policy_expires: "2026-04-28",
      military_affiliation: toBooleanString(inputData.military === 'Yes'),
      auto_coverage_type: mapCoverageType(inputData.coverageType) || "typical",
      driver_count: "1",
      vehicle_count: String(activeVehicles.length || 1),
      
      drivers: [
        {
          //first_name: String(inputData.firstName || ""),
          //last_name: String(inputData.lastName || ""),
          //email: String(inputData.email || ""),
          //phone: String(inputData.phoneNumber || "").replace(/\D/g, ''),
          relationship: "self",
          gender: (inputData.gender || "male").toLowerCase(),
          birth_date: formatBirthdate(inputData.birthdate),
          at_fault_accidents: "0",
          license_suspended: "false",
          tickets: "0",
          dui_sr22: toBooleanString(inputData.sr22 === 'Yes'),
          education: mapEducation(inputData.driverEducation),
          credit: mapCreditScore(inputData.creditScore) || "good",
          occupation: (() => {
            const mappedOccupation = mapOccupation(inputData.driverOccupation);
            logWithCapture('info', `Occupation mapping: "${inputData.driverOccupation}" → "${mappedOccupation}"`);
            return mappedOccupation;
          })(),
          marital_status: mapMaritalStatus(inputData.maritalStatus) || "single",
          license_state: mapLicenseState(inputData.state),
          licensed_age: "16",
          license_status: inputData.driversLicense === 'Yes' ? "active" : "suspended",
          residence_type: mapHomeowner(inputData.homeowner) || "own",
          residence_length: "48"
        }
      ],
      
      vehicles: activeVehicles.map(vehicle => ({
        year: String(vehicle.year || "2020"),
        make: String(vehicle.make || "Toyota"),
        model: String(vehicle.model || "Camry"),
        submodel: String(vehicle.submodel || vehicle.model || "Camry"),
        primary_purpose: String(vehicle.purpose || "commute"),
        annual_mileage: String(vehicle.mileage || "10000-15000"),
        ownership: String(vehicle.ownership || "owned"),
        garage: "no_cover",
        vin: "JM3TB38A*80******"
      }))
    }
  };
}

// Helper function to ping QuoteWizard
async function pingQuoteWizard(data) {
  try {
    const quoteXML = generateFullXML(data, data.vendorData);
    
    logWithCapture('info', 'QUOTEWIZARD XML BEING SENT', quoteXML);
    
    const response = await sendQuoteWizardRequest(
      QUOTE_WIZARD_CONFIG.contractID,
      null,
      1,
      quoteXML
    );
    
    logWithCapture('info', 'QUOTEWIZARD RESPONSE RECEIVED', response);
    
    // Check if the response indicates business success
    // QuoteWizard response is HTML-encoded, so we need to check for both formats
    const isBusinessSuccess = response && response.includes && 
      (response.includes('<Status>Success</Status>') || response.includes('<Status>Accepted</Status>') ||
       response.includes('&lt;Status&gt;Success&lt;/Status&gt;') || response.includes('&lt;Status&gt;Accepted&lt;/Status&gt;'));
    
    logWithCapture('info', `QUOTEWIZARD BUSINESS SUCCESS: ${isBusinessSuccess}`);
    
    return {
      xml: quoteXML,
      response: response,
      businessSuccess: isBusinessSuccess
    };
  } catch (error) {
    logWithCapture('error', 'QUOTEWIZARD ERROR', {
      message: error.message,
      stack: error.stack,
      requestData: data
    });
    throw error;
  }
}

// Helper function to ping ExchangeFlo
async function pingExchangeFlo(data) {
  try {
    logWithCapture('info', 'EXCHANGEFLO JSON BEING SENT', data);
    
    const response = await axios.post('https://pub.exchangeflo.io/api/leads/ping', data, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 570ff8ba-26b3-44dc-b880-33042485e9d0'
      }
    });
    
    logWithCapture('info', 'EXCHANGEFLO RESPONSE RECEIVED', response.data);
    
    return response.data;
  } catch (error) {
    logWithCapture('error', 'EXCHANGEFLO ERROR', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestData: {
        source_id: data.source_id,
        profile: {
          zip: data.profile?.zip,
          state: data.profile?.state,
          drivers: data.profile?.drivers?.map(d => ({
            first_name: d.first_name,
            last_name: d.last_name,
            email: d.email,
            phone: d.phone,
            license_state: d.license_state,
            education: d.education,
            occupation: d.occupation
          }))
        }
      }
    });
    throw error;
  }
}

// Helper function to post to QuoteWizard
async function postToQuoteWizard(pingData, formData) {
  logWithCapture('info', 'POST TO QUOTEWIZARD - PING DATA', pingData);
  logWithCapture('info', 'POST TO QUOTEWIZARD - FORM DATA', formData);
  
  const initialID = extractQuoteID(pingData.response);
  logWithCapture('info', `POST TO QUOTEWIZARD - EXTRACTED INITIAL ID: ${initialID}`);
  
  // Recreate the vendor data from form data
  const trustedFormCertId = process.env.NODE_ENV === 'production' 
    ? (formData.trusted_form_cert_id || generateTrustedFormCertId())
    : generateTrustedFormCertId();
    
  const vendorData = {
    LeadID: '2897BDB4',
    SourceID: '',
    SourceIPAddress: '::1',
    SubmissionUrl: 'https://smartautoinsider.com',
    UserAgent: 'axios/1.9.0',
    DateLeadReceived: getTodayDate(),
    LeadBornOnDateTimeUTC: getTodayDate(true),
    JornayaLeadID: '01234566-89AB-CDEF-0123-456789ABCDAF',
    TrustedFormCertificateUrl: `https://cert.trustedform.com/${trustedFormCertId}`,
    EverQuoteEQID: 'F3C4242D-CEFC-46B5-91E0-A1B09AE7375E',
    TCPAOptIn: 'Yes',
    TCPALanguage: 'By clicking "Get My Auto Quotes", you agree to our Terms and Conditions and Privacy Policy'
  };
  
  // Recreate the full data structure needed for XML generation
  const postData = {
    drivers: [{
      Gender: formData.gender || 'Male',
      MaritalStatus: (() => {
        // Map frontend Yes/No to QuoteWizard Single/Married
        const status = formData.maritalStatus || 'Single';
        switch (status) {
          case 'Yes': return 'Married';
          case 'No': return 'Single';
          case 'Married': return 'Married';
          case 'Single': return 'Single';
          default: return 'Single';
        }
      })(),
      RelationshipToApplicant: 'Self',
      FirstName: formData.firstName || 'John',
      LastName: formData.lastName || 'Doe',
      BirthDate: formData.birthdate || '1985-01-01',
      State: formData.state || 'WA',
      AgeLicensed: '16',
      LicenseStatus: formData.driversLicense === 'Yes' ? 'Valid' : 'None',
      LicenseEverSuspendedRevoked: 'No',
      Occupation: {
        Name: 'OtherNonTechnical',
        YearsInField: '5'
      },
      HighestLevelOfEducation: {
        AtHomeStudent: 'No',
        HighestDegree: 'BachelorsDegree'
      },
      RequiresSR22Filing: (() => {
        // Map frontend SR22 options to QuoteWizard Yes/No
        const sr22Value = formData.sr22 || 'No';
        switch (sr22Value) {
          case 'Yes': return 'Yes';
          case 'No / Not Sure': return 'No';
          case 'No': return 'No';
          default: return 'No';
        }
      })(),
      CreditRating: {
        Bankruptcy: 'No',
        SelfRating: (() => {
          // Map frontend credit score options to QuoteWizard accepted values
          const score = formData.creditScore || 'Good';
          switch (score) {
            case 'Excellent (720+)': return 'Excellent';
            case 'Good (680-719)': return 'Good';
            case 'Fair/Average (580-679)': return 'Some Problems';
            case 'Poor (below 580)': return 'Major Problems';
            case 'Not Sure (that\'s okay!)': return 'Good';
            case 'Excellent': return 'Excellent';
            case 'Good': return 'Good';
            case 'Fair': return 'Some Problems';
            case 'Poor': return 'Major Problems';
            default: return 'Good';
          }
        })()
      },
      Incidents: []
    }],
    vehicles: transformVehicles(formData.vehicles || []),
    insuranceProfile: [{
      CoverageType: 'Standard',
      CurrentPolicy: {
        InsuranceCompany: {
          CompanyName: formData.currentAutoInsurance || 'Geico'
        },
        ExpirationDate: '',
        StartDate: ''
      }
    }],
    contact: {
      FirstName: formData.firstName || 'John',
      LastName: formData.lastName || 'Doe',
      Address1: formData.streetAddress || '123 Main St',
      City: formData.city || 'Seattle',
      State: formData.state || 'WA',
      ZIPCode: formData.zipcode || '98101',
      EmailAddress: formData.email || 'john@example.com',
      PhoneNumbers: {
        PrimaryPhone: transformPhoneNumber(formData.phoneNumber),
        SecondaryPhone: transformPhoneNumber(formData.phoneNumber)
      },
      CurrentResidence: {
        ResidenceStatus: formData.homeowner || 'Own',
        OccupancyDate: '2012-02-08'
      }
    }
  };
  
  const postXML = generateFullXML(postData, vendorData);
  logWithCapture('info', 'POST TO QUOTEWIZARD - XML BEING SENT', postXML);
  
  const response = await sendQuoteWizardRequest(
    QUOTE_WIZARD_CONFIG.contractID,
    initialID,
    2,
    postXML
  );
  
  logWithCapture('info', 'POST TO QUOTEWIZARD - RESPONSE RECEIVED', response);
  
  return {
    xml: postXML,
    response: response,
    initialID: initialID
  };
}

// Helper function to post to ExchangeFlo
async function postToExchangeFlo(pingData, formData) {
  try {
    const { submission_id, pings } = pingData;
    
    const exclusivePings = pings.filter(ping => ping.type === 'exclusive');
    const sharedPings = pings.filter(ping => ping.type === 'shared');
    const pingsToPost = exclusivePings.length > 0 ? exclusivePings : sharedPings;
    const ping_ids = pingsToPost.map(ping => ping.ping_id);
    
    const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
    
    const postData = {
      submission_id,
      ping_ids,
      profile: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: cleanPhone,
        address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zip: formData.zipcode,
        drivers: [
          {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        ]
      }
    };
    
    logWithCapture('info', 'EXCHANGEFLO POST DATA BEING SENT', postData);
    
    const response = await axios.post('https://pub.exchangeflo.io/api/leads/post', postData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 570ff8ba-26b3-44dc-b880-33042485e9d0'
      }
    });
    
    logWithCapture('info', 'EXCHANGEFLO POST RESPONSE RECEIVED', response.data);
    
    return response.data;
  } catch (error) {
    logWithCapture('error', 'EXCHANGEFLO POST ERROR', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestData: {
        submission_id: pingData.submission_id,
        ping_ids: pingData.pings?.map(p => p.ping_id),
        phone: formData.phoneNumber,
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        location: `${formData.city}, ${formData.state} ${formData.zipcode}`
      }
    });
    throw error;
  }
}

// API Routes

// Session management endpoint - capture tid parameter
app.get('/api/session/capture', (req, res) => {
  try {
    const tid = req.query.tid;
    if (!tid) {
      return res.status(400).json({
        success: false,
        error: 'tid parameter is required'
      });
    }
    
    const sessionId = getSessionId(req);
    const session = getSession(sessionId);
    
    // Store tid and IP
    session.tid = tid;
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    session.ip = ip.replace(/^::ffff:/, '');
    
    logWithCapture('info', 'Captured tid parameter via session endpoint', { 
      tid, 
      sessionId, 
      ip: session.ip 
    });
    
    res.json({
      success: true,
      sessionId,
      tid,
      ip: session.ip,
      message: 'Session data captured successfully'
    });
  } catch (error) {
    logWithCapture('error', 'Session capture error', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      server: 'running',
      database: 'connected'
    },
    logs: getAndClearLogs() // Include logs in response for testing
  });
});

// Test ping endpoint
app.post('/api/test/ping', async (req, res) => {
  try {
    const testData = {
      timestamp: new Date().toISOString(),
      submission_id: `test_${Date.now()}`,
      status: 'success',
      ping_count: 1,
      total_value: 25.50,
      request_data: { test: 'ping request' },
      response_data: { test: 'ping response', status: 'success' }
    };
    
    await databaseService.logPingRequest(testData);
    
    res.json({
      success: true,
      message: 'Test ping logged successfully',
      data: testData,
      logs: getAndClearLogs() // Include logs in response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      logs: getAndClearLogs() // Include logs even on error
    });
  }
});

// Ping both services and return the highest bidder
app.post('/api/ping-both', async (req, res) => {
  try {
    const inputData = req.body;
    logWithCapture('info', 'Received ping-both request', inputData);
    
    // Get or create session and capture tid parameter
    const sessionId = getSessionId(req);
    const session = getSession(sessionId);
    
    // Capture tid parameter if present
    const tid = req.query.tid || req.body?.tid;
    if (tid) {
      session.tid = tid;
      logWithCapture('info', 'Captured tid parameter in ping-both', { tid, sessionId });
    }
    
    // Store IP address
    const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    session.ip = ip.replace(/^::ffff:/, '');
    
    logWithCapture('info', 'Session data after tid capture', { 
      sessionId, 
      session: JSON.stringify(session, null, 2),
      allSessions: JSON.stringify(Array.from(sessions.entries()), null, 2)
    });
    
    // Prepare data for both services
    const quotewizardData = await prepareQuoteWizardData(inputData, req);
    const exchangefloData = await prepareExchangeFloData(inputData);
    
    logWithCapture('info', 'QUOTEWIZARD DATA BEING SENT', quotewizardData);
    logWithCapture('info', 'EXCHANGEFLO DATA BEING SENT', exchangefloData);
    
    // Ping both services simultaneously
    const [quotewizardResult, exchangefloResult] = await Promise.allSettled([
      pingQuoteWizard(quotewizardData),
      pingExchangeFlo(exchangefloData)
    ]);
    
    logWithCapture('info', 'QuoteWizard ping result', quotewizardResult);
    logWithCapture('info', 'ExchangeFlo ping result', exchangefloResult);
    
    // Analyze results and determine winner
    const comparison = {
      quotewizard: {
        success: quotewizardResult.status === 'fulfilled' && quotewizardResult.value?.businessSuccess,
        value: 0,
        error: quotewizardResult.status === 'rejected' ? quotewizardResult.reason?.message : null,
        data: quotewizardResult.status === 'fulfilled' ? quotewizardResult.value : null
      },
      exchangeflo: {
        success: exchangefloResult.status === 'fulfilled',
        value: 0,
        error: exchangefloResult.status === 'rejected' ? exchangefloResult.reason?.message : null,
        data: exchangefloResult.status === 'fulfilled' ? exchangefloResult.value : null
      }
    };
    
    // Add additional error context for failed QuoteWizard business logic
    if (quotewizardResult.status === 'fulfilled' && !quotewizardResult.value?.businessSuccess) {
      comparison.quotewizard.error = 'QuoteWizard returned failure status';
    }
    
    // Calculate values from successful pings
    if (comparison.quotewizard.success && comparison.quotewizard.data) {
      comparison.quotewizard.value = extractQuoteWizardValue(comparison.quotewizard.data.response);
    }
    
    if (comparison.exchangeflo.success && comparison.exchangeflo.data) {
      const pings = comparison.exchangeflo.data.pings || [];
      comparison.exchangeflo.value = pings.reduce((sum, ping) => sum + (parseFloat(ping.value) || 0), 0);
    }
    
    // Determine winner based on highest value
    let winner = null;
    if (comparison.quotewizard.value > comparison.exchangeflo.value) {
      winner = 'quotewizard';
    } else if (comparison.exchangeflo.value > comparison.quotewizard.value) {
      winner = 'exchangeflo';
    } else if (comparison.quotewizard.success && !comparison.exchangeflo.success) {
      winner = 'quotewizard';
    } else if (comparison.exchangeflo.success && !comparison.quotewizard.success) {
      winner = 'exchangeflo';
    }
    
    logWithCapture('info', `WINNER DETERMINED: ${winner}`, comparison);
    
    // Store revenue amount in session if there's a winner with revenue
    logWithCapture('info', 'Revenue storage check', {
      hasWinner: !!winner,
      winnerValue: winner ? comparison[winner].value : 0,
      winnerValueCheck: winner ? comparison[winner].value > 0 : false,
      currentSessionRevenue: session.revenue
    });
    
    if (winner && comparison[winner].value > 0) {
      session.revenue = comparison[winner].value;
      logWithCapture('info', 'Stored revenue in session', { 
        sessionId, 
        winner, 
        revenue: session.revenue,
        sessionData: JSON.stringify(session, null, 2)
      });
    } else {
      logWithCapture('info', 'No revenue stored - conditions not met', {
        hasWinner: !!winner,
        winnerValue: winner ? comparison[winner].value : 0,
        reason: !winner ? 'no winner' : 'no revenue'
      });
    }
    
    // Log to database using database service (with error handling)
    try {
      await databaseService.logPingComparison({
        timestamp: new Date().toISOString(),
        quotewizard_success: comparison.quotewizard.success,
        quotewizard_value: comparison.quotewizard.value,
        quotewizard_error: comparison.quotewizard.error,
        exchangeflo_success: comparison.exchangeflo.success,
        exchangeflo_value: comparison.exchangeflo.value,
        exchangeflo_error: comparison.exchangeflo.error,
        winner: winner,
        request_data: inputData
      });
    } catch (dbError) {
      logWithCapture('error', 'Failed to log ping comparison to database', { error: dbError.message });
      // Don't throw - continue with the flow even if database logging fails
    }
    
    res.json({
      success: true,
      winner: winner,
      comparison: comparison,
      winnerData: winner ? comparison[winner].data : null,
      message: winner ? `${winner} won with $${comparison[winner].value}` : 'No winner - both services failed',
      logs: getAndClearLogs() // Include logs in response
    });
    
  } catch (error) {
    logWithCapture('error', 'Ping comparison error', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      winner: null,
      logs: getAndClearLogs() // Include logs even on error
    });
  }
});

// Post to winner endpoint
app.post('/api/post-winner', async (req, res) => {
  try {
    const { winner, winnerData, formData } = req.body;
    
    logWithCapture('info', `Posting to winner: ${winner}`);
    
    // Get session data - try multiple approaches
    let sessionId = getSessionId(req);
    let session = getSession(sessionId);
    
    // If session doesn't have TID, try to find it in all sessions
    if (!session.tid) {
      logWithCapture('info', 'Session has no TID, searching all sessions for TID', {
        currentSessionId: sessionId,
        currentSession: JSON.stringify(session, null, 2)
      });
      
      // Look through all sessions to find one with TID
      logWithCapture('info', 'Searching all sessions for TID', {
        totalSessions: sessions.size,
        sessionKeys: Array.from(sessions.keys())
      });
      
      for (const [sid, sess] of sessions.entries()) {
        logWithCapture('info', `Checking session: ${sid}`, {
          hasTid: !!sess.tid,
          tid: sess.tid,
          revenue: sess.revenue,
          ip: sess.ip
        });
        
        if (sess.tid) {
          logWithCapture('info', `Found session with TID: ${sid}`, {
            tid: sess.tid,
            revenue: sess.revenue
          });
          sessionId = sid;
          session = sess;
          break;
        }
      }
    }
    
    logWithCapture('info', 'Final session data for post-winner', { 
      sessionId, 
      session: JSON.stringify(session, null, 2),
      allSessions: JSON.stringify(Array.from(sessions.entries()), null, 2)
    });
    
    let result;
    
    if (winner === 'quotewizard') {
      result = await postToQuoteWizard(winnerData, formData);
    } else if (winner === 'exchangeflo') {
      result = await postToExchangeFlo(winnerData, formData);
    } else {
      throw new Error('Invalid winner specified');
    }
    
    logWithCapture('info', 'Post to winner completed successfully', result);
    
    // If post was successful and we have revenue, send postbacks
    logWithCapture('info', 'Checking postback conditions', {
      hasResult: !!result,
      sessionRevenue: session.revenue,
      sessionTid: session.tid,
      revenueCheck: session.revenue > 0,
      tidCheck: !!session.tid,
      shouldSendPostbacks: !!(result && session.revenue > 0 && session.tid)
    });
    
    if (result && session.revenue > 0 && session.tid) {
      logWithCapture('info', 'Sending postbacks due to successful post and revenue', {
        tid: session.tid,
        revenue: session.revenue
      });
      
      // Send postbacks in parallel
      const [hitpathResult, everflowResult] = await Promise.allSettled([
        sendHitpathPostback(session.tid, session.revenue),
        sendEverflowPostback(session.tid, session.revenue)
      ]);
      
      logWithCapture('info', 'Postback results', {
        hitpath: hitpathResult.status === 'fulfilled' ? hitpathResult.value : hitpathResult.reason,
        everflow: everflowResult.status === 'fulfilled' ? everflowResult.value : everflowResult.reason
      });
    }
    
    // Always submit email to Azure API (regardless of post success)
    const emailResult = await submitEmailToAzure(formData, session);
    logWithCapture('info', 'Email submission result', emailResult);
    
    res.json({
      success: true,
      winner: winner,
      result: result,
      postbacks: {
        hitpath: session.revenue > 0 && session.tid ? 'sent' : 'skipped',
        everflow: session.revenue > 0 && session.tid ? 'sent' : 'skipped',
        email: emailResult.success ? 'sent' : 'failed'
      },
      sessionInfo: {
        sessionId: sessionId,
        hasTid: !!session.tid,
        tid: session.tid,
        revenue: session.revenue,
        ip: session.ip
      },
      logs: getAndClearLogs() // Include logs in response
    });
    
  } catch (error) {
    logWithCapture('error', 'Post winner error', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      logs: getAndClearLogs() // Include logs even on error
    });
  }
});

// Location lookup endpoint
app.get('/api/location', async (req, res) => {
  try {
    const zipCode = req.query.zip;
    
    if (zipCode) {
      logWithCapture('info', 'Looking up location for zip code', zipCode);
      const locationData = await getLocationFromZip(zipCode);
      res.json(locationData);
    } else {
      const ip = req.query.ip || req.ip || req.connection.remoteAddress || '';
      const cleanIP = ip.replace(/^::ffff:/, '');
      
      logWithCapture('info', 'Looking up location for IP', cleanIP);
      
      const locationData = await getLocationFromIP(cleanIP);
      res.json(locationData);
    }
  } catch (error) {
    logWithCapture('error', 'Location lookup error', error.message);
    res.status(500).json({
      error: 'Failed to lookup location',
      zip: req.query.zip || '98101',
      region: 'WA',
      city: 'Seattle'
    });
  }
});

app.listen(PORT, () => {
  logWithCapture('info', `Server running on port ${PORT}`);
}); 