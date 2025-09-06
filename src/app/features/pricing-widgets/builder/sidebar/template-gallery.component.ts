import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetStoreService } from '../../state/widget-store.service';
import { TemplateThumbnailComponent } from './template-thumbnail.component';

@Component({
  selector: 'app-template-gallery',
  templateUrl: './template-gallery.component.html',
  styleUrls: ['./template-gallery.component.css'],
  imports: [CommonModule, TemplateThumbnailComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class TemplateGalleryComponent {
  private widgetStore = inject(WidgetStoreService);

  templates = this.widgetStore.templates;

  createFromTemplate(templateId: string): void {
    this.widgetStore.createWidgetFromTemplate(templateId);
  }

  createBlankWidget(): void {
    this.widgetStore.createBlankWidget();
  }

  getBlockPreviewText(blockType: string): string {
    const previews: Record<string, string> = {
      'price-card': '$99',
      'feature-list': 'Features',
      'headline': 'Title',
      'subtext': 'Text',
      'badge': 'Badge',
      'divider': '—'
    };
    return previews[blockType] || 'Block';
  }

  getTemplateDescription(template: { columns: { blocks: unknown[] }[] }): string {
    const columnCount = template.columns.length;
    const blockCount = template.columns.reduce((total: number, col) => total + col.blocks.length, 0);
    return `${columnCount} columns, ${blockCount} blocks`;
  }

  getTemplateType(templateName: string): string {
    const typeMap: Record<string, string> = {
      '3-column classic': '3-column-classic',
      '2-column spotlight': '2-column-spotlight',
      'Comparison matrix': 'comparison-matrix'
    };
    return typeMap[templateName] || 'default';
  }

  getTemplateImage(templateName: string): string {
    const imageMap: Record<string, string> = {
      '3-column classic': 'assets/images/templates/3-column-classic.jpg',
      '2-column spotlight': 'assets/images/templates/2-column-spotlight.jpg',
      'Comparison matrix': 'assets/images/templates/comparison-matrix.jpg'
    };
    return imageMap[templateName] || 'assets/images/templates/default.jpg';
  }
}
