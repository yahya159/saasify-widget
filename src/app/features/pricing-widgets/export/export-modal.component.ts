import { Component, ChangeDetectionStrategy, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetStoreService } from '../state/widget-store.service';

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-modal.component.html',
  styleUrls: ['./export-modal.component.css'],
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ExportModalComponent {
  closeModal = output<void>();

  private widgetStore = inject(WidgetStoreService);

  selectedWidget = this.widgetStore.selectedWidget;
  activeTab = signal<'html' | 'json'>('html');
  showToast = signal(false);
  toastMessage = signal('');

  exportHtml(): string {
    const widget = this.selectedWidget();
    if (!widget) return '';
    return this.widgetStore.exportHtml(widget.id);
  }

  exportJson(): string {
    const widget = this.selectedWidget();
    if (!widget) return '';
    const jsonData = this.widgetStore.exportJson(widget.id);
    return JSON.stringify(jsonData, null, 2);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.showSuccessToast('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      this.showSuccessToast('Failed to copy to clipboard');
    });
  }

  copyHtml(): void {
    const html = this.exportHtml();
    this.copyToClipboard(html);
  }

  copyJson(): void {
    const json = this.exportJson();
    this.copyToClipboard(json);
  }

  private showSuccessToast(message: string): void {
    this.toastMessage.set(message);
    this.showToast.set(true);
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      this.showToast.set(false);
    }, 3000);
  }

  downloadJson(): void {
    const widget = this.selectedWidget();
    if (!widget) return;

    const jsonData = this.exportJson();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widget.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  setActiveTab(tab: 'html' | 'json'): void {
    this.activeTab.set(tab);
  }

  onCloseModal(): void {
    this.closeModal.emit();
  }
}
