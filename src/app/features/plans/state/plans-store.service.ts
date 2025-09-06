import { Injectable, signal, computed, inject } from '@angular/core';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Plan, PlanTier, Feature } from '../../../core/models/pricing.models';

@Injectable({
  providedIn: 'root'
})
export class PlansStoreService {
  private mockApi = inject(MockApiService);
  
  // Signals
  readonly plans = computed(() => this.mockApi.plans());
  readonly features = computed(() => this.mockApi.features());
  readonly selectedPlanId = signal<string | null>(null);
  
  // Computed
  readonly selectedPlan = computed(() => {
    const planId = this.selectedPlanId();
    if (!planId) return null;
    return this.plans().find(plan => plan.id === planId) || null;
  });

  // Actions
  createPlan(planData: Omit<Plan, 'id'>): Plan {
    const newPlan = this.mockApi.addPlan(planData);
    this.selectedPlanId.set(newPlan.id);
    return newPlan;
  }

  duplicatePlan(planId: string): Plan {
    const originalPlan = this.mockApi.getPlan(planId);
    if (!originalPlan) {
      throw new Error('Plan not found');
    }

    const duplicatedPlan: Omit<Plan, 'id'> = {
      name: `${originalPlan.name} (Copy)`,
      description: originalPlan.description,
      public: false, // Duplicated plans are private by default
      tiers: originalPlan.tiers.map(tier => ({
        ...tier,
        id: this.generateId(), // Generate new IDs for tiers
        name: `${tier.name} (Copy)`
      }))
    };

    const newPlan = this.mockApi.addPlan(duplicatedPlan);
    this.selectedPlanId.set(newPlan.id);
    return newPlan;
  }

  updatePlan(planId: string, updates: Partial<Plan>): Plan | undefined {
    return this.mockApi.updatePlan(planId, updates);
  }

  deletePlan(planId: string): boolean {
    const success = this.mockApi.deletePlan(planId);
    if (success && this.selectedPlanId() === planId) {
      this.selectedPlanId.set(null);
    }
    return success;
  }

  selectPlan(planId: string | null): void {
    this.selectedPlanId.set(planId);
  }

  addTier(planId: string, tierData: Omit<PlanTier, 'id'>): PlanTier | undefined {
    const plan = this.mockApi.getPlan(planId);
    if (!plan) return undefined;

    const newTier: PlanTier = {
      ...tierData,
      id: this.generateId()
    };

    const updatedPlan = this.mockApi.updatePlan(planId, {
      tiers: [...plan.tiers, newTier]
    });

    return updatedPlan?.tiers.find(tier => tier.id === newTier.id);
  }

  duplicateTier(planId: string, tierId: string): PlanTier | undefined {
    const plan = this.mockApi.getPlan(planId);
    if (!plan) return undefined;

    const originalTier = plan.tiers.find(tier => tier.id === tierId);
    if (!originalTier) return undefined;

    const duplicatedTier: Omit<PlanTier, 'id'> = {
      ...originalTier,
      name: `${originalTier.name} Copy`,
      highlight: false
    };

    return this.addTier(planId, duplicatedTier);
  }

  updateTier(planId: string, tierId: string, updates: Partial<PlanTier>): PlanTier | undefined {
    const plan = this.mockApi.getPlan(planId);
    if (!plan) return undefined;

    const updatedTiers = plan.tiers.map(tier =>
      tier.id === tierId ? { ...tier, ...updates } : tier
    );

    const updatedPlan = this.mockApi.updatePlan(planId, {
      tiers: updatedTiers
    });

    return updatedPlan?.tiers.find(tier => tier.id === tierId);
  }

  removeTier(planId: string, tierId: string): boolean {
    const plan = this.mockApi.getPlan(planId);
    if (!plan) return false;

    const updatedTiers = plan.tiers.filter(tier => tier.id !== tierId);
    
    this.mockApi.updatePlan(planId, {
      tiers: updatedTiers
    });

    return true;
  }

  toggleFeatureForTier(planId: string, tierId: string, featureKey: string): boolean {
    const plan = this.mockApi.getPlan(planId);
    if (!plan) return false;

    const tier = plan.tiers.find(t => t.id === tierId);
    if (!tier) return false;

    const hasFeature = tier.features.includes(featureKey);
    const updatedFeatures = hasFeature
      ? tier.features.filter(f => f !== featureKey)
      : [...tier.features, featureKey];

    this.updateTier(planId, tierId, { features: updatedFeatures });
    return !hasFeature;
  }

  setLimitForTier(planId: string, tierId: string, featureKey: string, limit: number | string | null): void {
    const plan = this.mockApi.getPlan(planId);
    if (!plan) return;

    const tier = plan.tiers.find(t => t.id === tierId);
    if (!tier) return;

    const updatedLimits = { ...tier.limits };
    
    if (limit === null || limit === '') {
      delete updatedLimits[featureKey];
    } else {
      updatedLimits[featureKey] = limit;
    }

    this.updateTier(planId, tierId, { limits: updatedLimits });
  }

  getTierLimit(planId: string, tierId: string, featureKey: string): number | string | null {
    const plan = this.mockApi.getPlan(planId);
    if (!plan) return null;

    const tier = plan.tiers.find(t => t.id === tierId);
    if (!tier || !tier.limits) return null;

    return tier.limits[featureKey] || null;
  }

  getFeature(featureKey: string): Feature | undefined {
    return this.features().find(f => f.key === featureKey);
  }

  getTierFeatures(tier: PlanTier): Feature[] {
    return tier.features
      .map(featureKey => this.getFeature(featureKey))
      .filter((feature): feature is Feature => feature !== undefined);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
