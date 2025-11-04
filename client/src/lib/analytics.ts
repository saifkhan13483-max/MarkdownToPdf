// Analytics utility for tracking events
// Using Plausible Analytics - privacy-friendly, no cookies

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, string | number | boolean> }) => void;
  }
}

export const analytics = {
  // Track custom events
  track: (eventName: string, props?: Record<string, string | number | boolean>) => {
    try {
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible(eventName, { props });
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  },

  // Conversion events
  trackConversion: (action: 'download' | 'view' | 'share', format?: string) => {
    analytics.track('PDF Conversion', {
      action,
      format: format || 'pdf',
    });
  },

  trackUpload: (filename: string) => {
    analytics.track('File Upload', {
      fileType: filename.split('.').pop() || 'unknown',
    });
  },

  trackError: (errorType: string, errorMessage?: string) => {
    analytics.track('Error', {
      type: errorType,
      message: errorMessage || 'Unknown error',
    });
  },

  trackFeatureUsage: (feature: string, value?: string) => {
    analytics.track('Feature Usage', {
      feature,
      value: value || 'used',
    });
  },
};
