const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const axios = require('axios');
const xml2js = require('xml2js');
const { getLocationFromIP } = require('./location');
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 