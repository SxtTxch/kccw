import { useEffect } from 'react';
import { cookieManager } from '../utils/cookieManager';

// Hook for tracking analytics
export const useAnalytics = () => {
  const trackPageView = (page: string) => {
    cookieManager.trackPageView(page);
  };

  const trackAction = (action: string, data?: any) => {
    cookieManager.trackAction(action, data);
  };

  const trackConversion = (conversion: string, value?: number) => {
    cookieManager.trackConversion(conversion, value);
  };

  const getAnalyticsData = () => {
    return cookieManager.getAnalyticsData();
  };

  const getMarketingData = () => {
    return cookieManager.getMarketingData();
  };

  return {
    trackPageView,
    trackAction,
    trackConversion,
    getAnalyticsData,
    getMarketingData
  };
};

// Hook for automatic page tracking
export const usePageTracking = (pageName: string) => {
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView(pageName);
  }, [pageName, trackPageView]);
};
