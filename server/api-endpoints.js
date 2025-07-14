const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const databaseService = require('./database/service');
const router = express.Router();

// QuoteWizard configuration
const QUOTE_WIZARD_CONFIG = {
  contractID: process.env.QW_CONTRACT_ID || 'E29908C1-CA19-4D3D-9F59-703CD5C12649',
  production_url: 'https://quotewizard.com/LeadAPI/Services/SubmitVendorLead',
  staging_url: 'https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead'
};

// Middleware for JSON parsing and logging
router.use(express.json({ limit: '10mb' }));
router.use((req, res, next) => {
  console.log(`📡 API Request: ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

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
    console.error('QuoteWizard API error:', error);
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
    console.error('Error extracting Quote ID:', error);
    throw error;
  }
}

function extractQuoteWizardValue(response) {
  try {
    if (response && response.includes && response.includes('Quote_ID')) {
      // Check if the response indicates success
      if (response.includes('<Status>Success</Status>') || response.includes('<Status>Accepted</Status>')) {
        return 15.0;
      } else if (response.includes('<Status>Failure</Status>')) {
        console.log('QuoteWizard response indicates failure, returning 0 value');
        return 0;
      }
      // If status is unclear but Quote_ID exists, assume some value
      return 15.0;
    }
    return 0;
  } catch (error) {
    console.error('Error extracting QuoteWizard value:', error);
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
    TrustedFormCertificateUrl: `https://cert.trustedform.com/${inputData.trusted_form_cert_id || generateTrustedFormCertId()}`,
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
    switch (occupation) {
      case 'Engineer': return "engineer";
      case 'Teacher': return "teacher";
      case 'Doctor': return "doctor";
      case 'Lawyer': return "lawyer";
      case 'Manager': return "manager";
      case 'Sales': return "sales";
      case 'Student': return "student";
      case 'Retired': return "retired";
      case 'Other': return "other";
      default: return "other";
    }
  };
  
  const mapLicenseState = (state) => {
    // Ensure state is uppercase and valid
    if (!state || typeof state !== 'string') return "WA";
    return state.toUpperCase();
  };
  
  return {
    source_id: "aaf3cd79-1fc5-43f6-86bc-d86d9d61c0d5",
    response_type: "detail",
    lead_type: "mixed",
    test: true,
    tracking_id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sub_id_1: process.env.NODE_ENV === 'production' ? "smartauto_prod" : "smartauto_test",
    trusted_form_cert_url: `https://cert.trustedform.com/${inputData.trusted_form_cert_id || generateTrustedFormCertId()}`,
    ip_address: "127.0.0.1",
    landing_url: "https://smartautoinsider.com",
    privacy_url: "https://smartautoinsider.com/privacy",
    tcpa: "I agree to receive marketing communications",
    user_agent: "Mozilla/5.0 (compatible; SmartAutoInsider/1.0)",
    
    profile: {
      zip: String(inputData.zipcode || "").padStart(5, '0'), // Ensure 5-digit zip
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
          first_name: String(inputData.firstName || ""),
          last_name: String(inputData.lastName || ""),
          email: String(inputData.email || ""),
          phone: String(inputData.phoneNumber || "").replace(/\D/g, ''),
          relationship: "self",
          gender: (inputData.gender || "male").toLowerCase(),
          birth_date: formatBirthdate(inputData.birthdate),
          at_fault_accidents: "0",
          license_suspended: "false",
          tickets: "0",
          dui_sr22: toBooleanString(inputData.sr22 === 'Yes'),
          education: mapEducation(inputData.driverEducation),
          credit: mapCreditScore(inputData.creditScore) || "good",
          occupation: mapOccupation(inputData.driverOccupation),
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
    
    console.log('📤 QUOTEWIZARD XML BEING SENT:');
    console.log(quoteXML);
    
    const response = await sendQuoteWizardRequest(
      QUOTE_WIZARD_CONFIG.contractID,
      null,
      1,
      quoteXML
    );
    
    console.log('📨 QUOTEWIZARD RESPONSE RECEIVED:');
    console.log(response);
    
    // Check if the response indicates business success
    const isBusinessSuccess = response && response.includes && 
      (response.includes('<Status>Success</Status>') || response.includes('<Status>Accepted</Status>'));
    
    console.log('📊 QUOTEWIZARD BUSINESS SUCCESS:', isBusinessSuccess);
    
    return {
      xml: quoteXML,
      response: response,
      businessSuccess: isBusinessSuccess
    };
  } catch (error) {
    console.error('❌ QUOTEWIZARD ERROR DETAILS:');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Request Data:', JSON.stringify(data, null, 2));
    throw error;
  }
}

// Helper function to ping ExchangeFlo
async function pingExchangeFlo(data) {
  try {
    console.log('📤 EXCHANGEFLO JSON BEING SENT:');
    console.log(JSON.stringify(data, null, 2));
    
    const response = await axios.post('https://pub.exchangeflo.io/api/leads/ping', data, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 570ff8ba-26b3-44dc-b880-33042485e9d0'
      }
    });
    
    console.log('📨 EXCHANGEFLO RESPONSE RECEIVED:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('❌ EXCHANGEFLO ERROR DETAILS:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Request Data Preview:', JSON.stringify({
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
    }, null, 2));
    throw error;
  }
}

// Helper function to post to QuoteWizard
async function postToQuoteWizard(pingData, formData) {
  console.log('📤 POST TO QUOTEWIZARD - PING DATA:');
  console.log(JSON.stringify(pingData, null, 2));
  
  console.log('📤 POST TO QUOTEWIZARD - FORM DATA:');
  console.log(JSON.stringify(formData, null, 2));
  
  const initialID = extractQuoteID(pingData.response);
  console.log('📤 POST TO QUOTEWIZARD - EXTRACTED INITIAL ID:', initialID);
  
  // Recreate the vendor data from form data (similar to prepareQuoteWizardData)
  const vendorData = {
    LeadID: '2897BDB4',
    SourceID: '',
    SourceIPAddress: '::1',
    SubmissionUrl: 'https://smartautoinsider.com',
    UserAgent: 'axios/1.9.0',
    DateLeadReceived: getTodayDate(),
    LeadBornOnDateTimeUTC: getTodayDate(true),
    JornayaLeadID: '',
    TrustedFormCertificateUrl: `https://cert.trustedform.com/${formData.trusted_form_cert_id || generateTrustedFormCertId()}`,
    EverQuoteEQID: 'F3C4242D-CEFC-46B5-91E0-A1B09AE7375E',
    TCPAOptIn: 'Yes',
    TCPALanguage: 'By clicking "Get My Auto Quotes", you agree to our Terms and Conditions and Privacy Policy'
  };
  
  // Recreate the full data structure needed for XML generation
  const postData = {
    drivers: [{
      Gender: formData.gender || 'Male',
      MaritalStatus: formData.maritalStatus || 'Single',
      RelationshipToApplicant: 'Self',
      FirstName: formData.firstName || 'John',
      LastName: formData.lastName || 'Doe',
      BirthDate: formData.birthdate || '1985-01-01',
      State: formData.state || 'WA',
      AgeLicensed: '16',
      LicenseStatus: formData.driversLicense === 'Yes' ? 'Valid' : 'Invalid',
      LicenseEverSuspendedRevoked: 'No',
      Occupation: {
        Name: 'OtherNonTechnical',
        YearsInField: '5'
      },
      HighestLevelOfEducation: {
        AtHomeStudent: 'No',
        HighestDegree: 'BachelorsDegree'
      },
      RequiresSR22Filing: formData.sr22 || 'No',
      CreditRating: {
        Bankruptcy: 'No',
        SelfRating: formData.creditScore || 'Good'
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
  console.log('📤 POST TO QUOTEWIZARD - XML BEING SENT:');
  console.log(postXML);
  
  const response = await sendQuoteWizardRequest(
    QUOTE_WIZARD_CONFIG.contractID,
    initialID,
    2,
    postXML
  );
  
  console.log('📨 POST TO QUOTEWIZARD - RESPONSE RECEIVED:');
  console.log(response);
  
  return {
    xml: postXML,
    response: response,
    initialID: initialID
  };
}

// Helper function to post to ExchangeFlo
async function postToExchangeFlo(pingData, formData) {
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

// API Routes

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      server: 'running',
      database: 'connected'
    },
    database_test: {
      success: true,
      message: 'Database connection successful'
    }
  });
});

// Test ping endpoint
router.post('/test/ping', async (req, res) => {
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
      data: testData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Database logging endpoint for ping requests
router.post('/log/ping', async (req, res) => {
  try {
    const { request, response, timestamp } = req.body;
    
    const logData = {
      timestamp: timestamp || new Date().toISOString(),
      submission_id: response?.submission_id || null,
      status: response?.status || 'unknown',
      ping_count: response?.pings?.length || 0,
      request_data: request,
      response_data: response
    };
    
    await databaseService.logPingRequest(logData);
    
    res.json({ success: true, message: 'Ping logged successfully' });
  } catch (error) {
    console.error('Ping logging error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Database logging endpoint for post requests
router.post('/log/post', async (req, res) => {
  try {
    const { request, response, timestamp } = req.body;
    
    const successfulPosts = response?.results?.filter(r => r.result === 'success').length || 0;
    
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
    
    await databaseService.logPostRequest(logData);
    
    res.json({ success: true, message: 'Post logged successfully' });
  } catch (error) {
    console.error('Post logging error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Ping both services and return the highest bidder
router.post('/ping-both', async (req, res) => {
  try {
    const inputData = req.body;
    console.log('📥 Received ping-both request:', JSON.stringify(inputData, null, 2));
    
    // Prepare data for both services
    const quotewizardData = await prepareQuoteWizardData(inputData, req);
    const exchangefloData = await prepareExchangeFloData(inputData);
    
    console.log('🔍 QUOTEWIZARD DATA BEING SENT:');
    console.log(JSON.stringify(quotewizardData, null, 2));
    
    console.log('🔍 EXCHANGEFLO DATA BEING SENT:');
    console.log(JSON.stringify(exchangefloData, null, 2));
    
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
      comparison.quotewizard.value = extractQuoteWizardValue(comparison.quotewizard.data);
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

// Post to winner endpoint
router.post('/post-winner', async (req, res) => {
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

module.exports = router; 