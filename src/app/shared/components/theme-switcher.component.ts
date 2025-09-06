import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-switcher',
  template: `
    <div class="theme-switcher">
      <h3>Brand Theme</h3>
      
      <form [formGroup]="themeForm" class="theme-form">
        <!-- Accent Color -->
        <div class="form-group">
          <label for="accentColor">Accent Color</label>
          <div class="color-input-group">
            <input 
              type="color" 
              id="accentColor"
              formControlName="accentColor"
              class="color-picker">
            <input 
              type="text" 
              formControlName="accentColorText"
              class="color-text"
              placeholder="#3498db">
          </div>
        </div>

        <!-- Radius Scale -->
        <div class="form-group">
          <label for="radiusScale">Border Radius Scale</label>
          <div class="radius-preview">
            <div class="radius-demo" 
                 [style.border-radius]="themeService.radiusScale() + 'px'">
              {{ themeService.radiusScale() }}px
            </div>
          </div>
          <input 
            type="range" 
            id="radiusScale"
            formControlName="radiusScale"
            min="4" 
            max="16" 
            step="2"
            class="radius-slider">
          <div class="radius-options">
            <button type="button" 
                    *ngFor="let size of radiusOptions" 
                    (click)="setRadiusScale(size)"
                    [class.active]="themeService.radiusScale() === size"
                    class="radius-btn">
              {{ size }}px
            </button>
          </div>
        </div>

        <!-- Dark Mode Toggle -->
        <div class="form-group">
          <label class="toggle-label">
            <input 
              type="checkbox" 
              formControlName="isDarkMode"
              class="toggle-input">
            <span class="toggle-slider"></span>
            <span class="toggle-text">Dark Mode</span>
          </label>
        </div>

        <!-- Currency Toggle -->
        <div class="form-group">
          <label for="currency">Currency</label>
          <div class="currency-toggle">
            <button type="button" 
                    (click)="setCurrency('USD')"
                    [class.active]="themeService.currency() === 'USD'"
                    class="currency-btn">
              USD
            </button>
            <button type="button" 
                    (click)="setCurrency('MAD')"
                    [class.active]="themeService.currency() === 'MAD'"
                    class="currency-btn">
              MAD
            </button>
          </div>
        </div>

        <!-- Reset Button -->
        <div class="form-actions">
          <button type="button" (click)="resetTheme()" class="btn btn-outline">
            Reset to Default
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .theme-switcher {
      padding: 1rem;
      background: var(--bg-secondary, #f8f9fa);
      border-radius: var(--radius-md, 8px);
      border: 1px solid var(--border-color, #e0e0e0);
    }

    .theme-switcher h3 {
      margin: 0 0 1rem 0;
      color: var(--text-primary, #333);
      font-size: 1.1rem;
    }

    .theme-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: var(--text-primary, #333);
      font-size: 0.9rem;
    }

    .color-input-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .color-picker {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: var(--radius-sm, 4px);
      cursor: pointer;
    }

    .color-text {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: var(--radius-sm, 4px);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
    }

    .radius-preview {
      margin-bottom: 0.5rem;
    }

    .radius-demo {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: var(--accent-color, #3498db);
      color: white;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .radius-slider {
      width: 100%;
      margin-bottom: 0.5rem;
    }

    .radius-options {
      display: flex;
      gap: 0.25rem;
    }

    .radius-btn {
      padding: 0.25rem 0.5rem;
      border: 1px solid var(--border-color, #e0e0e0);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: var(--radius-sm, 4px);
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.2s;
    }

    .radius-btn:hover {
      background: var(--bg-secondary, #f8f9fa);
    }

    .radius-btn.active {
      background: var(--accent-color, #3498db);
      color: white;
      border-color: var(--accent-color, #3498db);
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .toggle-input {
      display: none;
    }

    .toggle-slider {
      position: relative;
      width: 40px;
      height: 20px;
      background: #ccc;
      border-radius: 20px;
      transition: background 0.3s;
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      transition: transform 0.3s;
    }

    .toggle-input:checked + .toggle-slider {
      background: var(--accent-color, #3498db);
    }

    .toggle-input:checked + .toggle-slider::before {
      transform: translateX(20px);
    }

    .toggle-text {
      color: var(--text-primary, #333);
      font-size: 0.9rem;
    }

    .form-actions {
      margin-top: 0.5rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border-color, #e0e0e0);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: var(--radius-sm, 4px);
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s;
    }

    .btn:hover {
      background: var(--bg-secondary, #f8f9fa);
    }

    .btn-outline {
      border-color: var(--accent-color, #3498db);
      color: var(--accent-color, #3498db);
    }

    .btn-outline:hover {
      background: var(--accent-color, #3498db);
      color: white;
    }

    .currency-toggle {
      display: flex;
      gap: 0.25rem;
    }

    .currency-btn {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid var(--border-color, #e0e0e0);
      background: var(--bg-primary, #fff);
      color: var(--text-primary, #333);
      border-radius: var(--radius-sm, 4px);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }

    .currency-btn:hover {
      background: var(--bg-secondary, #f8f9fa);
    }

    .currency-btn.active {
      background: var(--accent-color, #3498db);
      color: white;
      border-color: var(--accent-color, #3498db);
    }
  `],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ThemeSwitcherComponent {
  themeService = inject(ThemeService);
  private fb = inject(FormBuilder);

  themeForm!: FormGroup;
  radiusOptions = [4, 6, 8, 10, 12, 14, 16];

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormSubscriptions();
  }

  private initializeForm(): void {
    this.themeForm = this.fb.group({
      accentColor: [this.themeService.accentColor()],
      accentColorText: [this.themeService.accentColor()],
      radiusScale: [this.themeService.radiusScale()],
      isDarkMode: [this.themeService.isDarkMode()]
    });
  }

  private setupFormSubscriptions(): void {
    // Accent color changes
    this.themeForm.get('accentColor')?.valueChanges.subscribe(color => {
      this.themeService.setAccentColor(color);
      this.themeForm.get('accentColorText')?.setValue(color, { emitEvent: false });
    });

    this.themeForm.get('accentColorText')?.valueChanges.subscribe(color => {
      if (this.isValidColor(color)) {
        this.themeService.setAccentColor(color);
        this.themeForm.get('accentColor')?.setValue(color, { emitEvent: false });
      }
    });

    // Radius scale changes
    this.themeForm.get('radiusScale')?.valueChanges.subscribe(scale => {
      this.themeService.setRadiusScale(scale);
    });

    // Dark mode changes
    this.themeForm.get('isDarkMode')?.valueChanges.subscribe(isDark => {
      this.themeService.setDarkMode(isDark);
    });
  }

  setRadiusScale(scale: number): void {
    this.themeService.setRadiusScale(scale);
    this.themeForm.get('radiusScale')?.setValue(scale);
  }

  setCurrency(currency: 'USD' | 'MAD'): void {
    this.themeService.setCurrency(currency);
  }

  resetTheme(): void {
    this.themeService.resetTheme();
    this.initializeForm();
  }

  private isValidColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }
}
