const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');
const xml2js = require('xml2js');
const { getLocationFromIP, getLocationFromZip } = require('./location');
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

// Analytics endpoint to view ping/post data
app.get('/api/analytics/exchangeflo', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    // Get recent ping requests with details
    const pingQuery = `
      SELECT 
        id,
        timestamp,
        submission_id,
        status,
        ping_count,
        JSON_EXTRACT(request_data, '$.profile.zip') as zip_code,
        JSON_EXTRACT(request_data, '$.profile.auto_coverage_type') as coverage_type,
        JSON_EXTRACT(response_data, '$.pings') as pings_data,
        JSON_EXTRACT(response_data, '$.status') as response_status
      FROM exchangeflo_ping_requests 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    
    const postQuery = `
      SELECT 
        id,
        timestamp,
        submission_id,
        status,
        total_value,
        ping_count,
        successful_posts,
        JSON_EXTRACT(request_data, '$.profile.first_name') as first_name,
        JSON_EXTRACT(request_data, '$.profile.last_name') as last_name,
        JSON_EXTRACT(response_data, '$.results') as results_data
      FROM exchangeflo_post_requests 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    
    const [pingResult] = await promisePool.execute(pingQuery, [limit]);
    const [postResult] = await promisePool.execute(postQuery, [limit]);
    
    res.json({
      success: true,
      ping_requests: pingResult,
      post_requests: postResult,
      totals: {
        ping_count: pingResult.length,
        post_count: postResult.length
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Detailed ping results endpoint
app.get('/api/analytics/pings', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    const query = `
      SELECT 
        id,
        timestamp,
        submission_id,
        status,
        ping_count,
        request_data,
        response_data,
        CASE 
          WHEN JSON_EXTRACT(response_data, '$.status') = 'success' THEN 'SUCCESS'
          ELSE 'FAILED'
        END as ping_status,
        COALESCE(
          JSON_EXTRACT(response_data, '$.pings'),
          JSON_ARRAY()
        ) as pings
      FROM exchangeflo_ping_requests 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;
    
    const [rows] = await promisePool.execute(query, [limit]);
    
    // Process and enhance the data
    const processedData = rows.map(row => {
      let pings = [];
      try {
        pings = typeof row.pings === 'string' ? JSON.parse(row.pings) : (Array.isArray(row.pings) ? row.pings : []);
      } catch (e) {
        pings = [];
      }
      
      let requestData = {};
      try {
        requestData = typeof row.request_data === 'string' ? JSON.parse(row.request_data) : row.request_data;
      } catch (e) {
        requestData = {};
      }
      
      const totalValue = pings.reduce((sum, ping) => sum + (ping.value || 0), 0);
      
      return {
        ...row,
        total_ping_value: totalValue,
        exclusive_pings: pings.filter(p => p.type === 'exclusive').length,
        shared_pings: pings.filter(p => p.type === 'shared').length,
        highest_bid: pings.length > 0 ? Math.max(...pings.map(p => p.value || 0)) : 0,
        profile_summary: {
          zip: requestData?.profile?.zip,
          coverage_type: requestData?.profile?.auto_coverage_type,
          vehicle_count: requestData?.profile?.vehicle_count,
          driver_count: requestData?.profile?.driver_count
        }
      };
    });
    
    res.json({
      success: true,
      data: processedData,
      summary: {
        total_requests: processedData.length,
        successful_requests: processedData.filter(p => p.ping_status === 'SUCCESS').length,
        failed_requests: processedData.filter(p => p.ping_status === 'FAILED').length,
        total_value_generated: processedData.reduce((sum, p) => sum + p.total_ping_value, 0)
      }
    });
  } catch (error) {
    console.error('Ping analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Statistics dashboard endpoint
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // Get ping statistics for the last 7 days
    const pingStatsQuery = `
      SELECT 
        COUNT(*) as total_pings,
        SUM(CASE WHEN JSON_EXTRACT(response_data, '$.status') = 'success' THEN 1 ELSE 0 END) as successful_pings,
        AVG(ping_count) as avg_ping_count,
        DATE(timestamp) as day
      FROM exchangeflo_ping_requests 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(timestamp)
      ORDER BY day DESC
    `;
    
    const postStatsQuery = `
      SELECT 
        COUNT(*) as total_posts,
        SUM(successful_posts) as total_successful_posts,
        AVG(total_value) as avg_post_value
      FROM exchangeflo_post_requests 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `;
    
    const [pingStats] = await promisePool.execute(pingStatsQuery);
    const [postStats] = await promisePool.execute(postStatsQuery);
    
    res.json({
      success: true,
      dashboard: {
        daily_stats: pingStats,
        post_summary: postStats[0] || {},
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simple HTML dashboard for viewing results
app.get('/admin/ping-results', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>ExchangeFlo Ping Results Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .stat-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
            .stat-label { color: #666; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .status-success { color: #28a745; font-weight: bold; }
            .status-failed { color: #dc3545; font-weight: bold; }
            .ping-value { color: #007bff; font-weight: bold; }
            .refresh-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            .refresh-btn:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>ExchangeFlo Ping Results Dashboard</h1>
            <button class="refresh-btn" onclick="location.reload()">Refresh Data</button>
        </div>
        
        <div id="stats-container">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number" id="total-pings">Loading...</div>
                    <div class="stat-label">Total Pings</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="successful-pings">Loading...</div>
                    <div class="stat-label">Successful Pings</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="total-value">Loading...</div>
                    <div class="stat-label">Total Value ($)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="success-rate">Loading...</div>
                    <div class="stat-label">Success Rate (%)</div>
                </div>
            </div>
        </div>
        
        <table id="results-table">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Submission ID</th>
                    <th>Status</th>
                    <th>Ping Count</th>
                    <th>Total Value</th>
                    <th>Coverage Type</th>
                    <th>Zip Code</th>
                </tr>
            </thead>
            <tbody id="results-body">
                <tr><td colspan="7">Loading data...</td></tr>
            </tbody>
        </table>
        
        <script>
            async function loadData() {
                try {
                    const response = await fetch('/api/analytics/pings');
                    const data = await response.json();
                    
                    if (data.success) {
                        // Update statistics
                        document.getElementById('total-pings').textContent = data.summary.total_requests;
                        document.getElementById('successful-pings').textContent = data.summary.successful_requests;
                        document.getElementById('total-value').textContent = '$' + data.summary.total_value_generated.toFixed(2);
                        const successRate = data.summary.total_requests > 0 ? 
                            ((data.summary.successful_requests / data.summary.total_requests) * 100).toFixed(1) : 0;
                        document.getElementById('success-rate').textContent = successRate + '%';
                        
                        // Update table
                        const tbody = document.getElementById('results-body');
                        tbody.innerHTML = '';
                        
                        data.data.forEach(ping => {
                            const row = document.createElement('tr');
                            const statusClass = ping.ping_status === 'SUCCESS' ? 'status-success' : 'status-failed';
                            
                            row.innerHTML = \`
                                <td>\${new Date(ping.timestamp).toLocaleString()}</td>
                                <td>\${ping.submission_id || 'N/A'}</td>
                                <td class="\${statusClass}">\${ping.ping_status}</td>
                                <td>\${ping.ping_count}</td>
                                <td class="ping-value">$\${ping.total_ping_value.toFixed(2)}</td>
                                <td>\${ping.profile_summary?.coverage_type || 'N/A'}</td>
                                <td>\${ping.profile_summary?.zip || 'N/A'}</td>
                            \`;
                            tbody.appendChild(row);
                        });
                    }
                } catch (error) {
                    console.error('Error loading data:', error);
                    document.getElementById('results-body').innerHTML = 
                        '<tr><td colspan="7">Error loading data. Please refresh the page.</td></tr>';
                }
            }
            
            // Load data on page load
            loadData();
            
            // Auto-refresh every 30 seconds
            setInterval(loadData, 30000);
        </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 