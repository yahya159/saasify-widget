import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetBlock, Plan, PlanTier } from '../../../../core/models/pricing.models';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-price-card',
  templateUrl: './price-card.component.html',
  styleUrls: ['./price-card.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PriceCardComponent {
  private themeService = inject(ThemeService);
  
  block = input<WidgetBlock>();
  plan = input<Plan | null>(null);

  getTier(): PlanTier | null {
    const plan = this.plan();
    const block = this.block();
    if (!plan || !block?.planTierId) return null;
    return plan.tiers.find((tier: PlanTier) => tier.id === block.planTierId) || null;
  }

  getPrice(): string {
    const tier = this.getTier();
    if (!tier) return 'No price';
    
    const originalCurrency = tier.currency as 'USD' | 'MAD';
    const price = tier.monthlyPrice;
    const convertedPrice = this.themeService.getPriceInCurrentCurrency(price, originalCurrency);
    return `${convertedPrice}/month`;
  }

  getCtaLabel(): string {
    const tier = this.getTier();
    return tier?.ctaLabel || 'Get Started';
  }

  isHighlighted(): boolean {
    const tier = this.getTier();
    return tier?.highlight || false;
  }
}
