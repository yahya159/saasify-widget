import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WidgetStoreService } from '../../state/widget-store.service';
import { WidgetBlockType } from '../../../../core/models/pricing.models';

@Component({
  selector: 'app-properties-panel',
  templateUrl: './properties-panel.component.html',
  styleUrls: ['./properties-panel.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PropertiesPanelComponent implements OnInit {
  private fb = inject(FormBuilder);
  private widgetStore = inject(WidgetStoreService);

  selectedWidget = this.widgetStore.selectedWidget;
  selectedBlock = this.widgetStore.selectedBlock;
  attachedPlan = this.widgetStore.attachedPlan;
  plans = this.widgetStore.plans;

  blockForm!: FormGroup;
  widgetForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.blockForm = this.fb.group({
      text: [''],
      planTierId: [''],
      width: [null],
      textAlign: ['left'],
      radius: [null],
      padding: [null],
      elevation: [0]
    });

    this.widgetForm = this.fb.group({
      name: ['', Validators.required],
      attachedPlanId: [''],
      gap: [16],
      background: ['#ffffff'],
      maxWidth: [1200]
    });

    // Subscribe to form changes
    this.blockForm.valueChanges.subscribe(value => {
      this.updateBlockProperties(value);
    });

    this.widgetForm.valueChanges.subscribe(value => {
      this.updateWidgetProperties(value);
    });
  }

  private updateBlockProperties(value: Record<string, unknown>): void {
    const selectedBlock = this.selectedBlock();
    const selectedWidget = this.selectedWidget();
    
    if (!selectedBlock || !selectedWidget) return;

    const { text, planTierId, ...style } = value;
    
    if (text !== undefined && typeof text === 'string') {
      this.widgetStore.updateBlockText(selectedWidget.id, selectedBlock.block.id, text);
    }
    
    if (planTierId !== undefined) {
      // Update the block's planTierId directly
      // This would need to be handled differently in the store
      // TODO: Implement planTierId update in the store
    }
    
    if (Object.keys(style).length > 0) {
      this.widgetStore.updateBlockStyle(selectedWidget.id, selectedBlock.block.id, style);
    }
  }

  private updateWidgetProperties(value: Record<string, unknown>): void {
    const selectedWidget = this.selectedWidget();
    if (!selectedWidget) return;

    this.widgetStore.updateWidget(selectedWidget.id, value);
  }

  getBlockType(): WidgetBlockType | null {
    return this.selectedBlock()?.block.type || null;
  }

  getAvailableTiers() {
    const plan = this.attachedPlan();
    return plan?.tiers || [];
  }

  isPriceCardBlock(): boolean {
    return this.getBlockType() === 'price-card';
  }

  isFeatureListBlock(): boolean {
    return this.getBlockType() === 'feature-list';
  }

  getTextAlignOptions() {
    return [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' }
    ];
  }

  getElevationOptions() {
    return [
      { value: 0, label: 'None' },
      { value: 1, label: 'Small' },
      { value: 2, label: 'Medium' },
      { value: 3, label: 'Large' }
    ];
  }
}
