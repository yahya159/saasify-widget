import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockApiService } from '../../core/services/mock-api.service';

@Component({
  selector: 'app-pricing-widget-builder',
  templateUrl: './pricing-widget-builder.component.html',
  styleUrls: ['./pricing-widget-builder.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class PricingWidgetBuilderComponent {
  mockApi = inject(MockApiService);

  createWidget(templateId: string): void {
    const template = this.mockApi.getTemplate(templateId);
    if (template) {
      this.mockApi.addWidget({
        name: `Widget from ${template.name}`,
        templateId: template.id,
        columns: template.columns,
        style: template.style,
        attachedPlanId: 'plan-1'
      });
    }
  }

  editWidget(widgetId: string): void {
    console.log('Edit widget:', widgetId);
    // TODO: Implement edit functionality
  }

  deleteWidget(widgetId: string): void {
    this.mockApi.deleteWidget(widgetId);
  }

  getTemplateName(templateId: string): string {
    const template = this.mockApi.getTemplate(templateId);
    return template?.name || 'Unknown';
  }
}