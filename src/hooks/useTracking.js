// React hook for managing tracking across the application
import { useEffect, useCallback, useRef } from 'react';
import tracking from '../utils/tracking';

export const useTracking = () => {
  const isInitialized = useRef(false);

  // Initialize tracking on first use
  useEffect(() => {
    if (!isInitialized.current) {
      tracking.init();
      isInitialized.current = true;
    }
  }, []);

  // Memoized tracking functions to prevent unnecessary re-renders
  const trackPageView = useCallback((page_title, additional_data = {}) => {
    tracking.trackPageView(page_title, additional_data);
  }, []);

  const trackFormStep = useCallback((step_name, step_number, form_data = {}) => {
    tracking.trackFormStep(step_name, step_number, form_data);
  }, []);

  const trackFormCompletion = useCallback((form_data = {}) => {
    tracking.trackFormCompletion(form_data);
  }, []);

  const trackConversion = useCallback((revenue_amount = null, additional_data = {}) => {
    tracking.trackConversion(revenue_amount, additional_data);
  }, []);

  const trackEvent = useCallback((event_name, parameters = {}) => {
    tracking.trackEvent(event_name, parameters);
  }, []);

  return {
    trackPageView,
    trackFormStep,
    trackFormCompletion,
    trackConversion,
    trackEvent
  };
};

export default useTracking; 