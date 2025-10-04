// Cookie Management Utility
export interface CookiePreferences {
  essential: boolean;
  analytical: boolean;
  marketing: boolean;
}

export class CookieManager {
  private static instance: CookieManager;
  private preferences: CookiePreferences = {
    essential: true,
    analytical: false,
    marketing: false
  };

  private constructor() {
    this.loadPreferences();
  }

  public static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  // Load preferences from localStorage
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem('cookie-preferences');
      if (stored) {
        this.preferences = { ...this.preferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    }
  }

  // Save preferences to localStorage
  private savePreferences(): void {
    try {
      localStorage.setItem('cookie-preferences', JSON.stringify(this.preferences));
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
    }
  }

  // Update preferences
  public updatePreferences(preferences: Partial<CookiePreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
    this.applyCookieSettings();
  }

  // Get current preferences
  public getPreferences(): CookiePreferences {
    return { ...this.preferences };
  }

  // Apply cookie settings based on preferences
  private applyCookieSettings(): void {
    // Essential cookies are always enabled
    this.setEssentialCookies();

    // Analytical cookies
    if (this.preferences.analytical) {
      this.enableAnalyticalCookies();
    } else {
      this.disableAnalyticalCookies();
    }

    // Marketing cookies
    if (this.preferences.marketing) {
      this.enableMarketingCookies();
    } else {
      this.disableMarketingCookies();
    }
  }

  // Essential cookies (always enabled)
  private setEssentialCookies(): void {
    // Session management
    this.setCookie('session_id', this.generateSessionId(), 24 * 60 * 60 * 1000); // 24 hours
    this.setCookie('user_preferences', 'basic', 365 * 24 * 60 * 60 * 1000); // 1 year
    this.setCookie('language', 'pl', 365 * 24 * 60 * 60 * 1000); // 1 year
  }

  // Analytical cookies
  private enableAnalyticalCookies(): void {
    // Google Analytics (if implemented)
    this.setCookie('_ga', this.generateAnalyticsId(), 2 * 365 * 24 * 60 * 60 * 1000); // 2 years
    this.setCookie('_ga_analytics', 'enabled', 2 * 365 * 24 * 60 * 60 * 1000); // 2 years
    
    // Custom analytics
    this.setCookie('analytics_enabled', 'true', 365 * 24 * 60 * 60 * 1000); // 1 year
    this.setCookie('page_views', '0', 30 * 24 * 60 * 60 * 1000); // 30 days
    
    console.log('Analytical cookies enabled');
  }

  private disableAnalyticalCookies(): void {
    this.deleteCookie('_ga');
    this.deleteCookie('_ga_analytics');
    this.deleteCookie('analytics_enabled');
    this.deleteCookie('page_views');
    console.log('Analytical cookies disabled');
  }

  // Marketing cookies
  private enableMarketingCookies(): void {
    // Facebook Pixel (if implemented)
    this.setCookie('_fbp', this.generateMarketingId(), 90 * 24 * 60 * 60 * 1000); // 90 days
    
    // Marketing preferences
    this.setCookie('marketing_enabled', 'true', 365 * 24 * 60 * 60 * 1000); // 1 year
    this.setCookie('ad_preferences', 'personalized', 365 * 24 * 60 * 60 * 1000); // 1 year
    
    console.log('Marketing cookies enabled');
  }

  private disableMarketingCookies(): void {
    this.deleteCookie('_fbp');
    this.deleteCookie('marketing_enabled');
    this.deleteCookie('ad_preferences');
    console.log('Marketing cookies disabled');
  }

  // Utility methods
  private setCookie(name: string, value: string, maxAge: number): void {
    document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=; max-age=0; path=/`;
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private generateAnalyticsId(): string {
    return 'GA1.2.' + Math.random().toString(36).substr(2, 9) + '.' + Date.now();
  }

  private generateMarketingId(): string {
    return 'fb.' + Math.random().toString(36).substr(2, 9) + '.' + Date.now();
  }

  // Track page view (if analytical cookies enabled)
  public trackPageView(page: string): void {
    if (this.preferences.analytical) {
      console.log(`Analytics: Page view tracked - ${page}`);
      // Here you would send data to your analytics service
      this.incrementPageViews();
    }
  }

  // Track user action (if analytical cookies enabled)
  public trackAction(action: string, data?: any): void {
    if (this.preferences.analytical) {
      console.log(`Analytics: Action tracked - ${action}`, data);
      // Here you would send data to your analytics service
    }
  }

  // Track conversion (if marketing cookies enabled)
  public trackConversion(conversion: string, value?: number): void {
    if (this.preferences.marketing) {
      console.log(`Marketing: Conversion tracked - ${conversion}`, value);
      // Here you would send data to your marketing service
    }
  }

  private incrementPageViews(): void {
    const currentViews = parseInt(this.getCookie('page_views') || '0');
    this.setCookie('page_views', (currentViews + 1).toString(), 30 * 24 * 60 * 60 * 1000);
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  // Get analytics data (for admin purposes)
  public getAnalyticsData(): any {
    if (!this.preferences.analytical) return null;
    
    return {
      sessionId: this.getCookie('session_id'),
      pageViews: parseInt(this.getCookie('page_views') || '0'),
      analyticsId: this.getCookie('_ga'),
      lastActivity: new Date().toISOString()
    };
  }

  // Get marketing data (for admin purposes)
  public getMarketingData(): any {
    if (!this.preferences.marketing) return null;
    
    return {
      marketingId: this.getCookie('_fbp'),
      preferences: this.getCookie('ad_preferences'),
      enabled: this.getCookie('marketing_enabled') === 'true'
    };
  }
}

// Export singleton instance
export const cookieManager = CookieManager.getInstance();
