import { Injectable, signal, computed } from '@angular/core';

export interface ThemeSettings {
  accentColor: string;
  radiusScale: number;
  isDarkMode: boolean;
  currency: 'USD' | 'MAD';
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Default theme settings
  private readonly defaultTheme: ThemeSettings = {
    accentColor: '#3498db',
    radiusScale: 8,
    isDarkMode: false,
    currency: 'USD'
  };

  // Signals for theme state
  private readonly _accentColor = signal<string>(this.defaultTheme.accentColor);
  private readonly _radiusScale = signal<number>(this.defaultTheme.radiusScale);
  private readonly _isDarkMode = signal<boolean>(this.defaultTheme.isDarkMode);
  private readonly _currency = signal<'USD' | 'MAD'>(this.defaultTheme.currency);

  // Public computed signals
  readonly accentColor = computed(() => this._accentColor());
  readonly radiusScale = computed(() => this._radiusScale());
  readonly isDarkMode = computed(() => this._isDarkMode());
  readonly currency = computed(() => this._currency());

  // Computed theme object
  readonly theme = computed(() => ({
    accentColor: this.accentColor(),
    radiusScale: this.radiusScale(),
    isDarkMode: this.isDarkMode(),
    currency: this.currency()
  }));

  // Computed CSS custom properties with WCAG AA compliant colors
  readonly cssVariables = computed(() => ({
    '--accent-color': this.accentColor(),
    '--radius-sm': `${this.radiusScale() / 2}px`,
    '--radius-md': `${this.radiusScale()}px`,
    '--radius-lg': `${this.radiusScale() * 1.5}px`,
    '--radius-xl': `${this.radiusScale() * 2}px`,
    // Light mode colors (WCAG AA compliant)
    '--bg-primary': this.isDarkMode() ? '#1a1a1a' : '#ffffff',
    '--bg-secondary': this.isDarkMode() ? '#2d2d2d' : '#f8f9fa',
    '--text-primary': this.isDarkMode() ? '#ffffff' : '#212529', // Darker for better contrast
    '--text-secondary': this.isDarkMode() ? '#e0e0e0' : '#495057', // Darker for better contrast
    '--text-muted': this.isDarkMode() ? '#b0b0b0' : '#6c757d',
    '--border-color': this.isDarkMode() ? '#404040' : '#dee2e6',
    '--border-light': this.isDarkMode() ? '#2d2d2d' : '#e9ecef',
    // Interactive states
    '--link-color': this.isDarkMode() ? '#66b3ff' : '#0066cc',
    '--link-hover': this.isDarkMode() ? '#99ccff' : '#004499',
    '--success-color': this.isDarkMode() ? '#4ade80' : '#198754',
    '--warning-color': this.isDarkMode() ? '#fbbf24' : '#fd7e14',
    '--error-color': this.isDarkMode() ? '#f87171' : '#dc3545',
    // Focus indicators
    '--focus-ring': this.isDarkMode() ? '0 0 0 3px rgba(102, 179, 255, 0.5)' : '0 0 0 3px rgba(0, 102, 204, 0.3)'
  }));

  constructor() {
    this.loadThemeFromStorage();
  }

  // Actions
  setAccentColor(color: string): void {
    this._accentColor.set(color);
    this.saveThemeToStorage();
  }

  setRadiusScale(scale: number): void {
    this._radiusScale.set(scale);
    this.saveThemeToStorage();
  }

  toggleDarkMode(): void {
    this._isDarkMode.set(!this._isDarkMode());
    this.saveThemeToStorage();
  }

  setDarkMode(isDark: boolean): void {
    this._isDarkMode.set(isDark);
    this.saveThemeToStorage();
  }

  setCurrency(currency: 'USD' | 'MAD'): void {
    this._currency.set(currency);
    this.saveThemeToStorage();
  }

  toggleCurrency(): void {
    this._currency.set(this._currency() === 'USD' ? 'MAD' : 'USD');
    this.saveThemeToStorage();
  }

  resetTheme(): void {
    this._accentColor.set(this.defaultTheme.accentColor);
    this._radiusScale.set(this.defaultTheme.radiusScale);
    this._isDarkMode.set(this.defaultTheme.isDarkMode);
    this._currency.set(this.defaultTheme.currency);
    this.saveThemeToStorage();
  }

  // Persistence
  private loadThemeFromStorage(): void {
    try {
      const stored = localStorage.getItem('theme-settings');
      if (stored) {
        const theme: ThemeSettings = JSON.parse(stored);
        this._accentColor.set(theme.accentColor || this.defaultTheme.accentColor);
        this._radiusScale.set(theme.radiusScale || this.defaultTheme.radiusScale);
        this._isDarkMode.set(theme.isDarkMode ?? this.defaultTheme.isDarkMode);
        this._currency.set(theme.currency || this.defaultTheme.currency);
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error);
    }
  }

  private saveThemeToStorage(): void {
    try {
      const theme: ThemeSettings = {
        accentColor: this._accentColor(),
        radiusScale: this._radiusScale(),
        isDarkMode: this._isDarkMode(),
        currency: this._currency()
      };
      localStorage.setItem('theme-settings', JSON.stringify(theme));
    } catch (error) {
      console.warn('Failed to save theme to storage:', error);
    }
  }

  // Utility methods
  getRadiusClass(size: 'sm' | 'md' | 'lg' | 'xl'): string {
    const scale = this.radiusScale();
    const radiusMap = {
      sm: scale / 2,
      md: scale,
      lg: scale * 1.5,
      xl: scale * 2
    };
    return `radius-${size}`;
  }

  getAccentColorVariants(): { light: string; main: string; dark: string } {
    const color = this.accentColor();
    // Simple color manipulation for variants
    return {
      light: this.lightenColor(color, 0.3),
      main: color,
      dark: this.darkenColor(color, 0.2)
    };
  }

  private lightenColor(color: string, amount: number): string {
    // Simple color lightening - in a real app, use a proper color library
    return color; // Placeholder
  }

  private darkenColor(color: string, amount: number): string {
    // Simple color darkening - in a real app, use a proper color library
    return color; // Placeholder
  }

  // Currency conversion (simplified - in real app, use live rates)
  convertPrice(price: number, fromCurrency: 'USD' | 'MAD', toCurrency: 'USD' | 'MAD'): number {
    if (fromCurrency === toCurrency) return price;
    
    // Simplified conversion rates (in real app, use live rates)
    const usdToMad = 10; // 1 USD = 10 MAD (example rate)
    
    if (fromCurrency === 'USD' && toCurrency === 'MAD') {
      return price * usdToMad;
    } else if (fromCurrency === 'MAD' && toCurrency === 'USD') {
      return price / usdToMad;
    }
    
    return price;
  }

  formatPrice(price: number, currency: 'USD' | 'MAD'): string {
    const symbol = currency === 'USD' ? '$' : 'MAD';
    return `${symbol}${price.toFixed(currency === 'USD' ? 2 : 0)}`;
  }

  getPriceInCurrentCurrency(price: number, originalCurrency: 'USD' | 'MAD'): string {
    const currentCurrency = this.currency();
    const convertedPrice = this.convertPrice(price, originalCurrency, currentCurrency);
    return this.formatPrice(convertedPrice, currentCurrency);
  }
}
