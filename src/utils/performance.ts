// Performance monitoring utilities
export const performanceMonitor = {
  // Measure API response times
  measureApiCall: async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      console.log(`API ${endpoint}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`API ${endpoint} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Track user interactions
  trackEvent: (eventName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', eventName, properties);
    }
    console.log(`Event: ${eventName}`, properties);
  },

  // Monitor Core Web Vitals
  observeWebVitals: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log(`${entry.name}: ${entry.value}`);
        }
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
    }
  }
};