import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PlansStoreService } from '../state/plans-store.service';

@Component({
  selector: 'app-plans-list',
  templateUrl: './plans-list.component.html',
  styleUrls: ['./plans-list.component.css'],
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PlansListComponent {
  plansStore = inject(PlansStoreService);
  private router = inject(Router);

  plans = this.plansStore.plans;

  createPlan(): void {
    const newPlan = this.plansStore.createPlan({
      name: 'New Plan',
      description: 'A new pricing plan',
      public: false,
      tiers: []
    });
    
    // Navigate to editor
    this.router.navigate(['/plans/edit', newPlan.id]);
  }

  duplicatePlan(planId: string): void {
    this.plansStore.duplicatePlan(planId);
  }

  deletePlan(planId: string): void {
    if (confirm('Are you sure you want to delete this plan?')) {
      this.plansStore.deletePlan(planId);
    }
  }

  editPlan(planId: string): void {
    this.router.navigate(['/plans/edit', planId]);
  }

  getTotalFeatures(plan: { tiers: { features: string[] }[] }): number {
    const allFeatures = new Set<string>();
    plan.tiers.forEach((tier) => {
      tier.features.forEach((feature: string) => allFeatures.add(feature));
    });
    return allFeatures.size;
  }
}
