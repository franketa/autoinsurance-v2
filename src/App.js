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
  { id: 'driver-relationship', title: 'What is your relationship to the primary driver?' },
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
    driverRelationship: '',
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
    
    // Add driver information steps
    steps.push(
      STEPS.find(s => s.id === 'driver-relationship'),
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
      
      // Filter out empty vehicles and include all vehicle data
      const activeVehicles = formData.vehicles.filter(v => v.year && v.make && v.model);
      
      // Map form data to the new ping API format
      const pingData = {
        // PLACEHOLDER: Static source configuration
        "source_id": "aaf3cd79-1fc5-43f6-86bc-d86d9d61c0d5", // PLACEHOLDER
        "response_type": "detail",
        "lead_type": "mixed",
        
        // PLACEHOLDER: Tracking and validation IDs
        "tracking_id": `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // PLACEHOLDER: Generated tracking ID
        "sub_id_1": "smartautoinsider", // PLACEHOLDER
        "jornaya_leadid": "01234567-89AB-CDEF-0123-456789ABCDEF", // PLACEHOLDER
        "trusted_form_cert_url": "https://cert.trustedform.com/0123456789abcdef0123456789abcdef01234567", // PLACEHOLDER
        
        // PLACEHOLDER: Request metadata
        "ip_address": "127.0.0.1", // PLACEHOLDER: Should get actual IP
        "landing_url": "smartautoinsider.com", // PLACEHOLDER
        "privacy_url": "smartautoinsider.com/privacy", // PLACEHOLDER
        "tcpa": "By clicking 'Get My Auto Quotes', you agree to our Terms and Conditions and Privacy Policy, and consent to receive important notices and other communications electronically.", // PLACEHOLDER: TCPA language
        "user_agent": navigator.userAgent,
        
        "profile": {
          // Location and insurance info
          "zip": formData.zipcode,
          "address_2": "", // PLACEHOLDER: We don't collect apartment/unit
          "currently_insured": formData.insuranceHistory === 'Yes' ? "true" : "false",
          "current_company": formData.currentAutoInsurance || "Unknown", // PLACEHOLDER if not provided
          "continuous_coverage": mapInsuranceDuration(formData.insuranceDuration),
          "current_policy_start": "2021-02-07", // PLACEHOLDER: We don't collect this
          "current_policy_expires": "2024-04-28", // PLACEHOLDER: We don't collect this
          "military_affiliation": formData.military === 'Yes' ? "true" : "false",
          "auto_coverage_type": mapCoverageType(formData.coverageType),
          "driver_count": "1", // PLACEHOLDER: We assume 1 driver for now
          "vehicle_count": activeVehicles.length.toString(),
          
          "drivers": [
            {
              "relationship": mapDriverRelationship(formData.driverRelationship),
              "gender": formData.gender?.toLowerCase() || "male", // PLACEHOLDER default
              "birth_date": formData.birthdate,
              "at_fault_accidents": "0", // PLACEHOLDER: We don't collect this
              "license_suspended": "false", // PLACEHOLDER: We don't collect this
              "tickets": "0", // PLACEHOLDER: We don't collect this
              "dui_sr22": formData.sr22 === 'Yes' ? "true" : "false",
              "education": mapEducation(formData.driverEducation),
              "credit": mapCreditScore(formData.creditScore),
              "occupation": formData.driverOccupation || "other_non_technical", // PLACEHOLDER default
              "marital_status": mapMaritalStatus(formData.maritalStatus),
              "license_state": formData.state || "CA", // PLACEHOLDER: Use form state or default
              "licensed_age": "16", // PLACEHOLDER: We don't collect this
              "license_status": formData.driversLicense === 'Yes' ? "active" : "inactive",
              "residence_type": mapHomeowner(formData.homeowner),
              "residence_length": "24" // PLACEHOLDER: We don't collect this
            }
          ],
          
          "vehicles": activeVehicles.map(vehicle => ({
            "year": vehicle.year,
            "make": vehicle.make,
            "model": vehicle.model,
            "submodel": "Base", // PLACEHOLDER: We don't collect submodel
            "primary_purpose": vehicle.purpose || "pleasure", // PLACEHOLDER default
            "annual_mileage": vehicle.mileage || "10000-15000", // PLACEHOLDER default
            "ownership": vehicle.ownership || "owned", // PLACEHOLDER default
            "garage": "no_cover", // PLACEHOLDER: We don't collect garage info
            "vin": "1HGBH41J*YM******" // PLACEHOLDER: We don't collect VIN
          }))
        }
      };

      console.log('Sending ping request:', pingData);
      
      // Debug: Check mapped data
      console.log('Ping Data Check:', {
        profile: pingData.profile,
        drivers: pingData.profile.drivers,
        vehicles: pingData.profile.vehicles
      });
      
      // Simulate searching time (3 seconds)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // STEP 1: PING REQUEST
      const pingResponse = await fetch('https://pub.exchangeflo.io/api/leads/ping', {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 570ff8ba-26b3-44dc-b880-33042485e9d0'
        },
        body: JSON.stringify(pingData)
      });
      
      const pingResult = await pingResponse.json();
      
      if (!pingResponse.ok) {
        throw new Error(pingResult.error || `Ping API error: ${pingResponse.status}`);
      }

      console.log('Ping request successful:', pingResult);
      
      // Log ping request to database
      try {
        await fetch('/api/log/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request: pingData,
            response: pingResult,
            timestamp: new Date().toISOString()
          })
        });
      } catch (logError) {
        console.warn('Failed to log ping to database:', logError);
      }
      
      // Validate ping response structure
      const { submission_id, status, pings } = pingResult;
      
      if (status !== 'success') {
        throw new Error(`Ping failed with status: ${status}`);
      }
      
      if (!submission_id) {
        throw new Error('Invalid ping response: missing submission_id');
      }
      
      if (!pings || !Array.isArray(pings) || pings.length === 0) {
        console.warn('No pings returned, skipping post request');
        setSubmissionState('results');
        return;
      }

      // STEP 2: POST REQUEST
      // Extract ping_ids (exclusive pings first, as per API documentation)
      const exclusivePings = pings.filter(ping => ping.type === 'exclusive');
      const sharedPings = pings.filter(ping => ping.type === 'shared');
      
      // Use exclusive pings for the post request (they have higher priority)
      const pingsToPost = exclusivePings.length > 0 ? exclusivePings : sharedPings;
      const ping_ids = pingsToPost.map(ping => ping.ping_id);
      
      if (ping_ids.length === 0) {
        console.warn('No valid ping_ids found, skipping post request');
        setSubmissionState('results');
        return;
      }
      
      const postData = {
        submission_id,
        ping_ids,
        profile: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phoneNumber,
          address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          drivers: [
            {
              first_name: formData.firstName,
              last_name: formData.lastName
            }
          ]
        }
      };

      console.log('Sending post request:', postData);

      const postResponse = await fetch('https://pub.exchangeflo.io/api/leads/post', {
        method: 'POST',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 570ff8ba-26b3-44dc-b880-33042485e9d0'
        },
        body: JSON.stringify(postData)
      });
      
      const postResult = await postResponse.json();
      
      if (!postResponse.ok) {
        console.error('Post request failed:', postResult);
        // Don't throw here - we can still show results even if post fails
      } else {
        console.log('Post request successful:', postResult);
        
        // Log post request to database
        try {
          await fetch('/api/log/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              request: postData,
              response: postResult,
              timestamp: new Date().toISOString()
            })
          });
        } catch (logError) {
          console.warn('Failed to log post to database:', logError);
        }
        
        // Log the results for debugging
        if (postResult.results) {
          postResult.results.forEach(result => {
            console.log(`Ping ${result.ping_id}: ${result.result} (${result.type}, value: ${result.value})`);
            if (result.error) {
              console.log(`  Error: ${result.error}`);
            }
          });
        }
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

  // Helper functions to map form values to API expected values
  const mapInsuranceDuration = (duration) => {
    switch (duration) {
      case 'Less than 6 months': return "3";
      case '6-12 months': return "9";
      case '1-3 years': return "24";
      case '3+ years': return "48";
      default: return "24"; // PLACEHOLDER default
    }
  };

  const mapCoverageType = (coverage) => {
    switch (coverage) {
      case 'Liability Only': return "liability";
      case 'Full Coverage': return "typical";
      default: return "typical"; // PLACEHOLDER default
    }
  };

  const mapDriverRelationship = (relationship) => {
    // API expects: self, spouse, parent, sibling, child, grandparent, grandchild, other
    return relationship || "self"; // PLACEHOLDER default
  };

  const mapEducation = (education) => {
    // API expects format like: some_college, high_school, etc.
    return education || "some_college"; // PLACEHOLDER default
  };

  const mapCreditScore = (score) => {
    switch (score) {
      case 'Excellent': return "excellent";
      case 'Good': return "good";
      case 'Fair': return "fair";
      case 'Poor': return "poor";
      default: return "good"; // PLACEHOLDER default
    }
  };

  const mapMaritalStatus = (status) => {
    switch (status) {
      case 'Yes': return "married";
      case 'No': return "single";
      default: return "single"; // PLACEHOLDER default
    }
  };

  const mapHomeowner = (homeowner) => {
    switch (homeowner) {
      case 'Own': return "own";
      case 'Rent': return "rent";
      default: return "rent"; // PLACEHOLDER default
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