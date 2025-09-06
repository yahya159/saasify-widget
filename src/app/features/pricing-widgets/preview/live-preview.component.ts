import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WidgetStoreService } from '../state/widget-store.service';
import { PriceCardComponent } from '../builder/canvas/price-card.component';
import { FeatureListComponent } from '../builder/canvas/feature-list.component';
import { WidgetBlock } from '../../../core/models/pricing.models';
import { ThemeService } from '../../../core/services/theme.service';
import { ObjectToStylePipe } from '../../../shared/pipes/object-to-style.pipe';

@Component({
  selector: 'app-live-preview',
  templateUrl: './live-preview.component.html',
  styleUrls: ['./live-preview.component.css'],
  imports: [CommonModule, PriceCardComponent, FeatureListComponent, ObjectToStylePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class LivePreviewComponent {
  private widgetStore = inject(WidgetStoreService);
  themeService = inject(ThemeService);

  selectedWidget = this.widgetStore.selectedWidget;
  attachedPlan = this.widgetStore.attachedPlan;
  theme = this.themeService.theme;
  cssVariables = this.themeService.cssVariables;

  getWidgetStyle(): Record<string, string> {
    const widget = this.selectedWidget();
    const theme = this.theme();
    if (!widget) return {};
    
    const style: Record<string, string> = {};
    
    if (widget.style?.background) {
      style['background'] = theme.isDarkMode ? '#1a1a1a' : widget.style.background;
    }
    if (widget.style?.maxWidth) style['maxWidth'] = `${widget.style.maxWidth}px`;
    if (widget.style?.gap) style['gap'] = `${widget.style.gap}px`;
    
    return style;
  }

  getColumnStyle(column: { widthFraction: number }): Record<string, string> {
    const style: Record<string, string> = {};
    
    if (column.widthFraction) {
      const fraction = column.widthFraction / 12;
      style['flex'] = `${fraction} 1 0`;
    }
    
    return style;
  }

  getBlockStyle(block: { style?: { width?: number; textAlign?: string; radius?: number; padding?: number; elevation?: number } }): Record<string, string> {
    const style: Record<string, string> = {};
    
    if (block.style?.width) style['width'] = `${block.style.width}px`;
    if (block.style?.textAlign) style['textAlign'] = block.style.textAlign;
    if (block.style?.radius) style['borderRadius'] = `${block.style.radius}px`;
    if (block.style?.padding) style['padding'] = `${block.style.padding}px`;
    if (block.style?.elevation) {
      const elevation = block.style.elevation;
      style['boxShadow'] = `0 ${elevation * 2}px ${elevation * 4}px rgba(0,0,0,0.1)`;
    }
    
    return style;
  }

  getSortedBlocks(blocks: WidgetBlock[]): WidgetBlock[] {
    return blocks.sort((a, b) => a.order - b.order);
  }
}
