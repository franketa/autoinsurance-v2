import React from 'react';
import ZipCodeStep from './steps/ZipCodeStep';
import VehicleCountStep from './steps/VehicleCountStep';
import AddSecondVehicleStep from './steps/AddSecondVehicleStep';
import VehicleYearStep from './steps/VehicleYearStep';
import VehicleMakeStep from './steps/VehicleMakeStep';
import VehicleModelStep from './steps/VehicleModelStep';
import VehiclePurposeStep from './steps/VehiclePurposeStep';
import VehicleMileageStep from './steps/VehicleMileageStep';
import VehicleOwnershipStep from './steps/VehicleOwnershipStep';
import DriversLicenseStep from './steps/DriversLicenseStep';
import SR22Step from './steps/SR22Step';
import InsuranceHistoryStep from './steps/InsuranceHistoryStep';
import CurrentAutoInsuranceStep from './steps/CurrentAutoInsuranceStep';
import InsuranceDurationStep from './steps/InsuranceDurationStep';
import CoverageTypeStep from './steps/CoverageTypeStep';
import GenderStep from './steps/GenderStep';
import MaritalStatusStep from './steps/MaritalStatusStep';
import CreditScoreStep from './steps/CreditScoreStep';
import HomeownerStep from './steps/HomeownerStep';
import MilitaryStep from './steps/MilitaryStep';
import DriverRelationshipStep from './steps/DriverRelationshipStep';
import DriverEducationStep from './steps/DriverEducationStep';
import DriverOccupationStep from './steps/DriverOccupationStep';
import BirthdateStep from './steps/BirthdateStep';
import ContactInfoStep from './steps/ContactInfoStep';

const StepContainer = ({ 
  step, 
  formData, 
  updateFormData, 
  updateVehicleData, 
  updateLocationData,
  onNext,
  vehicleData,
  onPrivacyClick,
  onTermsClick
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
            onLocationUpdate={updateLocationData}
            onNext={onNext}
          />
        );

      case 'vehicle-count':
        return (
          <VehicleCountStep
            value={formData.vehicleCount}
            onChange={(value) => updateFormData('vehicleCount', value)}
            onNext={onNext}
          />
        );

      case 'add-second-vehicle':
        return (
          <AddSecondVehicleStep
            value={formData.addSecondVehicle}
            onChange={(value) => updateFormData('addSecondVehicle', value)}
            onNext={onNext}
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
            vehicleData={vehicleData}
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
            vehicleData={vehicleData}
            selectedYear={selectedYear}
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
            vehicleData={vehicleData}
            selectedYear={vYear}
            selectedMake={selectedMake}
          />
        );

      case 'drivers-license':
        return (
          <DriversLicenseStep
            value={formData.driversLicense}
            onChange={(value) => updateFormData('driversLicense', value)}
            onNext={onNext}
          />
        );

      case 'sr22':
        return (
          <SR22Step
            value={formData.sr22}
            onChange={(value) => updateFormData('sr22', value)}
            onNext={onNext}
          />
        );

      case 'insurance-history':
        return (
          <InsuranceHistoryStep
            value={formData.insuranceHistory}
            onChange={(value) => updateFormData('insuranceHistory', value)}
            onNext={onNext}
          />
        );

      case 'current-auto-insurance':
        return (
          <CurrentAutoInsuranceStep
            value={formData.currentAutoInsurance}
            onChange={(value) => updateFormData('currentAutoInsurance', value)}
            onNext={onNext}
          />
        );

      case 'insurance-duration':
        return (
          <InsuranceDurationStep
            value={formData.insuranceDuration}
            onChange={(value) => updateFormData('insuranceDuration', value)}
            onNext={onNext}
          />
        );

      case 'coverage-type':
        return (
          <CoverageTypeStep
            value={formData.coverageType}
            onChange={(value) => updateFormData('coverageType', value)}
            onNext={onNext}
          />
        );

      case 'vehicle-purpose-1':
      case 'vehicle-purpose-2':
        return (
          <VehiclePurposeStep
            title={step.title}
            value={formData.vehicles[getVehicleIndex(step.id)]?.purpose || ''}
            onChange={(value) => updateVehicleData(getVehicleIndex(step.id), 'purpose', value)}
            onNext={onNext}
          />
        );

      case 'vehicle-mileage-1':
      case 'vehicle-mileage-2':
        return (
          <VehicleMileageStep
            title={step.title}
            value={formData.vehicles[getVehicleIndex(step.id)]?.mileage || ''}
            onChange={(value) => updateVehicleData(getVehicleIndex(step.id), 'mileage', value)}
            onNext={onNext}
          />
        );

      case 'vehicle-ownership-1':
      case 'vehicle-ownership-2':
        return (
          <VehicleOwnershipStep
            title={step.title}
            value={formData.vehicles[getVehicleIndex(step.id)]?.ownership || ''}
            onChange={(value) => updateVehicleData(getVehicleIndex(step.id), 'ownership', value)}
            onNext={onNext}
          />
        );

      case 'gender':
        return (
          <GenderStep
            value={formData.gender}
            onChange={(value) => updateFormData('gender', value)}
            onNext={onNext}
          />
        );

      case 'marital-status':
        return (
          <MaritalStatusStep
            value={formData.maritalStatus}
            onChange={(value) => updateFormData('maritalStatus', value)}
            onNext={onNext}
          />
        );

      case 'credit-score':
        return (
          <CreditScoreStep
            value={formData.creditScore}
            onChange={(value) => updateFormData('creditScore', value)}
            onNext={onNext}
          />
        );

      case 'homeowner':
        return (
          <HomeownerStep
            value={formData.homeowner}
            onChange={(value) => updateFormData('homeowner', value)}
            onNext={onNext}
          />
        );

      case 'military':
        return (
          <MilitaryStep
            value={formData.military}
            onChange={(value) => updateFormData('military', value)}
            onNext={onNext}
          />
        );

      case 'driver-relationship':
        return (
          <DriverRelationshipStep
            value={formData.driverRelationship}
            onChange={(value) => updateFormData('driverRelationship', value)}
            onNext={onNext}
          />
        );

      case 'driver-education':
        return (
          <DriverEducationStep
            value={formData.driverEducation}
            onChange={(value) => updateFormData('driverEducation', value)}
            onNext={onNext}
          />
        );

      case 'driver-occupation':
        return (
          <DriverOccupationStep
            value={formData.driverOccupation}
            onChange={(value) => updateFormData('driverOccupation', value)}
            onNext={onNext}
          />
        );

      case 'birthdate':
        return (
          <BirthdateStep
            value={formData.birthdate}
            onChange={(value) => updateFormData('birthdate', value)}
            onNext={onNext}
          />
        );

      case 'contact-info':
        return (
          <ContactInfoStep
            firstName={formData.firstName}
            lastName={formData.lastName}
            email={formData.email}
            phoneNumber={formData.phoneNumber}
            streetAddress={formData.streetAddress}
            city={formData.city}
            state={formData.state}
            onFirstNameChange={(value) => updateFormData('firstName', value)}
            onLastNameChange={(value) => updateFormData('lastName', value)}
            onEmailChange={(value) => updateFormData('email', value)}
            onPhoneNumberChange={(value) => updateFormData('phoneNumber', value)}
            onStreetAddressChange={(value) => updateFormData('streetAddress', value)}
            onCityChange={(value) => updateFormData('city', value)}
            onStateChange={(value) => updateFormData('state', value)}
            onNext={onNext}
            onPrivacyClick={onPrivacyClick}
            onTermsClick={onTermsClick}
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