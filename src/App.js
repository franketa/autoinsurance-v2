import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import StepContainer from './components/StepContainer';
import Footer from './components/Footer';
import SearchingScreen from './components/SearchingScreen';
import ThankYouPage from './components/ThankYouPage';
import ContactUsPage from './components/ContactUsPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfUsePage from './components/TermsOfUsePage';
import { vehicleData } from './data/vehicleData';

const STEPS = [
  { id: 'zipcode', title: 'Enter zip code' },
  { id: 'vehicle-count', title: 'How many vehicles will be on your policy?' },
  { id: 'vehicle-year-1', title: 'Select your vehicle year' },
  { id: 'vehicle-make-1', title: 'Select your vehicle make' },
  { id: 'vehicle-model-1', title: 'Select your vehicle model' },
  { id: 'vehicle-year-2', title: 'Second vehicle year' },
  { id: 'vehicle-make-2', title: 'Second vehicle make' },
  { id: 'vehicle-model-2', title: 'Second vehicle model' },
  { id: 'drivers-license', title: 'Do you have a valid drivers license?' },
  { id: 'sr22', title: 'Do you need an SR-22?' },
  { id: 'insurance-history', title: 'Have you had auto insurance in the past 30 days?' },
  { id: 'current-auto-insurance', title: 'Current Auto Insurance' },
  { id: 'insurance-duration', title: 'How long have you continuously had auto insurance?' },
  { id: 'coverage-type', title: 'How much coverage do you need?' },
  { id: 'vehicle-purpose-1', title: 'What is the primary use for your first vehicle?' },
  { id: 'vehicle-ownership-1', title: 'How do you own your first vehicle?' },
  { id: 'vehicle-mileage-1', title: 'What is the approximate mileage on your first vehicle?' },
  { id: 'vehicle-purpose-2', title: 'What is the primary use for your second vehicle?' },
  { id: 'vehicle-ownership-2', title: 'How do you own your second vehicle?' },
  { id: 'vehicle-mileage-2', title: 'What is the approximate mileage on your second vehicle?' },
  { id: 'gender', title: 'Select your gender' },
  { id: 'marital-status', title: 'Are you married?' },
  { id: 'credit-score', title: 'What is your credit score?' },
  { id: 'homeowner', title: 'Are you a homeowner?' },
  { id: 'military', title: 'Are either you or your spouse an active member, or an honorably discharged veteran of the US military?' },
  { id: 'driver-education', title: 'What is your highest level of education?' },
  { id: 'driver-occupation', title: 'What is your occupation?' },
  { id: 'birthdate', title: 'What is your birthdate?' },
  { id: 'contact-info', title: 'Contact Information' }
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [submissionState, setSubmissionState] = useState('form'); // 'form', 'searching', 'results'
  const [currentPage, setCurrentPage] = useState('form'); // 'form', 'contact', 'privacy', 'terms'
  const [formData, setFormData] = useState({
    zipcode: '',
    city: '',
    state: '',
    vehicleCount: '',
    vehicles: [
      { year: '', make: '', model: '', purpose: '', mileage: '', ownership: '' },
      { year: '', make: '', model: '', purpose: '', mileage: '', ownership: '' }
    ],
    driversLicense: '',
    sr22: '',
    insuranceHistory: '',
    currentAutoInsurance: '',
    insuranceDuration: '',
    coverageType: '',
    gender: '',
    maritalStatus: '',
    creditScore: '',
    homeowner: '',
    military: '',
    driverEducation: '',
    driverOccupation: '',
    birthdate: '',
    firstName: '',
    lastName: '',
    email: '',
    streetAddress: '',
    phoneNumber: ''
  });

  // Load Everflow SDK and capture URL parameters on component mount
  useEffect(() => {
    const loadEverflowSDK = () => {
      return new Promise((resolve, reject) => {
        // Check if Everflow SDK is already loaded
        if (window.EF) {
          resolve();
          return;
        }

        // Only load if script hasn't been loaded already
        if (!document.querySelector('script[src*="everflow.js"]')) {
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.async = true;
          script.src = 'https://www.iqno4trk.com/scripts/sdk/everflow.js';
          
          script.onload = () => {
            console.log('🚀 Everflow SDK loaded successfully');
            resolve();
          };
          
          script.onerror = () => {
            console.error('❌ Failed to load Everflow SDK');
            reject(new Error('Failed to load Everflow SDK'));
          };
          
          document.head.appendChild(script);
        } else {
          resolve();
        }
      });
    };

    const captureParametersAndTid = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let tid = urlParams.get('tid');
      const ef_transaction_id = urlParams.get('ef_transaction_id');
      const hitid = urlParams.get('hitid');
      const sid = urlParams.get('sid');
      const oid = urlParams.get('oid');
      const affid = urlParams.get('affid');
      
      console.log('📋 URL PARAMETERS FOUND:', {
        tid,
        ef_transaction_id,
        hitid,
        sid,
        oid,
        affid,
        fullUrl: window.location.href
      });

      // If no TID parameter exists or is empty, try to get one from Everflow SDK
      if (!tid || tid.trim() === '') {
        try {
          console.log('🔍 No TID found in URL, attempting to get from Everflow SDK...');
          
          // Load Everflow SDK first
          await loadEverflowSDK();
          
          // Wait a bit for SDK to initialize
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (window.EF && typeof window.EF.click === 'function') {
            console.log('🚀 Calling EF.click to generate transaction ID...');
            
            // Use EF.click to generate a transaction ID
            const transactionId = await window.EF.click({
              offer_id: oid || window.EF.urlParameter('oid'),
              affiliate_id: affid || window.EF.urlParameter('affid')
            });
            
            if (transactionId) {
              tid = transactionId;
              console.log('✅ Generated TID from Everflow SDK:', tid);
            } else {
              console.log('⚠️ EF.click returned empty transaction ID');
            }
          } else {
            console.log('⚠️ Everflow SDK not available or EF.click method not found');
          }
        } catch (error) {
          console.error('❌ Error generating TID from Everflow SDK:', error);
        }
      } else {
        console.log('✅ TID found in URL parameters:', tid);
      }
      
      // Send parameters to server to store in session (always send, even if some are empty)
      const params = new URLSearchParams();
      if (tid) params.append('tid', tid);
      if (ef_transaction_id) params.append('ef_transaction_id', ef_transaction_id);
      if (hitid) params.append('hitid', hitid);
      if (sid) params.append('sid', sid);
      if (oid) params.append('oid', oid);
      if (affid) params.append('affid', affid);
      
      // Always capture, even if no parameters (to establish session)
      const captureUrl = params.toString() ? `/api/session/capture?${params.toString()}` : '/api/session/capture?tid=';
      
      try {
        const response = await fetch(captureUrl);
        const data = await response.json();
        console.log('📋 SESSION CAPTURE RESULT:', data);
      } catch (error) {
        console.error('Error capturing URL parameters:', error);
      }
    };

    captureParametersAndTid();
  }, []);

  // Handle exit modal
  const handleExitClick = () => {
    setShowExitModal(true);
  };

  const handleBackToForm = () => {
    setShowExitModal(false);
  };

  const handleExit = () => {
    // You can add any cleanup logic here
    window.location.href = '/'; // Or redirect to homepage
  };

  // Determine which steps to show based on vehicle count and upsell response
  const getVisibleSteps = () => {
    let steps = [];
    
    // Always include zipcode and vehicle-count
    steps.push(STEPS.find(s => s.id === 'zipcode'));
    steps.push(STEPS.find(s => s.id === 'vehicle-count'));
    
    // Use the vehicle count directly
    let finalVehicleCount = formData.vehicleCount;
    
    // Add vehicle steps based on final count - with details for each vehicle
    if (finalVehicleCount === '1') {
      steps.push(
        STEPS.find(s => s.id === 'vehicle-year-1'),
        STEPS.find(s => s.id === 'vehicle-make-1'),
        STEPS.find(s => s.id === 'vehicle-model-1'),
        STEPS.find(s => s.id === 'vehicle-purpose-1'),
        STEPS.find(s => s.id === 'vehicle-mileage-1'),
        STEPS.find(s => s.id === 'vehicle-ownership-1')
      );
    } else if (finalVehicleCount === '2' || finalVehicleCount === '3+') {
      steps.push(
        // First vehicle complete flow
        STEPS.find(s => s.id === 'vehicle-year-1'),
        STEPS.find(s => s.id === 'vehicle-make-1'),
        STEPS.find(s => s.id === 'vehicle-model-1'),
        STEPS.find(s => s.id === 'vehicle-purpose-1'),
        STEPS.find(s => s.id === 'vehicle-mileage-1'),
        STEPS.find(s => s.id === 'vehicle-ownership-1'),
        // Second vehicle complete flow
        STEPS.find(s => s.id === 'vehicle-year-2'),
        STEPS.find(s => s.id === 'vehicle-make-2'),
        STEPS.find(s => s.id === 'vehicle-model-2'),
        STEPS.find(s => s.id === 'vehicle-purpose-2'),
        STEPS.find(s => s.id === 'vehicle-mileage-2'),
        STEPS.find(s => s.id === 'vehicle-ownership-2')
      );
    }
    
    // Add drivers license and SR-22 questions
    steps.push(STEPS.find(s => s.id === 'drivers-license'));
    steps.push(STEPS.find(s => s.id === 'sr22'));
    
    // Add insurance history question
    steps.push(STEPS.find(s => s.id === 'insurance-history'));
    
    // If user answered "Yes" to insurance history, add current insurance and duration steps
    if (formData.insuranceHistory === 'Yes') {
      steps.push(STEPS.find(s => s.id === 'current-auto-insurance'));
      steps.push(STEPS.find(s => s.id === 'insurance-duration'));
    }
    
    // Add coverage type step
    steps.push(STEPS.find(s => s.id === 'coverage-type'));
    
    // Add personal information steps
    steps.push(
      STEPS.find(s => s.id === 'gender'),
      STEPS.find(s => s.id === 'marital-status'),
      STEPS.find(s => s.id === 'credit-score'),
      STEPS.find(s => s.id === 'homeowner'),
      STEPS.find(s => s.id === 'military')
    );
    
    // Add driver information steps (remove driver-relationship)
    steps.push(
      STEPS.find(s => s.id === 'driver-education'),
      STEPS.find(s => s.id === 'driver-occupation')
    );
    
    // Add final steps
    steps.push(
      STEPS.find(s => s.id === 'birthdate'),
      STEPS.find(s => s.id === 'contact-info')
    );
    
    return steps.filter(Boolean); // Remove any undefined steps
  };

  const visibleSteps = getVisibleSteps();
  const currentStepData = visibleSteps[currentStep];

  // Calculate progress dynamically based on current step position
  const calculateProgress = () => {
    if (visibleSteps.length === 0) return 0;
    
    // Progress from 3% to 97% (matching the original range)
    const minProgress = 3;
    const maxProgress = 97;
    const progressRange = maxProgress - minProgress;
    
    // Calculate current progress based on step position
    const stepProgress = (currentStep / (visibleSteps.length - 1)) * progressRange;
    const finalProgress = Math.round(minProgress + stepProgress);
    
    return finalProgress;
  };

  const currentProgress = calculateProgress();

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateVehicleData = (vehicleIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.map((vehicle, index) => 
        index === vehicleIndex ? { ...vehicle, [field]: value } : vehicle
      )
    }));
  };

  const updateLocationData = (locationData) => {
    setFormData(prev => ({
      ...prev,
      zipcode: locationData.zipcode || prev.zipcode,
      city: locationData.city || prev.city,
      state: locationData.state || prev.state
    }));
    
    console.log('Location data updated:', locationData);
  };

  const handleViewRate = () => {
    // Redirect to external quote page or handle rate viewing
    alert('Redirecting to your personalized quote...');
  };

  const handleViewAllRates = () => {
    // Could show all available rates or restart the process
    alert('Showing all available rates...');
  };

  // Navigation functions for footer links
  const handleContactClick = () => {
    setCurrentPage('contact');
  };

  const handlePrivacyClick = () => {
    setCurrentPage('privacy');
  };

  const handleTermsClick = () => {
    setCurrentPage('terms');
  };

  const handleBackToMainForm = () => {
    setCurrentPage('form');
  };

  // Helper functions for API data mapping (consistent with test)
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

  // Helper to ensure boolean values are strings
  const toBooleanString = (value) => {
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true') return 'true';
      if (value.toLowerCase() === 'no' || value.toLowerCase() === 'false') return 'false';
    }
    return 'false'; // Default fallback
  };

  // Ensure birthdate is in correct format (YYYY-MM-DD)
  const formatBirthdate = (dateStr) => {
    if (!dateStr) return '1985-06-15'; // Default fallback
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    
    // Try to parse and reformat
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return '1985-06-15'; // Fallback
  };

  // Validate phone number has valid exchange code
  const validatePhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) return false;
    
    // Check for valid exchange code (avoid 555 which is often reserved)
    const exchangeCode = cleanPhone.substring(3, 6);
    if (exchangeCode === '555') return false;
    
    return true;
  };

  // Get TrustedForm certificate URL from hidden field
  const getTrustedFormCertUrl = () => {
    const trustedFormField = document.querySelector('input[name="xxTrustedFormCertUrl"]');
    if (trustedFormField && trustedFormField.value) {
      return trustedFormField.value;
    }
    // Fallback to placeholder if TrustedForm hasn't loaded yet
    return "https://cert.trustedform.com/0123456789abcdef0123456789abcdef01234567";
  };

  // Get Jornaya Lead ID
  const getJornayaLeadId = () => {
    // Try to get the Jornaya Lead ID from the window object
    if (window.LeadiD && window.LeadiD.token) {
      return window.LeadiD.token;
    }
    // Fallback to a test ID if Jornaya hasn't loaded yet
    return "01234566-89AB-CDEF-0123-456789ABCDAF";
  };

  // Validate and normalize insurance company names
  const normalizeInsuranceCompany = (company) => {
    if (!company) return "";
    
    // Map common variations to standardized names
    const companyMap = {
      'AAA': 'AAA',
      'State Farm': 'State Farm',
      'Geico': 'GEICO', 
      'Progressive': 'Progressive',
      'Allstate': 'Allstate',
      'USAA': 'USAA',
      'Farmers': 'Farmers',
      'Liberty Mutual': 'Liberty Mutual',
      'Nationwide': 'Nationwide',
      'American Family': 'American Family'
    };
    
    return companyMap[company] || ""; // Return empty string if not found
  };

  const nextStep = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Scroll to top of page for better UX
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Final step - submit data
      submitFormData();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitFormData = async () => {
    try {
      // Start the searching phase
      setSubmissionState('searching');
      
      // Prepare form data for both services
      const submissionData = {
        // Basic contact info
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zipcode: formData.zipcode,
        
        // Personal details
        birthdate: formData.birthdate,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        creditScore: formData.creditScore,
        homeowner: formData.homeowner,
        military: formData.military,
        driverEducation: formData.driverEducation,
        driverOccupation: formData.driverOccupation,
        
        // Insurance info
        driversLicense: formData.driversLicense,
        sr22: formData.sr22,
        insuranceHistory: formData.insuranceHistory,
        currentAutoInsurance: formData.currentAutoInsurance,
        insuranceDuration: formData.insuranceDuration,
        coverageType: formData.coverageType,
        
        // Vehicle data
        vehicles: formData.vehicles.filter(v => v.year && v.make && v.model),
        
        // Tracking data
        trusted_form_cert_id: getTrustedFormCertUrl().split('/').pop(),
        jornaya_lead_id: getJornayaLeadId()
      };

      console.log('📋 Submission Data Being Sent:');
      console.log(JSON.stringify(submissionData, null, 2));
      
      // Simulate searching time (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // STEP 1: PING BOTH SERVICES
      console.log('🔍 Pinging both QuoteWizard and ExchangeFlo...');
      
      const pingResponse = await fetch('/api/ping-both', {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      const pingResult = await pingResponse.json();
      
      if (!pingResponse.ok) {
        console.error('❌ Ping comparison failed:');
        console.error(`  Status: ${pingResponse.status}`);
        console.error(`  Response:`, JSON.stringify(pingResult, null, 2));
        throw new Error(pingResult.error || `Ping comparison error: ${pingResponse.status}`);
      }

      console.log('✅ Ping comparison successful:', pingResult);
      
      const { winner, comparison, winnerData } = pingResult;
      
      // Log the comparison results
      console.log('🏆 Ping Comparison Results:');
      console.log(`  QuoteWizard: ${comparison.quotewizard.success ? 'Success' : 'Failed'} - $${comparison.quotewizard.value}`);
      console.log(`  ExchangeFlo: ${comparison.exchangeflo.success ? 'Success' : 'Failed'} - $${comparison.exchangeflo.value}`);
      console.log(`  Winner: ${winner || 'None'}`);
      
      if (comparison.quotewizard.error) {
        console.log(`  QuoteWizard Error: ${comparison.quotewizard.error}`);
      }
      if (comparison.exchangeflo.error) {
        console.log(`  ExchangeFlo Error: ${comparison.exchangeflo.error}`);
      }
      
      // Always handle postbacks and potential winner posting
      let finalWinner = null;
      let finalResult = null;
      let conversionValue = 0;
      
      // ALWAYS call post-winner endpoint to ensure postbacks fire (even with no winner)
      if (winner && winnerData) {
        console.log(`🎯 Posting lead to ${winner}...`);
        
        // Try posting to the primary winner first
        try {
          const postResponse = await fetch('/api/post-winner', {
            method: 'POST',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              winner: winner,
              winnerData: winnerData,
              formData: submissionData
            })
          });
          
          const postResult = await postResponse.json();
          
          if (postResponse.ok && postResult.success) {
            console.log('✅ Post to primary winner successful:', postResult);
            finalWinner = winner;
            finalResult = postResult;
            conversionValue = comparison[winner].value;
          } else {
            throw new Error(`Primary winner post failed: ${postResult.error || 'Unknown error'}`);
          }
        } catch (primaryError) {
          console.error('❌ Post to primary winner failed:', primaryError.message);
          
          // Try fallback to the other service if it was successful in ping
          const fallbackWinner = winner === 'quotewizard' ? 'exchangeflo' : 'quotewizard';
          const fallbackData = comparison[fallbackWinner];
          
          if (fallbackData.success && fallbackData.value > 0) {
            console.log(`🔄 Trying fallback to ${fallbackWinner}...`);
            
            try {
              const fallbackResponse = await fetch('/api/post-winner', {
                method: 'POST',
                headers: { 
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  winner: fallbackWinner,
                  winnerData: fallbackData.data,
                  formData: submissionData
                })
              });
              
              const fallbackResult = await fallbackResponse.json();
              
              if (fallbackResponse.ok && fallbackResult.success) {
                console.log('✅ Fallback post successful:', fallbackResult);
                finalWinner = fallbackWinner;
                finalResult = fallbackResult;
                conversionValue = comparison[fallbackWinner].value;
              } else {
                console.error('❌ Fallback post also failed:', fallbackResult);
              }
            } catch (fallbackError) {
              console.error('❌ Fallback post error:', fallbackError.message);
            }
          } else {
            console.warn('⚠️ No valid fallback option available');
          }
        }
      } else {
        // No winner - still need to send postbacks
        console.log('⚠️ No winner found - both services may have failed');
        console.log('📤 Sending postbacks with no winner...');
        
        try {
          const postResponse = await fetch('/api/post-winner', {
            method: 'POST',
            headers: { 
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              winner: 'none',  // Special value for no winner
              winnerData: null,
              formData: submissionData
            })
          });
          
          const postResult = await postResponse.json();
          
          if (postResponse.ok && postResult.success) {
            console.log('✅ No-winner postbacks sent successfully:', postResult);
          } else {
            console.error('❌ No-winner postbacks failed:', postResult);
          }
        } catch (error) {
          console.error('❌ Error sending no-winner postbacks:', error);
        }
      }
      
      // Always fire conversion pixels regardless of winner or conversion value
      console.log('🎯 Always firing conversion pixels:', {
        winner: finalWinner || 'none',
        value: conversionValue || 0
      });
      
      // Load and fire Everflow conversion (frontend SDK)
      try {
        const script = document.createElement('script');
        script.src = 'https://www.iqno4trk.com/scripts/sdk/everflow.js';
        script.onload = () => {
          if (window.EF && typeof window.EF.conversion === 'function') {
            // Get ADV1 from post result if available
            let adv1Value = 'null';
            
            if (finalResult?.sessionInfo?.tid && finalWinner) {
              // Try to construct ADV1 from available data
              if (finalWinner === 'quotewizard' && finalResult?.result?.response) {
                  try {
                    // Try to extract Quote ID from response
                    const quoteIdMatch = finalResult.result.response.match(/<Quote_ID>(.*?)<\/Quote_ID>/);
                    if (quoteIdMatch) {
                      adv1Value = `QWD_${quoteIdMatch[1]}`;
                    }
                  } catch (e) {
                    console.log('Could not extract Quote ID for frontend ADV1');
                  }
                } else if (finalWinner === 'exchangeflo') {
                  // Try multiple sources for ExchangeFlo submission_id
                  let submissionId = null;
                  
                  // First try winnerData (success case)
                  if (winnerData?.submission_id) {
                    submissionId = winnerData.submission_id;
                  }
                  // Then try responseData (error case with 422, etc.)
                  else if (finalResult?.result?.responseData?.submission_id) {
                    submissionId = finalResult.result.responseData.submission_id;
                  }
                  // Finally try direct result (alternative structure)
                  else if (finalResult?.result?.submission_id) {
                    submissionId = finalResult.result.submission_id;
                  }
                  
                  if (submissionId) {
                    adv1Value = `EXF_${submissionId}`;
                  }
                  
                  console.log('ExchangeFlo ADV1 Debug:', {
                    finalWinner,
                    winnerDataSubmissionId: winnerData?.submission_id,
                    responseDataSubmissionId: finalResult?.result?.responseData?.submission_id,
                    directSubmissionId: finalResult?.result?.submission_id,
                    finalAdv1Value: adv1Value
                  });
                }
              }
              
              window.EF.conversion({
                aid: 118,
                transaction_id: finalResult?.sessionInfo?.tid || '',
                amount: conversionValue || 0,
                adv1: adv1Value
              })
              .then((conversion) => {
                console.log('✅ Everflow conversion successful with IDs:', {
                  conversion_id: conversion.conversion_id,
                  transaction_id: conversion.transaction_id,
                  sent_data: {
                    aid: 118,
                    transaction_id: finalResult?.sessionInfo?.tid || '',
                    amount: conversionValue || 0,
                    adv1: adv1Value
                  }
                });
              })
              .catch((error) => {
                console.error('❌ Everflow conversion failed:', error);
              });
              
              console.log('✅ Everflow conversion pixel fired with data:', {
                aid: 118,
                transaction_id: finalResult?.sessionInfo?.tid || '',
                amount: conversionValue || 0,
                adv1: adv1Value,
                winner: finalWinner,
                debugInfo: {
                  hasSessionInfo: !!finalResult?.sessionInfo,
                  tid: finalResult?.sessionInfo?.tid,
                  hasResult: !!finalResult?.result,
                  winnerDataSubmissionId: winnerData?.submission_id
                }
              });
            }
          };
          document.head.appendChild(script);
        } catch (pixelError) {
          console.error('❌ Error firing conversion pixel:', pixelError);
        }
      
      // Always show results screen after completion
      setSubmissionState('results');
      
    } catch (error) {
      console.error('API request error:', error);
      // For demo purposes, still show results even on error
      setSubmissionState('results');
      console.warn('Continuing to results screen for demo purposes');
    }
  };

  // Conditional rendering based on current page
  if (currentPage === 'contact') {
    return (
      <div className="app">
        <Header state={formData.state} />
        <main className="main-content">
          <ContactUsPage onBack={handleBackToMainForm} />
        </main>
        <Footer 
          onContactClick={handleContactClick}
          onPrivacyClick={handlePrivacyClick}
          onTermsClick={handleTermsClick}
        />
      </div>
    );
  }

  if (currentPage === 'privacy') {
    return (
      <div className="app">
        <Header state={formData.state} />
        <main className="main-content">
          <PrivacyPolicyPage onBack={handleBackToMainForm} />
        </main>
        <Footer 
          onContactClick={handleContactClick}
          onPrivacyClick={handlePrivacyClick}
          onTermsClick={handleTermsClick}
        />
      </div>
    );
  }

  if (currentPage === 'terms') {
    return (
      <div className="app">
        <Header state={formData.state} />
        <main className="main-content">
          <TermsOfUsePage onBack={handleBackToMainForm} />
        </main>
        <Footer 
          onContactClick={handleContactClick}
          onPrivacyClick={handlePrivacyClick}
          onTermsClick={handleTermsClick}
        />
      </div>
    );
  }

  // Conditional rendering based on submission state
  if (submissionState === 'searching') {
    return (
      <div className="app">
        <Header state={formData.state} />
        <main className="main-content">
          <SearchingScreen userName={formData.firstName || 'franco'} />
        </main>
        <Footer 
          onContactClick={handleContactClick}
          onPrivacyClick={handlePrivacyClick}
          onTermsClick={handleTermsClick}
        />
      </div>
    );
  }

  if (submissionState === 'results') {
    return (
      <div className="app">
        <Header state={formData.state} />
        <main className="main-content">
          <ThankYouPage 
            location={`${formData.city || 'Vista'}, ${formData.state || 'California'}`}
            userName={formData.firstName || ''}
          />
        </main>
        <Footer 
          onContactClick={handleContactClick}
          onPrivacyClick={handlePrivacyClick}
          onTermsClick={handleTermsClick}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <Header state={formData.state} />
      <ProgressBar 
        progress={currentProgress} 
        location="District of Columbia"
        onExitClick={handleExitClick}
        onPrevious={previousStep}
        canGoPrevious={currentStep > 0}
      />
      <main className="main-content">
        <StepContainer
          step={currentStepData}
          formData={formData}
          updateFormData={updateFormData}
          updateVehicleData={updateVehicleData}
          updateLocationData={updateLocationData}
          onNext={nextStep}
          vehicleData={vehicleData}
          onPrivacyClick={handlePrivacyClick}
          onTermsClick={handleTermsClick}
        />
      </main>
      <Footer 
        onContactClick={handleContactClick}
        onPrivacyClick={handlePrivacyClick}
        onTermsClick={handleTermsClick}
      />
      
      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={handleBackToForm}>×</button>
            <h3 className="modal-title">Are you sure?</h3>
            <p className="modal-text">You have a few more questions to get your rates</p>
            <div className="modal-buttons">
              <button className="modal-button secondary" onClick={handleBackToForm}>
                Back to Form
              </button>
              <button className="modal-button primary" onClick={handleExit}>
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 