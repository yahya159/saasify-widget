import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PlansStoreService } from '../state/plans-store.service';
import { TierEditorComponent } from './tier-editor.component';
import { FeatureSelectorComponent } from './feature-selector.component';

@Component({
  selector: 'app-plan-editor',
  templateUrl: './plan-editor.component.html',
  styleUrls: ['./plan-editor.component.css'],
  imports: [CommonModule, ReactiveFormsModule, TierEditorComponent, FeatureSelectorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PlanEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private plansStore = inject(PlansStoreService);

  planForm!: FormGroup;
  selectedTierId = signal<string | null>(null);
  isNewPlan = signal(false);

  plan = this.plansStore.selectedPlan;

  ngOnInit(): void {
    this.initializeForm();
    this.loadPlan();
  }

  private initializeForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      public: [false]
    });
  }

  private loadPlan(): void {
    const planId = this.route.snapshot.paramMap.get('id');
    
    if (planId === 'new') {
      this.isNewPlan.set(true);
      this.createNewPlan();
    } else if (planId) {
      this.isNewPlan.set(false);
      this.plansStore.selectPlan(planId);
      
      const plan = this.plansStore.selectedPlan();
      if (plan) {
        this.planForm.patchValue({
          name: plan.name,
          description: plan.description,
          public: plan.public
        });
      }
    }
  }

  private createNewPlan(): void {
    const newPlan = this.plansStore.createPlan({
      name: 'New Plan',
      description: '',
      public: false,
      tiers: []
    });
    
    this.planForm.patchValue({
      name: newPlan.name,
      description: newPlan.description,
      public: newPlan.public
    });
  }

  savePlan(): void {
    if (this.planForm.valid) {
      const plan = this.plan();
      if (plan) {
        this.plansStore.updatePlan(plan.id, this.planForm.value);
        this.router.navigate(['/plans']);
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/plans']);
  }

  addTier(): void {
    const plan = this.plan();
    if (plan) {
      const newTier = this.plansStore.addTier(plan.id, {
        name: 'New Tier',
        monthlyPrice: 0,
        currency: 'USD',
        features: [],
        ctaLabel: 'Get Started'
      });
      
      if (newTier) {
        this.selectedTierId.set(newTier.id);
      }
    }
  }

  selectTier(tierId: string): void {
    this.selectedTierId.set(tierId);
  }

  duplicateTier(tierId: string): void {
    const plan = this.plan();
    if (plan) {
      const duplicatedTier = this.plansStore.duplicateTier(plan.id, tierId);
      if (duplicatedTier) {
        this.selectedTierId.set(duplicatedTier.id);
      }
    }
  }

  deleteTier(tierId: string): void {
    const plan = this.plan();
    if (plan && confirm('Are you sure you want to delete this tier?')) {
      this.plansStore.removeTier(plan.id, tierId);
      if (this.selectedTierId() === tierId) {
        this.selectedTierId.set(null);
      }
    }
  }

  getSelectedTier() {
    const plan = this.plan();
    const tierId = this.selectedTierId();
    if (!plan || !tierId) return null;
    return plan.tiers.find(tier => tier.id === tierId) || null;
  }
}
