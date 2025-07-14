import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import StepContainer from './components/StepContainer';
import Footer from './components/Footer';
import SearchingScreen from './components/SearchingScreen';
import ResultsScreen from './components/ResultsScreen';
import ContactUsPage from './components/ContactUsPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfUsePage from './components/TermsOfUsePage';
import { vehicleData } from './data/vehicleData';

const STEPS = [
  { id: 'zipcode', title: 'Enter zip code' },
  { id: 'vehicle-count', title: 'How many vehicles will be on your policy?' },
  { id: 'add-second-vehicle', title: 'Add a 2nd Vehicle (save an additional 20%)' },
  { id: 'vehicle-year-1', title: 'First vehicle year' },
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
  { id: 'coverage-type', title: 'Which coverage type do you need?' },
  { id: 'vehicle-purpose-1', title: 'What is the primary use for your first vehicle?' },
  { id: 'vehicle-mileage-1', title: 'What is the annual mileage for your first vehicle?' },
  { id: 'vehicle-ownership-1', title: 'How do you own your first vehicle?' },
  { id: 'vehicle-purpose-2', title: 'What is the primary use for your second vehicle?' },
  { id: 'vehicle-mileage-2', title: 'What is the annual mileage for your second vehicle?' },
  { id: 'vehicle-ownership-2', title: 'How do you own your second vehicle?' },
  { id: 'gender', title: 'Select your gender' },
  { id: 'marital-status', title: 'Are you married?' },
  { id: 'credit-score', title: 'What is your credit score?' },
  { id: 'homeowner', title: 'Homeowner?' },
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
    addSecondVehicle: '',
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
    
    // If user selected 1 vehicle, show upsell question
    if (formData.vehicleCount === '1') {
      steps.push(STEPS.find(s => s.id === 'add-second-vehicle'));
    }
    
    // Determine final vehicle count (original selection or after upsell)
    let finalVehicleCount = formData.vehicleCount;
    if (formData.vehicleCount === '1' && formData.addSecondVehicle === 'Yes') {
      finalVehicleCount = '2';
    }
    
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
    
    // Debug logging
    console.log('Progress Calculation:', {
      currentStep: currentStep + 1, // +1 for 1-based display
      totalSteps: visibleSteps.length,
      currentStepId: currentStepData?.id,
      progressPercentage: finalProgress
    });
    
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
        trusted_form_cert_id: getTrustedFormCertUrl().split('/').pop()
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
      
      // If we have a winner, post to that service
      if (winner && winnerData) {
        console.log(`🎯 Posting lead to ${winner}...`);
        
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
        
        if (!postResponse.ok) {
          console.error('❌ Post to winner failed:', JSON.stringify(postResult, null, 2));
          // Don't throw here - we can still show results even if post fails
        } else {
          console.log('✅ Post to winner successful:', postResult);
          
          // Fire conversion tracking if there's revenue
          const winnerValue = comparison[winner].value;
          if (winnerValue > 0) {
            // Load and fire Everflow conversion
            const script = document.createElement('script');
            script.src = 'https://www.iqno4trk.com/scripts/sdk/everflow.js';
            script.onload = () => {
              window.EF.conversion({
                aid: 118,
                amount: winnerValue,
              });
            };
            document.head.appendChild(script);
          }
        }
      } else {
        console.warn('⚠️ No winner found - both services may have failed');
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
          <ResultsScreen 
            userName={formData.firstName || 'franco'} 
            onViewRate={handleViewRate}
            onViewAllRates={handleViewAllRates}
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