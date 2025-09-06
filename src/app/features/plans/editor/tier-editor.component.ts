import { Component, ChangeDetectionStrategy, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlansStoreService } from '../state/plans-store.service';
import { PlanTier } from '../../../core/models/pricing.models';
import { FeatureSelectorComponent } from './feature-selector.component';

@Component({
  selector: 'app-tier-editor',
  templateUrl: './tier-editor.component.html',
  styleUrls: ['./tier-editor.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FeatureSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TierEditorComponent implements OnInit {
  tier = input<PlanTier | null>(null);
  planId = input('');
  tierUpdated = output<string>();
  closeEditor = output<void>();

  private fb = inject(FormBuilder);
  private plansStore = inject(PlansStoreService);

  tierForm!: FormGroup;
  currencies = ['USD', 'EUR', 'MAD'] as const;

  ngOnInit(): void {
    this.initializeForm();
    this.loadTierData();
  }

  private initializeForm(): void {
    this.tierForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      monthlyPrice: [0, [Validators.required, Validators.min(0)]],
      yearlyPrice: [0, [Validators.min(0)]],
      currency: ['USD', Validators.required],
      highlight: [false],
      ctaLabel: ['Get Started', Validators.required]
    });
  }

  private loadTierData(): void {
    const tier = this.tier();
    if (tier) {
      this.tierForm.patchValue({
        name: tier.name,
        monthlyPrice: tier.monthlyPrice,
        yearlyPrice: tier.yearlyPrice || 0,
        currency: tier.currency,
        highlight: tier.highlight || false,
        ctaLabel: tier.ctaLabel || 'Get Started'
      });
    }
  }

  saveTier(): void {
    const tier = this.tier();
    const planId = this.planId();
    if (this.tierForm.valid && tier && planId) {
      const formValue = this.tierForm.value;
      
      this.plansStore.updateTier(planId, tier.id, {
        name: formValue.name,
        monthlyPrice: formValue.monthlyPrice,
        yearlyPrice: formValue.yearlyPrice || undefined,
        currency: formValue.currency,
        highlight: formValue.highlight,
        ctaLabel: formValue.ctaLabel
      });

      this.tierUpdated.emit(tier.id);
    }
  }

  onCloseEditor(): void {
    this.closeEditor.emit();
  }

  getTierFeatures(): string[] {
    const tier = this.tier();
    return tier?.features || [];
  }

  toggleFeature(featureKey: string): void {
    const tier = this.tier();
    const planId = this.planId();
    if (tier && planId) {
      this.plansStore.toggleFeatureForTier(planId, tier.id, featureKey);
    }
  }

  setFeatureLimit(featureKey: string, limit: number | string | null): void {
    const tier = this.tier();
    const planId = this.planId();
    if (tier && planId) {
      this.plansStore.setLimitForTier(planId, tier.id, featureKey, limit);
    }
  }

  getFeatureLimit(featureKey: string): number | string | null {
    const tier = this.tier();
    const planId = this.planId();
    if (tier && planId) {
      return this.plansStore.getTierLimit(planId, tier.id, featureKey);
    }
    return null;
  }
}
