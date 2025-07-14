const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');
const xml2js = require('xml2js');
const { getLocationFromIP, getLocationFromZip } = require('./location');
const databaseService = require('./database/service');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'smartautoinsider_user',
  password: process.env.DB_PASSWORD || '6UU2^5$dK)2_?^n3K6',
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

// Ignite API configuration
const IGNITE_CONFIG = {
  url: 'https://app-dp-tst-wu3.azurewebsites.net/api/Upload/SingleUpload?auth_token=B4YMZ43H31g0o0B9Xxx9'
};

// Helper Functions
function transformPhoneNumber(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  return `${last10.slice(0, 3)}-${last10.slice(3, 6)}-${last10.slice(6)}`;
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
    // Ensure we have valid values, not undefined
    const year = vehicle.Year || '2020';
    const make = vehicle.Make || 'Toyota';
    const model = vehicle.Model || 'Camry';
    
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

// Helper function to log data to MySQL
async function logToDatabase(table, data) {
  try {
    let query, values;
    
    if (table === 'exchangeflo_ping_requests') {
      query = `
        INSERT INTO exchangeflo_ping_requests 
        (timestamp, submission_id, status, ping_count, request_data, response_data)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      values = [
        data.timestamp,
        data.submission_id,
        data.status,
        data.ping_count,
        JSON.stringify(data.request_data),
        JSON.stringify(data.response_data)
      ];
    } else if (table === 'exchangeflo_post_requests') {
      query = `
        INSERT INTO exchangeflo_post_requests 
        (timestamp, submission_id, status, total_value, ping_count, successful_posts, request_data, response_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      values = [
        data.timestamp,
        data.submission_id,
        data.status,
        data.total_value,
        data.ping_count,
        data.successful_posts,
        JSON.stringify(data.request_data),
        JSON.stringify(data.response_data)
      ];
    } else {
      // Fallback for original insurance_ping table
      query = `
        INSERT INTO insurance_ping 
        (zip_code, firstName, lastName, phoneNumber, email, streetAddress, city, state, birthdate, 
         gender, maritalStatus, creditScore, homeowner, driversLicense, sr22, insuranceHistory, 
         currentAutoInsurance, insuranceDuration, coverageType, military, vehicles, 
         created_at, additional_data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      values = [
        data.zipcode, data.firstName, data.lastName, data.phoneNumber, data.email,
        data.streetAddress, data.city, data.state, data.birthdate, data.gender,
        data.maritalStatus, data.creditScore, data.homeowner, data.driversLicense,
        data.sr22, data.insuranceHistory, data.currentAutoInsurance, data.insuranceDuration,
        data.coverageType, data.military, JSON.stringify(data.vehicles),
        new Date().toISOString(), JSON.stringify(data.additionalData || {})
      ];
    }
    
    const [result] = await promisePool.execute(query, values);
    return { id: result.insertId };
  } catch (error) {
    console.error('Database logging error:', error);
    throw error;
  }
}

async function sendQuoteWizardRequest(contractID, initialID, pass, quoteData) {
  const url = process.env.NODE_ENV === 'production' 
    ? QUOTE_WIZARD_CONFIG.staging_url 
    : QUOTE_WIZARD_CONFIG.staging_url; // Use production for now
  
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
    console.error('QuoteWizard API error:', error);
    throw error;
  }
}

function extractQuoteID(pingResponse) {
  try {
    // Find the XML content within the response
    const startTag = '<string';
    const endTag = '</string>';
    const start = pingResponse.indexOf(startTag) + startTag.length;
    const end = pingResponse.indexOf(endTag);
    
    if (start === -1 || end === -1) {
      throw new Error('Could not find XML content in response');
    }
    
    const xmlContent = pingResponse.substring(start, end);
    const decodedXml = xmlContent.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    
    // Extract Quote_ID using regex
    const quoteIdMatch = decodedXml.match(/<Quote_ID>(.*?)<\/Quote_ID>/);
    if (quoteIdMatch && quoteIdMatch[1]) {
      return quoteIdMatch[1];
    }
    
    throw new Error('Quote_ID not found in response');
  } catch (error) {
    console.error('Error extracting Quote ID:', error);
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
          sourceUrl: 'https://www.smartautoinsider.com',
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
    
    // Extract and set defaults for form data
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
    
    // Build driver data
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
    
    // Build insurance profile
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
      SubmissionUrl: 'https://smartautoinsider.com',
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
      contact,
      ...inputData
    };
    
    // Validate we have vehicles
    if (!vehicles || vehicles.length === 0) {
      throw new Error('At least one vehicle is required');
    }
    
    // Validate vehicle data
    vehicles.forEach((vehicle, index) => {
      if (!vehicle.Year || !vehicle.Make || !vehicle.Model) {
        throw new Error(`Vehicle ${index + 1} is missing required data: Year=${vehicle.Year}, Make=${vehicle.Make}, Model=${vehicle.Model}`);
      }
    });
    
    console.log('Final vehicle data for XML:', vehicles);
    
    // Generate XML
    const quoteXML = generateFullXML(formData, vendorData);
    
    // Step 1: Send ping request
    await logToDatabase('ping', quoteXML);
    const pingResponse = await sendQuoteWizardRequest(
      QUOTE_WIZARD_CONFIG.contractID,
      null,
      1,
      quoteXML
    );
    await logToDatabase('ping_response', pingResponse);
    
    // Step 2: Extract Quote ID and send post request
    const initialID = extractQuoteID(pingResponse);
    const postXML = generateFullXML(formData, vendorData);
    
    await logToDatabase('post', postXML);
    const postResponse = await sendQuoteWizardRequest(
      QUOTE_WIZARD_CONFIG.contractID,
      initialID,
      2,
      postXML
    );
    await logToDatabase('post_response', postResponse);
    
    // Step 3: Send to Ignite API
    const igniteResponse = await sendToIgnite(formData);
    
    // Return success response
    res.json({
      success: true,
      ping: {
        xml: quoteXML,
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
    const zipCode = req.query.zip;
    
    if (zipCode) {
      // Zip code lookup
      console.log('Looking up location for zip code:', zipCode);
      const locationData = await getLocationFromZip(zipCode);
      res.json(locationData);
    } else {
      // IP-based lookup (original functionality)
      const ip = req.query.ip || req.ip || req.connection.remoteAddress || '';
      
      // Clean the IP address (remove ::ffff: prefix if present)
      const cleanIP = ip.replace(/^::ffff:/, '');
      
      console.log('Looking up location for IP:', cleanIP);
      
      const locationData = await getLocationFromIP(cleanIP);
      res.json(locationData);
    }
  } catch (error) {
    console.error('Location lookup error:', error);
    res.status(500).json({
      error: 'Failed to lookup location',
      zip: req.query.zip || '98101',
      region: 'WA',
      city: 'Seattle'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      server: 'running',
      database: 'connected' // You could add actual DB health check here
    }
  });
});

// Database logging endpoint for ping requests
app.post('/api/log/ping', async (req, res) => {
  try {
    const { request, response, timestamp } = req.body;
    
    // Extract data for database storage
    const logData = {
      timestamp: timestamp || new Date().toISOString(),
      submission_id: response?.submission_id || null,
      status: response?.status || 'unknown',
      ping_count: response?.pings?.length || 0,
      request_data: request,
      response_data: response
    };
    
    await logToDatabase('exchangeflo_ping_requests', logData);
    
    res.json({ success: true, message: 'Ping logged successfully' });
  } catch (error) {
    console.error('Ping logging error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Database logging endpoint for post requests
app.post('/api/log/post', async (req, res) => {
  try {
    const { request, response, timestamp } = req.body;
    
    // Calculate successful posts
    const successfulPosts = response?.results?.filter(r => r.result === 'success').length || 0;
    
    // Extract data for database storage
    const logData = {
      timestamp: timestamp || new Date().toISOString(),
      submission_id: response?.submission_id || request?.submission_id || null,
      status: response?.status || 'unknown',
      total_value: response?.value || 0,
      ping_count: request?.ping_ids?.length || 0,
      successful_posts: successfulPosts,
      request_data: request,
      response_data: response
    };
    
    await logToDatabase('exchangeflo_post_requests', logData);
    
    res.json({ success: true, message: 'Post logged successfully' });
  } catch (error) {
    console.error('Post logging error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// New endpoint to ping both services and return the highest bidder
app.post('/api/ping-both', async (req, res) => {
  try {
    const inputData = req.body;
    console.log('Received ping-both request:', inputData);
    
    // Prepare data for both services
    const quotewizardData = await prepareQuoteWizardData(inputData, req);
    const exchangefloData = await prepareExchangeFloData(inputData);
    
    // Ping both services simultaneously
    const [quotewizardResult, exchangefloResult] = await Promise.allSettled([
      pingQuoteWizard(quotewizardData),
      pingExchangeFlo(exchangefloData)
    ]);
    
    console.log('QuoteWizard ping result:', quotewizardResult);
    console.log('ExchangeFlo ping result:', exchangefloResult);
    
    // Analyze results and determine winner
    const comparison = {
      quotewizard: {
        success: quotewizardResult.status === 'fulfilled',
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
    
    // Calculate values from successful pings
    if (comparison.quotewizard.success && comparison.quotewizard.data) {
      // For QuoteWizard, we need to parse the XML response to get potential value
      comparison.quotewizard.value = extractQuoteWizardValue(comparison.quotewizard.data);
    }
    
    if (comparison.exchangeflo.success && comparison.exchangeflo.data) {
      // For ExchangeFlo, sum up all ping values
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
    
    // Log to database using database service
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
    
    res.json({
      success: true,
      winner: winner,
      comparison: comparison,
      winnerData: winner ? comparison[winner].data : null,
      message: winner ? `${winner} won with $${comparison[winner].value}` : 'No winner - both services failed'
    });
    
  } catch (error) {
    console.error('Ping comparison error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      winner: null
    });
  }
});

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
  const maritalStatus = inputData.maritalStatus || 'Single';
  const gender = inputData.gender || 'Male';
  const sr22 = inputData.sr22 || 'No';
  const license_status = inputData.driversLicense === 'Yes' ? 'Valid' : 'Invalid';
  const credit_rating = inputData.creditScore || 'Good';
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
  
  const vendorData = {
    LeadID: '2897BDB4',
    SourceID: req.sessionID || '',
    SourceIPAddress: req.ip || req.connection.remoteAddress || '',
    SubmissionUrl: 'https://smartautoinsider.com',
    UserAgent: req.get('User-Agent') || '',
    DateLeadReceived: getTodayDate(),
    LeadBornOnDateTimeUTC: getTodayDate(true),
    JornayaLeadID: '',
    TrustedFormCertificateUrl: `https://cert.trustedform.com/${inputData.trusted_form_cert_id || 'placeholder'}`,
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
  
  return {
    source_id: "aaf3cd79-1fc5-43f6-86bc-d86d9d61c0d5",
    response_type: "detail",
    lead_type: "mixed",
    test: true,
    tracking_id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sub_id_1: process.env.NODE_ENV === 'production' ? "smartauto_prod" : "smartauto_test",
    trusted_form_cert_url: `https://cert.trustedform.com/${inputData.trusted_form_cert_id || 'placeholder'}`,
    ip_address: "127.0.0.1",
    landing_url: "https://smartautoinsider.com",
    privacy_url: "https://smartautoinsider.com/privacy",
    tcpa: "I agree to receive marketing communications",
    user_agent: "Mozilla/5.0 (compatible; SmartAutoInsider/1.0)",
    
    profile: {
      zip: String(inputData.zipcode || ""),
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
          relationship: "self",
          gender: (inputData.gender || "male").toLowerCase(),
          birth_date: formatBirthdate(inputData.birthdate),
          at_fault_accidents: "0",
          license_suspended: "false",
          tickets: "0",
          dui_sr22: toBooleanString(inputData.sr22 === 'Yes'),
          education: inputData.driverEducation || "bachelors_degree",
          credit: mapCreditScore(inputData.creditScore) || "good",
          occupation: inputData.driverOccupation || "engineer",
          marital_status: mapMaritalStatus(inputData.maritalStatus) || "single",
          license_state: inputData.state || "MA",
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
  const quoteXML = generateFullXML(data, data.vendorData);
  
  const response = await sendQuoteWizardRequest(
    QUOTE_WIZARD_CONFIG.contractID,
    null,
    1,
    quoteXML
  );
  
  return {
    xml: quoteXML,
    response: response
  };
}

// Helper function to ping ExchangeFlo
async function pingExchangeFlo(data) {
  const axios = require('axios');
  
  const response = await axios.post('https://pub.exchangeflo.io/api/leads/ping', data, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 570ff8ba-26b3-44dc-b880-33042485e9d0'
    }
  });
  
  return response.data;
}

// Helper function to extract value from QuoteWizard XML response
function extractQuoteWizardValue(response) {
  try {
    // QuoteWizard typically returns XML with lead acceptance info
    // For now, we'll assign a fixed value if the response indicates success
    // You might want to parse the XML more thoroughly to get actual bid values
    if (response && response.includes && response.includes('Quote_ID')) {
      return 15.0; // Default value for QuoteWizard - you can adjust this
    }
    return 0;
  } catch (error) {
    console.error('Error extracting QuoteWizard value:', error);
    return 0;
  }
}

// New endpoint to handle posting to the winner
app.post('/api/post-winner', async (req, res) => {
  try {
    const { winner, winnerData, formData } = req.body;
    
    let result;
    
    if (winner === 'quotewizard') {
      result = await postToQuoteWizard(winnerData, formData);
    } else if (winner === 'exchangeflo') {
      result = await postToExchangeFlo(winnerData, formData);
    } else {
      throw new Error('Invalid winner specified');
    }
    
    res.json({
      success: true,
      winner: winner,
      result: result
    });
    
  } catch (error) {
    console.error('Post winner error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to post to QuoteWizard
async function postToQuoteWizard(pingData, formData) {
  const initialID = extractQuoteID(pingData.response);
  const postXML = generateFullXML(pingData, pingData.vendorData);
  
  const response = await sendQuoteWizardRequest(
    QUOTE_WIZARD_CONFIG.contractID,
    initialID,
    2,
    postXML
  );
  
  return {
    xml: postXML,
    response: response,
    initialID: initialID
  };
}

// Helper function to post to ExchangeFlo
async function postToExchangeFlo(pingData, formData) {
  const axios = require('axios');
  
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
  
  const response = await axios.post('https://pub.exchangeflo.io/api/leads/post', postData, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 570ff8ba-26b3-44dc-b880-33042485e9d0'
    }
  });
  
  return response.data;
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 