// Test QuoteWizard contract ID directly
// Run with: node test-contract.js

const axios = require('axios');

// Minimal test data that should work if contract is valid
const minimalXML = `<?xml version='1.0' encoding='UTF-8'?>
<QuoteWizardData Version='1.0' xsi:noNamespaceSchemaLocation='QW.xsd'
    xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'>
    <QuoteRequest DateTime='2024-01-15T10:30:00.000Z'>
        <VendorData>
            <LeadID>TEST-001</LeadID>
            <SourceID>TEST</SourceID>
            <SourceIPAddress>192.168.1.1</SourceIPAddress>
            <SubmissionUrl>https://localhost:3000</SubmissionUrl>
            <UserAgent>Test Agent</UserAgent>
            <DateLeadReceived>2024-01-15</DateLeadReceived>
            <LeadBornOnDateTimeUTC>2024-01-15T10:30:00.000Z</LeadBornOnDateTimeUTC>
            <JornayaLeadID></JornayaLeadID>
            <TrustedFormCertificateUrl>https://cert.trustedform.com/8189d5a77937b27a3d85ca181fc34f2b46a60908</TrustedFormCertificateUrl>
            <EverQuoteEQID>F3C4242D-CEFC-46B5-91E0-A1B09AE7375E</EverQuoteEQID>
            <TCPAOptIn>Yes</TCPAOptIn>
            <TCPALanguage>Standard TCPA consent language</TCPALanguage>
        </VendorData>
        <AutoInsurance>
            <Contact>
                <FirstName>xxx</FirstName>
                <LastName>xxx</LastName>
                <Address1>1111 XXX Dr</Address1>
                <City>SEATTLE</City>
                <State>WA</State>
                <ZIPCode>11111</ZIPCode>
                <EmailAddress>xxxx@yahoo.com</EmailAddress>
                <PhoneNumbers>
                    <PrimaryPhone>
                        <PhoneNumberValue>111-111-1111</PhoneNumberValue>
                    </PrimaryPhone>
                    <SecondaryPhone>
                        <PhoneNumberValue>111-111-1111</PhoneNumberValue>
                    </SecondaryPhone>
                </PhoneNumbers>
                <CurrentResidence ResidenceStatus='Own'>
                    <OccupancyDate>2012-02-08</OccupancyDate>
                </CurrentResidence>
            </Contact>
            <Drivers>
                <Driver Gender="Male" MaritalStatus="Married" RelationshipToApplicant="Self">
                    <FirstName>XXX</FirstName>
                    <LastName>XXXX</LastName>
                    <BirthDate>1966-01-01</BirthDate>
                    <State>WA</State>
                    <AgeLicensed>16</AgeLicensed>
                    <LicenseStatus>Valid</LicenseStatus>
                    <LicenseEverSuspendedRevoked>No</LicenseEverSuspendedRevoked>
                    <Occupation Name="OtherNonTechnical">
                        <YearsInField>3</YearsInField>
                    </Occupation>
                    <HighestLevelOfEducation>
                        <Education AtHomeStudent="No" HighestDegree="AssociateDegree"/>
                    </HighestLevelOfEducation>
                    <RequiresSR22Filing>No</RequiresSR22Filing>
                    <CreditRating Bankruptcy="No" SelfRating="Excellent"/>
                </Driver>
            </Drivers>
            <AutoInsuranceQuoteRequest>
                <Vehicles>
                    <Vehicle>
                        <Year>2020</Year>
                        <Make>Toyota</Make>
                        <Model>Camry</Model>
                        <LocationParked>Full Garage</LocationParked>
                        <OwnedOrLeased>Owned</OwnedOrLeased>
                        <VehicleUse VehicleUseDescription='Commute_Work'>
                            <AnnualMiles>10000</AnnualMiles>
                            <WeeklyCommuteDays>5</WeeklyCommuteDays>
                            <OneWayDistance>19</OneWayDistance>
                        </VehicleUse>
                    </Vehicle>
                </Vehicles>
                <InsuranceProfile>
                    <RequestedPolicy>
                        <CoverageType>Premium</CoverageType>
                    </RequestedPolicy>
                    <CurrentPolicy>
                        <InsuranceCompany>
                            <CompanyName>Geico</CompanyName>
                        </InsuranceCompany>
                        <ExpirationDate>2099-02-01</ExpirationDate>
                        <StartDate>2016-01-01</StartDate>
                    </CurrentPolicy>
                    <ContinuouslyInsuredSinceDate>2013-01-01</ContinuouslyInsuredSinceDate>
                </InsuranceProfile>
            </AutoInsuranceQuoteRequest>
        </AutoInsurance>
    </QuoteRequest>
</QuoteWizardData>`;

async function testContract() {
  console.log('🔐 TESTING QUOTEWIZARD CONTRACT ID');
  console.log('═'.repeat(50));
  
  const contractID = 'E29908C1-CA19-4D3D-9F59-703CD5C12649';
  const stagingUrl = 'https://stage.quotewizard.com/LeadAPI/Services/SubmitVendorLead';
  const productionUrl = 'https://quotewizard.com/LeadAPI/Services/SubmitVendorLead';
  
  console.log('📋 Contract ID:', contractID);
  console.log('📋 XML length:', minimalXML.length, 'characters');
  
  // Test staging first
  console.log('\n1️⃣ Testing STAGING environment...');
  await testSingleContract(stagingUrl, contractID, 'STAGING');
  
  // Test production (be careful with this - might cost money)
  console.log('\n2️⃣ Testing PRODUCTION environment...');
  console.log('⚠️  WARNING: This might cost money if contract is valid!');
  await testSingleContract(productionUrl, contractID, 'PRODUCTION');
}

async function testSingleContract(url, contractID, environment) {
  try {
    const fields = {
      contractID: contractID,
      pass: '1', // Ping request
      quoteData: minimalXML
    };
    
    console.log(`\n🚀 Sending request to ${environment}...`);
    console.log('   URL:', url);
    console.log('   Contract ID:', contractID);
    console.log('   Pass:', fields.pass);
    
    const startTime = Date.now();
    const response = await axios.post(url, new URLSearchParams(fields), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 30000
    });
    const duration = Date.now() - startTime;
    
    console.log(`✅ Response received (${duration}ms)`);
    console.log('   Status:', response.status);
    console.log('   Content-Type:', response.headers['content-type']);
    console.log('   Response length:', response.data?.length || 'N/A');
    
    // Analyze response
    const responseText = response.data;
    console.log('\n📄 Response analysis:');
    console.log('   First 200 chars:', responseText.substring(0, 200));
    
    if (responseText.includes('No match')) {
      console.log('❌ Result: "No match" - Contract works but rejects this lead');
      console.log('   Meaning: Contract ID is VALID but has acceptance criteria');
    } else if (responseText.includes('Quote_ID')) {
      console.log('✅ Result: SUCCESS - Contract accepted the lead!');
      const quoteMatch = responseText.match(/<Quote_ID>(.*?)<\/Quote_ID>/);
      if (quoteMatch) {
        console.log('   Quote ID:', quoteMatch[1]);
      }
    } else if (responseText.includes('Invalid') || responseText.includes('Error')) {
      console.log('❌ Result: ERROR - Possible contract/technical issue');
    } else {
      console.log('❓ Result: UNKNOWN - Unexpected response format');
    }
    
  } catch (error) {
    console.error(`❌ ${environment} test failed:`, error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Response:', error.response.data?.substring(0, 300) || 'No response body');
      
      if (error.response.status === 401 || error.response.status === 403) {
        console.log('   Likely cause: Invalid contract ID or authentication issue');
      } else if (error.response.status === 400) {
        console.log('   Likely cause: Malformed request or invalid data');
      } else if (error.response.status >= 500) {
        console.log('   Likely cause: QuoteWizard server issue');
      }
    }
  }
}

console.log('⚠️  IMPORTANT: This test will make actual API calls to QuoteWizard');
console.log('   Production calls might cost money if the contract is valid!');
console.log('   Press Ctrl+C to cancel or wait 3 seconds to continue...\n');

setTimeout(() => {
  testContract().catch(error => {
    console.error('🚨 Test failed:', error.message);
  });
}, 3000); 