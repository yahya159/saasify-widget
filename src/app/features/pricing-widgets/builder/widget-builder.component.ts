import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WidgetStoreService } from '../state/widget-store.service';
import { TemplateGalleryComponent } from './sidebar/template-gallery.component';
import { PaletteComponent } from './sidebar/palette.component';
import { PropertiesPanelComponent } from './sidebar/properties-panel.component';
import { CanvasComponent } from './canvas/canvas.component';
import { LivePreviewComponent } from '../preview/live-preview.component';
import { ExportModalComponent } from '../export/export-modal.component';
import { ThemeSwitcherComponent } from '../../../shared/components/theme-switcher.component';

@Component({
  selector: 'app-widget-builder',
  templateUrl: './widget-builder.component.html',
  styleUrls: ['./widget-builder.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    TemplateGalleryComponent,
    PaletteComponent,
    PropertiesPanelComponent,
    CanvasComponent,
    LivePreviewComponent,
    ExportModalComponent,
    ThemeSwitcherComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class WidgetBuilderComponent {
  private widgetStore = inject(WidgetStoreService);

  widgets = this.widgetStore.widgets;
  selectedWidget = this.widgetStore.selectedWidget;
  showPreview = signal(false);
  showExportModal = signal(false);

  createNewWidget(): void {
    this.widgetStore.createBlankWidget();
  }

  selectWidget(widgetId: string): void {
    this.widgetStore.selectWidget(widgetId);
  }

  deleteWidget(): void {
    const widget = this.selectedWidget();
    if (!widget) return;

    if (confirm(`Are you sure you want to delete "${widget.name}"? This action cannot be undone.`)) {
      const success = this.widgetStore.deleteWidget(widget.id);
      if (success) {
        console.log('Widget deleted successfully');
      } else {
        alert('Failed to delete widget');
      }
    }
  }

  editWidgetName(): void {
    const widget = this.selectedWidget();
    if (!widget) return;

    const newName = prompt('Enter new widget name:', widget.name);
    if (newName && newName.trim() && newName !== widget.name) {
      this.widgetStore.updateWidgetName(widget.id, newName.trim());
    }
  }

  togglePreview(): void {
    this.showPreview.update(show => !show);
  }

  openExportModal(): void {
    this.showExportModal.set(true);
  }

  closeExportModal(): void {
    this.showExportModal.set(false);
  }

  onWidgetSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectWidget(target.value);
  }
}
