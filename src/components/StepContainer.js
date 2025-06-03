import React from 'react';
import ZipCodeStep from './steps/ZipCodeStep';
import VehicleCountStep from './steps/VehicleCountStep';
import AddSecondVehicleStep from './steps/AddSecondVehicleStep';
import VehicleYearStep from './steps/VehicleYearStep';
import VehicleMakeStep from './steps/VehicleMakeStep';
import VehicleModelStep from './steps/VehicleModelStep';
import DriversLicenseStep from './steps/DriversLicenseStep';
import SR22Step from './steps/SR22Step';
import InsuranceHistoryStep from './steps/InsuranceHistoryStep';
import CurrentAutoInsuranceStep from './steps/CurrentAutoInsuranceStep';
import InsuranceDurationStep from './steps/InsuranceDurationStep';
import GenderStep from './steps/GenderStep';
import MaritalStatusStep from './steps/MaritalStatusStep';
import HomeownerStep from './steps/HomeownerStep';
import MilitaryStep from './steps/MilitaryStep';
import BirthdateStep from './steps/BirthdateStep';
import ContactInfoStep from './steps/ContactInfoStep';
import AddressInfoStep from './steps/AddressInfoStep';

const StepContainer = ({ 
  step, 
  formData, 
  updateFormData, 
  updateVehicleData, 
  onNext, 
  onPrevious,
  canGoPrevious,
  vehicleData 
}) => {
  if (!step) return null;

  const getVehicleIndex = (stepId) => {
    return stepId.includes('-2') ? 1 : 0;
  };

  const renderStep = () => {
    switch (step.id) {
      case 'zipcode':
        return (
          <ZipCodeStep
            value={formData.zipcode}
            onChange={(value) => updateFormData('zipcode', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'vehicle-count':
        return (
          <VehicleCountStep
            value={formData.vehicleCount}
            onChange={(value) => updateFormData('vehicleCount', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'add-second-vehicle':
        return (
          <AddSecondVehicleStep
            value={formData.addSecondVehicle}
            onChange={(value) => updateFormData('addSecondVehicle', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'vehicle-year-1':
      case 'vehicle-year-2':
        return (
          <VehicleYearStep
            title={step.title}
            value={formData.vehicles[getVehicleIndex(step.id)]?.year || ''}
            onChange={(value) => updateVehicleData(getVehicleIndex(step.id), 'year', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'vehicle-make-1':
      case 'vehicle-make-2':
        const vehicleIndex = getVehicleIndex(step.id);
        const selectedYear = formData.vehicles[vehicleIndex]?.year;
        return (
          <VehicleMakeStep
            title={`${selectedYear} ${step.title.replace('Select your vehicle make', 'Select your vehicle make')}`}
            value={formData.vehicles[vehicleIndex]?.make || ''}
            onChange={(value) => updateVehicleData(vehicleIndex, 'make', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
            makes={vehicleData.makes}
          />
        );

      case 'vehicle-model-1':
      case 'vehicle-model-2':
        const vIndex = getVehicleIndex(step.id);
        const selectedMake = formData.vehicles[vIndex]?.make;
        const vYear = formData.vehicles[vIndex]?.year;
        return (
          <VehicleModelStep
            title={`${vYear} ${selectedMake} ${step.title.replace('Select your vehicle model', 'Select your vehicle model')}`}
            value={formData.vehicles[vIndex]?.model || ''}
            onChange={(value) => updateVehicleData(vIndex, 'model', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
            models={vehicleData.models[selectedMake] || []}
          />
        );

      case 'drivers-license':
        return (
          <DriversLicenseStep
            value={formData.driversLicense}
            onChange={(value) => updateFormData('driversLicense', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'sr22':
        return (
          <SR22Step
            value={formData.sr22}
            onChange={(value) => updateFormData('sr22', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'insurance-history':
        return (
          <InsuranceHistoryStep
            value={formData.insuranceHistory}
            onChange={(value) => updateFormData('insuranceHistory', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'current-auto-insurance':
        return (
          <CurrentAutoInsuranceStep
            value={formData.currentAutoInsurance}
            onChange={(value) => updateFormData('currentAutoInsurance', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'insurance-duration':
        return (
          <InsuranceDurationStep
            value={formData.insuranceDuration}
            onChange={(value) => updateFormData('insuranceDuration', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'gender':
        return (
          <GenderStep
            value={formData.gender}
            onChange={(value) => updateFormData('gender', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'marital-status':
        return (
          <MaritalStatusStep
            value={formData.maritalStatus}
            onChange={(value) => updateFormData('maritalStatus', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'homeowner':
        return (
          <HomeownerStep
            value={formData.homeowner}
            onChange={(value) => updateFormData('homeowner', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'military':
        return (
          <MilitaryStep
            value={formData.military}
            onChange={(value) => updateFormData('military', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'birthdate':
        return (
          <BirthdateStep
            value={formData.birthdate}
            onChange={(value) => updateFormData('birthdate', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'contact-info':
        return (
          <ContactInfoStep
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={formData.email}
            onFirstNameChange={(value) => updateFormData('firstName', value)}
            onLastNameChange={(value) => updateFormData('lastName', value)}
            onEmailChange={(value) => updateFormData('email', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      case 'address-info':
        return (
          <AddressInfoStep
            streetAddress={formData.streetAddress}
            zipcode={formData.zipcode}
            phoneNumber={formData.phoneNumber}
            onStreetAddressChange={(value) => updateFormData('streetAddress', value)}
            onPhoneNumberChange={(value) => updateFormData('phoneNumber', value)}
            onNext={onNext}
            onPrevious={onPrevious}
            canGoPrevious={canGoPrevious}
          />
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="step-container">
      {renderStep()}
    </div>
  );
};

export default StepContainer; 