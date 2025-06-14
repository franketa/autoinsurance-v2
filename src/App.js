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
  { id: 'zipcode', title: 'Enter zip code', progress: 7 },
  { id: 'vehicle-count', title: 'How many vehicles will be on your policy?', progress: 12 },
  { id: 'add-second-vehicle', title: 'Add a 2nd Vehicle (save an additional 20%)', progress: 15 },
  { id: 'vehicle-year-1', title: 'First vehicle year', progress: 18 },
  { id: 'vehicle-make-1', title: 'Select your vehicle make', progress: 24 },
  { id: 'vehicle-model-1', title: 'Select your vehicle model', progress: 30 },
  { id: 'vehicle-year-2', title: 'Second vehicle year', progress: 36 },
  { id: 'vehicle-make-2', title: 'Second vehicle make', progress: 38 },
  { id: 'vehicle-model-2', title: 'Second vehicle model', progress: 40 },
  { id: 'drivers-license', title: 'Do you have a valid drivers license?', progress: 45 },
  { id: 'sr22', title: 'Do you need an SR-22?', progress: 50 },
  { id: 'insurance-history', title: 'Have you had auto insurance in the past 30 days?', progress: 55 },
  { id: 'current-auto-insurance', title: 'Current Auto Insurance', progress: 58 },
  { id: 'insurance-duration', title: 'How long have you continuously had auto insurance?', progress: 62 },
  { id: 'coverage-type', title: 'Which coverage type do you need?', progress: 65 },
  { id: 'gender', title: 'Select your gender', progress: 69 },
  { id: 'marital-status', title: 'Are you married?', progress: 74 },
  { id: 'credit-score', title: 'What is your credit score?', progress: 78 },
  { id: 'homeowner', title: 'Homeowner?', progress: 80 },
  { id: 'military', title: 'Are either you or your spouse an active member, or an honorably discharged veteran of the US military?', progress: 82 },
  { id: 'birthdate', title: 'What is your birthdate?', progress: 89 },
  { id: 'contact-info', title: 'Contact Information', progress: 97 }
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
      { year: '', make: '', model: '' },
      { year: '', make: '', model: '' }
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
    
    // Add vehicle steps based on final count
    if (finalVehicleCount === '1') {
      steps.push(
        STEPS.find(s => s.id === 'vehicle-year-1'),
        STEPS.find(s => s.id === 'vehicle-make-1'),
        STEPS.find(s => s.id === 'vehicle-model-1')
      );
    } else if (finalVehicleCount === '2' || finalVehicleCount === '3+') {
      steps.push(
        STEPS.find(s => s.id === 'vehicle-year-1'),
        STEPS.find(s => s.id === 'vehicle-make-1'),
        STEPS.find(s => s.id === 'vehicle-model-1'),
        STEPS.find(s => s.id === 'vehicle-year-2'),
        STEPS.find(s => s.id === 'vehicle-make-2'),
        STEPS.find(s => s.id === 'vehicle-model-2')
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
    
    // Add remaining steps (non-vehicle, non-license, non-insurance steps)
    const remainingSteps = STEPS.filter(step => 
      !step.id.includes('vehicle-') && 
      step.id !== 'zipcode' &&
      step.id !== 'add-second-vehicle' &&
      step.id !== 'drivers-license' &&
      step.id !== 'sr22' &&
      step.id !== 'insurance-history' &&
      step.id !== 'current-auto-insurance' &&
      step.id !== 'insurance-duration'
    );
    
    steps.push(...remainingSteps);
    
    return steps.filter(Boolean); // Remove any undefined steps
  };

  const visibleSteps = getVisibleSteps();
  const currentStepData = visibleSteps[currentStep];

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
      // Only update zipcode from auto-location, not city/state
      zipcode: locationData.zipcode || prev.zipcode
    }));
    
    console.log('Location data updated (zipcode only):', locationData);
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

  const nextStep = () => {
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
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
      
      // Filter out empty vehicles
      const activeVehicles = formData.vehicles.filter(v => v.year && v.make && v.model);
      
      // Map form data to match the expected format
      const submissionData = {
        // Personal Information
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        streetAddress: formData.streetAddress,
        zipcode: formData.zipcode,
        birthdate: formData.birthdate,
        
        // Insurance Information
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        creditScore: formData.creditScore,
        homeowner: formData.homeowner,
        driversLicense: formData.driversLicense,
        sr22: formData.sr22,
        currentAutoInsurance: formData.currentAutoInsurance,
        insuranceHistory: formData.insuranceHistory,
        insuranceDuration: formData.insuranceDuration,
        coverageType: formData.coverageType,
        military: formData.military,
        
        // Vehicle Information
        vehicles: activeVehicles,
        vehicleCount: formData.vehicleCount,
        
        // Location Information
        city: formData.city,
        state: formData.state,
        
        // Metadata
        submittedAt: new Date().toISOString(),
        trusted_form_cert_id: '' // Add if you have TrustedForm integration
      };

      console.log('Submitting form data:', submissionData);
      
      // Debug: Check if contact info is present
      console.log('Contact Info Check:', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        streetAddress: formData.streetAddress,
        city: formData.city,
        state: formData.state
      });
      
      // Simulate searching time (5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const response = await fetch('/api/submit-quote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      const result = await response.json();
      
      //if (result.success) {
      if (true) {
        console.log('Quote submission successful:', result);
        // Show results screen
        setSubmissionState('results');
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Submission error:', error);
      // Go back to form and show error
      //setSubmissionState('form');
      setSubmissionState('results');
      alert('Error submitting quote request. Please try again or contact support.');
    }
  };

  // Conditional rendering based on current page
  if (currentPage === 'contact') {
    return (
      <div className="app">
        <Header />
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
        <Header />
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
        <Header />
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
        <Header />
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
        <Header />
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
      <Header />
      <ProgressBar 
        progress={currentStepData?.progress || 0} 
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