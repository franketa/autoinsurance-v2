import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import StepContainer from './components/StepContainer';
import Footer from './components/Footer';
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
  { id: 'drivers-license', title: 'Do you have a valid drivers license?', progress: 41 },
  { id: 'sr22', title: 'Do you need an SR-22?', progress: 41.5 },
  { id: 'insurance-history', title: 'Have you had auto insurance in the past 30 days?', progress: 42 },
  { id: 'current-auto-insurance', title: 'Current Auto Insurance', progress: 43 },
  { id: 'insurance-duration', title: 'How long have you continuously had auto insurance?', progress: 44 },
  { id: 'gender', title: 'Select your gender', progress: 45 },
  { id: 'marital-status', title: 'Are you married?', progress: 48 },
  { id: 'homeowner', title: 'Homeowner?', progress: 53 },
  { id: 'military', title: 'Are either you or your spouse an active member, or an honorably discharged veteran of the US military?', progress: 58 },
  { id: 'birthdate', title: 'What is your birthdate?', progress: 60 },
  { id: 'contact-info', title: 'Contact Information', progress: 62 },
  { id: 'address-info', title: 'Address Information', progress: 67 }
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    zipcode: '',
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
    gender: '',
    maritalStatus: '',
    homeowner: '',
    military: '',
    birthdate: '',
    firstName: '',
    lastName: '',
    email: '',
    streetAddress: '',
    phoneNumber: ''
  });

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
      // Filter out empty vehicles
      const activeVehicles = formData.vehicles.filter(v => v.year && v.make && v.model);
      
      const submissionData = {
        ...formData,
        vehicles: activeVehicles,
        submittedAt: new Date().toISOString()
      };

      console.log('Submitting form data:', submissionData);
      
      // TODO: Replace with actual webhook endpoint
      // const response = await fetch('/api/quote', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(submissionData)
      // });
      
      alert('Quote request submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting quote request. Please try again.');
    }
  };

  return (
    <div className="app">
      <Header />
      <ProgressBar 
        progress={currentStepData?.progress || 0} 
        location="District of Columbia" 
      />
      <main className="main-content">
        <StepContainer
          step={currentStepData}
          formData={formData}
          updateFormData={updateFormData}
          updateVehicleData={updateVehicleData}
          onNext={nextStep}
          onPrevious={previousStep}
          canGoPrevious={currentStep > 0}
          vehicleData={vehicleData}
        />
      </main>
      <Footer />
    </div>
  );
}

export default App; 