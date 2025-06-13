const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');
const xml2js = require('xml2js');
const path = require('path');
const { getLocationFromIP } = require('./location');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'smartautoinsider_user',
  password: process.env.DB_PASSWORD || '6UU2^5$dK)2_?^n3K6',
  database: process.env.DB_NAME || 'smartautoinsider_db',
  charset: 'utf8'
};

// QuoteWizard configuration
const QUOTE_WIZARD_CONFIG = {
  contractID: process.env.QW_CONTRACT_ID || 'E29908C1-CA19-4D3D-9F59-703CD5C12649',
  production_url: 'https://quotewizard.com/LeadAPI/Services/SubmitVendorLead',
  staging_url: 'https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead'
};

// Ignite API configuration
const IGNITE_CONFIG = {
  url: 'https://app-dp-tst-wu3.azurewebsites.net/api/Upload/SingleUpload?auth_token=B4YMZ43H31g0o0B9Xxx9'
};

// Helper Functions
function validateQuoteWizardData(contact, drivers, vehicles, insuranceProfile) {
  const errors = [];
  
  // Contact validation
  if (!contact.FirstName || !contact.LastName) {
    errors.push('Contact first name and last name are required');
  }
  if (!contact.EmailAddress || !contact.EmailAddress.includes('@')) {
    errors.push('Valid email address is required');
  }
  if (!contact.Address1 || !contact.City || !contact.State || !contact.ZIPCode) {
    errors.push('Complete address information is required');
  }
  if (!contact.PhoneNumbers?.PrimaryPhone) {
    errors.push('Primary phone number is required');
  }
  
  // Driver validation
  if (!drivers || drivers.length === 0) {
    errors.push('At least one driver is required');
  }
  drivers.forEach((driver, index) => {
    if (!driver.FirstName || !driver.LastName || !driver.BirthDate) {
      errors.push(`Driver ${index + 1}: Name and birth date are required`);
    }
    if (driver.State !== contact.State) {
      errors.push(`Driver ${index + 1}: State must match contact state (${contact.State})`);
    }
  });
  
  // Vehicle validation
  if (!vehicles || vehicles.length === 0) {
    errors.push('At least one vehicle is required');
  }
  vehicles.forEach((vehicle, index) => {
    if (!vehicle.Year || !vehicle.Make || !vehicle.Model) {
      errors.push(`Vehicle ${index + 1}: Year, make, and model are required`);
    }
  });
  
  // Insurance profile validation
  if (!insuranceProfile || insuranceProfile.length === 0) {
    errors.push('Insurance profile is required');
  }
  
  return errors;
}

function escapeXML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function transformPhoneNumber(phone) {
  if (!phone) return '555-123-4567'; // Default fallback
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different phone number lengths
  if (digits.length === 11 && digits.startsWith('1')) {
    // US number with country code
    const last10 = digits.slice(1);
    return `${last10.slice(0, 3)}-${last10.slice(3, 6)}-${last10.slice(6)}`;
  } else if (digits.length === 10) {
    // Standard US number
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length > 10) {
    // Take last 10 digits
    const last10 = digits.slice(-10);
    return `${last10.slice(0, 3)}-${last10.slice(3, 6)}-${last10.slice(6)}`;
  } else {
    // Invalid length, return padded number or default
    const padded = digits.padStart(10, '0');
    return `${padded.slice(0, 3)}-${padded.slice(3, 6)}-${padded.slice(6)}`;
  }
}

function transformVehicles(vehicles) {
  if (!vehicles || !Array.isArray(vehicles)) {
    console.log('No vehicles provided or not an array, returning empty array');
    return [];
  }
  
  return vehicles.map((vehicle, index) => {
    console.log(`Processing vehicle ${index + 1}:`, vehicle);
    
    const transformed = {
      Year: vehicle.year || vehicle.Year || '',
      Make: vehicle.make || vehicle.Make || '',
      Model: vehicle.model || vehicle.Model || ''
    };
    
    console.log(`Transformed vehicle ${index + 1}:`, transformed);
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
    <Driver Gender="${escapeXML(driver.Gender)}" MaritalStatus="${escapeXML(driver.MaritalStatus)}" RelationshipToApplicant="${escapeXML(driver.RelationshipToApplicant)}">
      <FirstName>${escapeXML(driver.FirstName)}</FirstName>
      <LastName>${escapeXML(driver.LastName)}</LastName>
      <BirthDate>${escapeXML(driver.BirthDate)}</BirthDate>
      <State>${escapeXML(driver.State)}</State>
      <AgeLicensed>${escapeXML(driver.AgeLicensed)}</AgeLicensed>
      <LicenseStatus>${escapeXML(driver.LicenseStatus)}</LicenseStatus>
      <LicenseEverSuspendedRevoked>${escapeXML(driver.LicenseEverSuspendedRevoked)}</LicenseEverSuspendedRevoked>
      <Occupation Name="${escapeXML(driver.Occupation.Name)}">
        <YearsInField>${escapeXML(driver.Occupation.YearsInField)}</YearsInField>
      </Occupation>
      <HighestLevelOfEducation>
        <Education AtHomeStudent="${escapeXML(driver.HighestLevelOfEducation.AtHomeStudent)}" HighestDegree="${escapeXML(driver.HighestLevelOfEducation.HighestDegree)}"/>
      </HighestLevelOfEducation>
      <RequiresSR22Filing>${escapeXML(driver.RequiresSR22Filing)}</RequiresSR22Filing>
      <CreditRating Bankruptcy="${escapeXML(driver.CreditRating.Bankruptcy)}" SelfRating="${escapeXML(driver.CreditRating.SelfRating)}"/>
    </Driver>
  `).join('');
}

function generateVehiclesXML(vehicles) {
  return vehicles.map(vehicle => {
    // Ensure we have valid values, not undefined
    const year = escapeXML(vehicle.Year || '2020');
    const make = escapeXML(vehicle.Make || 'Toyota');
    const model = escapeXML(vehicle.Model || 'Camry');
    
    console.log(`Generating XML for vehicle: Year=${year}, Make=${make}, Model=${model}`);
    
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
        <CoverageType>${escapeXML(profile.CoverageType)}</CoverageType>
      </RequestedPolicy>
      <CurrentPolicy>
        <InsuranceCompany>
          <CompanyName>${escapeXML(profile.CurrentPolicy.InsuranceCompany.CompanyName)}</CompanyName>
        </InsuranceCompany>
        <ExpirationDate>${escapeXML(profile.CurrentPolicy.ExpirationDate || '2099-02-01')}</ExpirationDate>
        <StartDate>${escapeXML(profile.CurrentPolicy.StartDate || '2016-01-01')}</StartDate>
      </CurrentPolicy>
      <ContinuouslyInsuredSinceDate>2013-01-01</ContinuouslyInsuredSinceDate>
    </InsuranceProfile>
  `).join('');
}

function generateFullXML(formData, vendorData, isPing = false) {
  const { drivers, vehicles, insuranceProfile, contact } = formData;
  
  // Use filler data for ping, real data for post as per QuoteWizard documentation
  const contactData = isPing ? {
    FirstName: 'xxx',
    LastName: 'xxx',
    Address1: '1111 XXX Dr',
    City: 'SEATTLE',
    State: 'WA',
    ZIPCode: '11111',
    EmailAddress: 'xxxx@yahoo.com',
    PhoneNumbers: {
      PrimaryPhone: '111-111-1111',
      SecondaryPhone: '111-111-1111'
    },
    CurrentResidence: {
      ResidenceStatus: 'Own',
      OccupancyDate: '2012-02-08'
    }
  } : contact;
  
  // Use filler data for drivers in ping, real data in post
  const driverData = isPing ? [{
    Gender: 'Male',
    MaritalStatus: 'Married',
    RelationshipToApplicant: 'Self',
    FirstName: 'XXX',
    LastName: 'XXXX',
    BirthDate: '1966-01-01',
    State: contactData.State, // Must match contact state
    AgeLicensed: '16',
    LicenseStatus: 'Valid',
    LicenseEverSuspendedRevoked: 'No',
    Occupation: {
      Name: 'OtherNonTechnical',
      YearsInField: '3'
    },
    HighestLevelOfEducation: {
      AtHomeStudent: 'No',
      HighestDegree: 'AssociateDegree'
    },
    RequiresSR22Filing: 'No',
    CreditRating: {
      Bankruptcy: 'No',
      SelfRating: 'Excellent'
    }
  }] : drivers.map(driver => ({ ...driver, State: contact.State }));
  
  return `<?xml version='1.0' encoding='UTF-8'?>
    <QuoteWizardData Version='1.0' xsi:noNamespaceSchemaLocation='QW.xsd'
        xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>
        <QuoteRequest DateTime='${escapeXML(vendorData.LeadBornOnDateTimeUTC)}'>
            <VendorData>
                <LeadID>${escapeXML(vendorData.LeadID)}</LeadID>
                <SourceID>${escapeXML(vendorData.SourceID)}</SourceID>
                <SourceIPAddress>${escapeXML(vendorData.SourceIPAddress)}</SourceIPAddress>
                <SubmissionUrl>${escapeXML(vendorData.SubmissionUrl)}</SubmissionUrl>
                <UserAgent>${escapeXML(vendorData.UserAgent)}</UserAgent>
                <DateLeadReceived>${escapeXML(vendorData.DateLeadReceived)}</DateLeadReceived>
                <LeadBornOnDateTimeUTC>${escapeXML(vendorData.LeadBornOnDateTimeUTC)}</LeadBornOnDateTimeUTC>
                <JornayaLeadID>${escapeXML(vendorData.JornayaLeadID)}</JornayaLeadID>
                <TrustedFormCertificateUrl>${escapeXML(vendorData.TrustedFormCertificateUrl)}</TrustedFormCertificateUrl>
                <EverQuoteEQID>${escapeXML(vendorData.EverQuoteEQID)}</EverQuoteEQID>
                <TCPAOptIn>${escapeXML(vendorData.TCPAOptIn)}</TCPAOptIn>
                <TCPALanguage>${escapeXML(vendorData.TCPALanguage)}</TCPALanguage>
            </VendorData>
            <AutoInsurance>
                <Contact>
                    <FirstName>${escapeXML(contactData.FirstName)}</FirstName>
                    <LastName>${escapeXML(contactData.LastName)}</LastName>
                    <Address1>${escapeXML(contactData.Address1)}</Address1>
                    <City>${escapeXML(contactData.City)}</City>
                    <State>${escapeXML(contactData.State)}</State>
                    <ZIPCode>${escapeXML(contactData.ZIPCode)}</ZIPCode>
                    <EmailAddress>${escapeXML(contactData.EmailAddress)}</EmailAddress>
                    <PhoneNumbers>
                        <PrimaryPhone>
                            <PhoneNumberValue>${escapeXML(contactData.PhoneNumbers.PrimaryPhone)}</PhoneNumberValue>
                        </PrimaryPhone>
                        <SecondaryPhone>
                            <PhoneNumberValue>${escapeXML(contactData.PhoneNumbers.SecondaryPhone)}</PhoneNumberValue>
                        </SecondaryPhone>
                    </PhoneNumbers>
                    <CurrentResidence ResidenceStatus='${escapeXML(contactData.CurrentResidence.ResidenceStatus)}'>
                        <OccupancyDate>${escapeXML(contactData.CurrentResidence.OccupancyDate)}</OccupancyDate>
                    </CurrentResidence>
                </Contact>
                <Drivers>${generateDriversXML(driverData)}</Drivers>
                <AutoInsuranceQuoteRequest>
                    <Vehicles>${generateVehiclesXML(vehicles)}</Vehicles>
                    ${generateInsuranceProfileXML(insuranceProfile)}
                </AutoInsuranceQuoteRequest>
            </AutoInsurance>
        </QuoteRequest>
    </QuoteWizardData>`;
}

async function logToDatabase(action, data) {
  try {
    const connection = mysql.createConnection(dbConfig);
    const query = 'INSERT INTO insurance_ping (action, data) VALUES (?, ?)';
    await connection.promise().execute(query, [action, JSON.stringify(data)]);
    connection.end();
  } catch (error) {
    console.error('Database logging error:', error);
  }
}

async function sendQuoteWizardRequest(contractID, initialID, pass, quoteData) {
  // HARDCODED STAGING URL FOR TESTING
  const url = 'https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead';
  
  const fields = {
    contractID,
    pass,
    quoteData
  };
  
  if (initialID) {
    fields.initialID = initialID;
  }
  
  // DEBUG: Log the request details
  console.log('🚀 QuoteWizard Request:', {
    url,
    environment: 'STAGING (HARDCODED)',
    contractID,
    initialID: initialID || 'N/A',
    pass,
    xmlLength: quoteData?.length || 0,
    timestamp: new Date().toISOString()
  });
  
  // Log first 500 chars of XML for debugging
  console.log('📄 XML Preview:', quoteData?.substring(0, 500) + '...');
  
  try {
    const response = await axios.post(url, new URLSearchParams(fields), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('✅ QuoteWizard Response Status:', response.status);
    console.log('📄 Full QuoteWizard Response:', response.data);
    console.log('📊 Response Headers:', response.headers);
    return response.data;
  } catch (error) {
    console.error('❌ QuoteWizard API Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url,
      requestData: {
        contractID,
        pass,
        initialID,
        xmlLength: quoteData?.length
      }
    });
    throw error;
  }
}

function extractQuoteID(pingResponse) {
  try {
    console.log('🔍 Parsing QuoteWizard ping response...');
    console.log('📄 Raw response type:', typeof pingResponse);
    console.log('📄 Raw response length:', pingResponse?.length || 'N/A');
    console.log('📄 Raw response (first 1000 chars):', typeof pingResponse === 'string' ? pingResponse.substring(0, 1000) : JSON.stringify(pingResponse).substring(0, 1000));
    
    // First try to parse as direct XML
    if (pingResponse.includes('<QWXMLResponse')) {
      const quoteIdMatch = pingResponse.match(/<Quote_ID>(.*?)<\/Quote_ID>/);
      const statusMatch = pingResponse.match(/<Status>(.*?)<\/Status>/);
      const reasonMatch = pingResponse.match(/<Reason>(.*?)<\/Reason>/);
      
      console.log('📊 Parsed response:', {
        status: statusMatch?.[1],
        quoteId: quoteIdMatch?.[1],
        reason: reasonMatch?.[1]
      });
      
      if (statusMatch?.[1] === 'Failure') {
        throw new Error(`QuoteWizard ping failed: ${reasonMatch?.[1] || 'Unknown reason'}`);
      }
      
      if (quoteIdMatch && quoteIdMatch[1]) {
        console.log('✅ Quote ID extracted:', quoteIdMatch[1]);
        return quoteIdMatch[1];
      }
    }
    
    // Try to find XML content within SOAP response
    const startTag = '<string';
    const endTag = '</string>';
    const start = pingResponse.indexOf(startTag);
    const end = pingResponse.indexOf(endTag);
    
    if (start !== -1 && end !== -1) {
      const xmlContent = pingResponse.substring(start + startTag.length, end);
      const decodedXml = xmlContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
      
      console.log('🔧 Decoded XML:', decodedXml.substring(0, 500));
      
      const quoteIdMatch = decodedXml.match(/<Quote_ID>(.*?)<\/Quote_ID>/);
      const statusMatch = decodedXml.match(/<Status>(.*?)<\/Status>/);
      const reasonMatch = decodedXml.match(/<Reason>(.*?)<\/Reason>/);
      
      if (statusMatch?.[1] === 'Failure') {
        throw new Error(`QuoteWizard ping failed: ${reasonMatch?.[1] || 'Unknown reason'}`);
      }
      
      if (quoteIdMatch && quoteIdMatch[1]) {
        console.log('✅ Quote ID extracted from SOAP:', quoteIdMatch[1]);
        return quoteIdMatch[1];
      }
    }
    
    throw new Error('Quote_ID not found in response');
  } catch (error) {
    console.error('❌ Error extracting Quote ID:', error.message);
    console.error('📄 Full response:', pingResponse);
    throw error;
  }
}

async function sendToIgnite(formData) {
  try {
    const igniteData = {
      partitionKey: '',
      rowKey: '',
      timestamp: new Date().toISOString(),
      eTag: '',
      contact: {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        customField: {
          sourceUrl: process.env.DOMAIN ? `https://${process.env.DOMAIN}` : 'https://localhost:3000',
         // sourceUrl: 'https://www.smartautoinsider.com',
          ipAddress: formData.ipAddress || '',
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
    
    await logToDatabase('ignite_post', igniteData);
    
    const response = await axios.post(IGNITE_CONFIG.url, igniteData, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'text/json'
      }
    });
    
    await logToDatabase('ignite_response', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Ignite API error:', error);
    await logToDatabase('ignite_error', error.message);
    throw error;
  }
}

// Main API endpoint
app.post('/api/submit-quote', async (req, res) => {
  try {
    const inputData = req.body;
    
    // Debug: Log incoming data
    console.log('Incoming form data:', {
      firstName: inputData.firstName,
      lastName: inputData.lastName,
      email: inputData.email,
      phoneNumber: inputData.phoneNumber,
      streetAddress: inputData.streetAddress,
      city: inputData.city,
      state: inputData.state,
      vehicles: inputData.vehicles
    });
    
    // Extract and set defaults for form data (only use defaults if data is actually missing)
    const firstName = inputData.firstName || 'Matvii';
    const lastName = inputData.lastName || 'Kapralov';
    const phone = transformPhoneNumber(inputData.phoneNumber);
    const email = inputData.email || 'xxxx@yahoo.com';
    const address = inputData.streetAddress || '1111 XXX Dr';
    const zipCode = inputData.zipcode || '98101';
    const dob = inputData.birthdate || '1966-01-01';
    const city = inputData.city || 'SEATTLE';
    const state = inputData.state || 'WA';
    const maritalStatus = inputData.maritalStatus || 'Married';
    const gender = inputData.gender || 'Male';
    const sr22 = inputData.sr22 || 'No';
    const license_status = inputData.driversLicense === 'Yes' ? 'Valid' : 'Invalid';
    const trusted_form_cert_id = inputData.trusted_form_cert_id || '';
    const credit_rating = inputData.creditScore || 'Excellent';
    const current_insurance = inputData.currentAutoInsurance || 'Geico';
    const homeowner = inputData.homeowner || 'Own';
    
    const vehicles = transformVehicles(inputData.vehicles || []);
    
    // Debug: Log vehicle data
    console.log('Original vehicles:', inputData.vehicles);
    console.log('Transformed vehicles:', vehicles);
    
    // Build driver data - ensure state matches contact state
    const drivers = [{
      Gender: gender,
      MaritalStatus: maritalStatus,
      RelationshipToApplicant: 'Self',
      FirstName: firstName,
      LastName: lastName,
      BirthDate: dob,
      State: state, // Must match contact state for QuoteWizard
      AgeLicensed: '16',
      LicenseStatus: license_status,
      LicenseEverSuspendedRevoked: 'No',
      Occupation: {
        Name: 'OtherNonTechnical',
        YearsInField: '3'
      },
      HighestLevelOfEducation: {
        AtHomeStudent: 'No',
        HighestDegree: 'AssociateDegree'
      },
      RequiresSR22Filing: sr22,
      CreditRating: {
        Bankruptcy: 'No',
        SelfRating: credit_rating
      },
      Incidents: []
    }];
    
    // Build insurance profile with proper structure for QuoteWizard
    const insuranceProfile = [{
      CoverageType: 'Premium', // Changed from 'Standard' to match documentation
      CurrentPolicy: {
        InsuranceCompany: {
          CompanyName: current_insurance
        },
        ExpirationDate: '2099-02-01',
        StartDate: '2016-01-01'
      }
    }];
    
    // Build contact data
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
    
    // Build vendor data
    const vendorData = {
      LeadID: '2897BDB4',
      SourceID: req.sessionID || '',
      SourceIPAddress: req.ip || req.connection.remoteAddress || '',
      SubmissionUrl: process.env.DOMAIN ? `https://${process.env.DOMAIN}` : 'https://localhost:3000',
      //SubmissionUrl: 'https://smartautoinsider.com',
      UserAgent: req.get('User-Agent') || '',
      DateLeadReceived: getTodayDate(),
      LeadBornOnDateTimeUTC: getTodayDate(true),
      JornayaLeadID: '',
      TrustedFormCertificateUrl: `https://cert.trustedform.com/${trusted_form_cert_id}`,
      EverQuoteEQID: 'F3C4242D-CEFC-46B5-91E0-A1B09AE7375E',
      TCPAOptIn: 'Yes',
      TCPALanguage: 'By clicking "Get My Auto Quotes", you agree to our Terms and Conditions and Privacy Policy, and consent to receive important notices and other communications electronically. You also consent to receive marketing and informational calls, text messages, and pre-recorded messages from us and third-party marketers we work with at the phone number you provide, including via an autodialer or prerecorded voice. Consent is not a condition of our services. Message and data rates may apply. Message frequency may vary. Reply STOP to opt out, HELP for help.'
    };
    
    const formData = {
      drivers,
      vehicles,
      insuranceProfile,
      contact
    };
    
    // Validate data before sending to QuoteWizard
    const validationErrors = validateQuoteWizardData(contact, drivers, vehicles, insuranceProfile);
    if (validationErrors.length > 0) {
      console.error('❌ Data validation failed:', validationErrors);
      throw new Error(`Data validation failed: ${validationErrors.join(', ')}`);
    }
    
    console.log('✅ Data validation passed');
    
    // Validate we have vehicles
    if (!vehicles || vehicles.length === 0) {
      throw new Error('At least one vehicle is required');
    }
    
    console.log('Final vehicle data for XML:', vehicles);
    
    // Step 1: Send PING request with filler data (pass=1)
    const pingXML = generateFullXML(formData, vendorData, true); // isPing = true for filler data
    
    console.log('🏓 Sending PING request with filler data...');
    await logToDatabase('ping', pingXML);
    const pingResponse = await sendQuoteWizardRequest(
      QUOTE_WIZARD_CONFIG.contractID,
      null, // No initialID for ping
      1, // pass=1 for ping
      pingXML
    );
    await logToDatabase('ping_response', pingResponse);
    
    // Step 2: Extract Quote ID and send POST request with real data (pass=2)
    const initialID = extractQuoteID(pingResponse);
    const postXML = generateFullXML(formData, vendorData, false); // isPing = false for real data
    
    console.log('📤 Sending POST request with real data and Quote ID:', initialID);
    await logToDatabase('post', postXML);
    const postResponse = await sendQuoteWizardRequest(
      QUOTE_WIZARD_CONFIG.contractID,
      initialID, // Quote_ID from ping response
      2, // pass=2 for post
      postXML
    );
    await logToDatabase('post_response', postResponse);
    
    // Step 3: Send to Ignite API
    const igniteResponse = await sendToIgnite(formData);
    
    // Return success response
    res.json({
      success: true,
      ping: {
        xml: pingXML,
        response: pingResponse
      },
      post: {
        xml: postXML,
        response: postResponse
      },
      ignite: igniteResponse,
      initialID: initialID
    });
    
  } catch (error) {
    console.error('Quote submission error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Location lookup endpoint
app.get('/api/location', async (req, res) => {
  try {
    const ip = req.query.ip || req.ip || req.connection.remoteAddress || '';
    
    // Clean the IP address (remove ::ffff: prefix if present)
    const cleanIP = ip.replace(/^::ffff:/, '');
    
    console.log('Looking up location for IP:', cleanIP);
    
    const locationData = await getLocationFromIP(cleanIP);
    
    res.json(locationData);
  } catch (error) {
    console.error('Location lookup error:', error);
    res.status(500).json({
      error: 'Failed to lookup location',
      zip: '98101',
      region: 'WA',
      city: 'Seattle'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch-all handler for React SPA in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 