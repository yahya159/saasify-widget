import { Component, ChangeDetectionStrategy, inject, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlansStoreService } from '../state/plans-store.service';
import { PlanTier, Feature } from '../../../core/models/pricing.models';

@Component({
  selector: 'app-feature-selector',
  templateUrl: './feature-selector.component.html',
  styleUrls: ['./feature-selector.component.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class FeatureSelectorComponent {
  tier = input<PlanTier | null>(null);
  planId = input('');
  featureToggled = output<string>();
  limitChanged = output<{ featureKey: string; limit: number | string | null }>();

  private plansStore = inject(PlansStoreService);

  searchQuery = signal<string>('');
  
  features = computed(() => this.plansStore.features());
  
  filteredFeatures = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.features();
    
    return this.features().filter(feature =>
      feature.name.toLowerCase().includes(query) ||
      feature.key.toLowerCase().includes(query) ||
      (feature.description && feature.description.toLowerCase().includes(query))
    );
  });

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  isFeatureEnabled(featureKey: string): boolean {
    const tier = this.tier();
    return tier?.features.includes(featureKey) || false;
  }

  toggleFeature(featureKey: string): void {
    this.featureToggled.emit(featureKey);
  }

  getFeatureLimit(featureKey: string): number | string | null {
    const tier = this.tier();
    const planId = this.planId();
    if (!tier || !planId) return null;
    return this.plansStore.getTierLimit(planId, tier.id, featureKey);
  }

  updateFeatureLimit(featureKey: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    let limit: number | string | null = target.value;
    
    // Convert to number if it's a valid number
    if (limit && !isNaN(Number(limit))) {
      limit = Number(limit);
    }
    
    // Set to null if empty
    if (limit === '') {
      limit = null;
    }
    
    this.limitChanged.emit({ featureKey, limit });
  }

  getFeatureType(feature: Feature): 'number' | 'text' {
    // Determine if this feature typically has numeric or text limits
    const numericFeatures = ['api.limit', 'seats', 'projects.max', 'storage.gb', 'rate.limit'];
    return numericFeatures.includes(feature.key) ? 'number' : 'text';
  }

  getFeaturePlaceholder(feature: Feature): string {
    const placeholders: Record<string, string> = {
      'api.limit': 'e.g., 10000',
      'seats': 'e.g., 5',
      'projects.max': 'e.g., 10',
      'storage.gb': 'e.g., 100',
      'rate.limit': 'e.g., 1000',
      'custom.domain': 'e.g., mycompany.com'
    };
    
    return placeholders[feature.key] || 'Enter limit';
  }
}
