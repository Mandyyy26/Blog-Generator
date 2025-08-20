export function trackEvent(event: string, data?: any): void {
    console.log(`[Analytics] ${event}`, data);
    
    // In a real app, you would send this to your analytics service
    // Example: analytics.track(event, data);
  }