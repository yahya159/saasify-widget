import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetBlock, Plan, PlanTier, Feature } from '../../../../core/models/pricing.models';
import { WidgetStoreService } from '../../state/widget-store.service';

@Component({
  selector: 'app-feature-list',
  templateUrl: './feature-list.component.html',
  styleUrls: ['./feature-list.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class FeatureListComponent {
  block = input<WidgetBlock>();
  plan = input<Plan | null>(null);

  private widgetStore = inject(WidgetStoreService);
  features = this.widgetStore.features;

  getTier(): PlanTier | null {
    const plan = this.plan();
    const block = this.block();
    if (!plan || !block?.planTierId) return null;
    return plan.tiers.find((tier: PlanTier) => tier.id === block.planTierId) || null;
  }

  getTierFeatures(): Feature[] {
    const tier = this.getTier();
    if (!tier) return [];

    return tier.features
      .map((featureKey: string) => this.features().find(f => f.key === featureKey))
      .filter((feature): feature is Feature => feature !== undefined);
  }

  getFeatureLimit(featureKey: string): number | string | null {
    const tier = this.getTier();
    if (!tier || !tier.limits) return null;
    return tier.limits[featureKey] || null;
  }
}
