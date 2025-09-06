import { Injectable, signal, computed, inject } from '@angular/core';
import { MockApiService } from '../../../core/services/mock-api.service';
import { 
  WidgetInstance, 
  WidgetColumn, 
  WidgetBlock, 
  WidgetBlockType, 
  Plan
} from '../../../core/models/pricing.models';

@Injectable({
  providedIn: 'root'
})
export class WidgetStoreService {
  private mockApi = inject(MockApiService);
  
  // Signals
  readonly widgets = computed(() => this.mockApi.widgets());
  readonly templates = computed(() => this.mockApi.templates());
  readonly plans = computed(() => this.mockApi.plans());
  readonly features = computed(() => this.mockApi.features());
  
  readonly selectedWidgetId = signal<string | null>(null);
  readonly selectedBlockId = signal<string | null>(null);

  // Computed
  readonly selectedWidget = computed(() => {
    const widgetId = this.selectedWidgetId();
    if (!widgetId) return null;
    return this.widgets().find(widget => widget.id === widgetId) || null;
  });

  readonly selectedBlock = computed(() => {
    const widget = this.selectedWidget();
    const blockId = this.selectedBlockId();
    if (!widget || !blockId) return null;

    for (const column of widget.columns) {
      const block = column.blocks.find(b => b.id === blockId);
      if (block) return { block, column };
    }
    return null;
  });

  readonly attachedPlan = computed(() => {
    const widget = this.selectedWidget();
    if (!widget || !widget.attachedPlanId) return null;
    return this.plans().find(plan => plan.id === widget.attachedPlanId) || null;
  });

  // Actions
  createWidgetFromTemplate(templateId: string): WidgetInstance {
    const template = this.templates().find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const newWidget: Omit<WidgetInstance, 'id'> = {
      name: `Widget from ${template.name}`,
      templateId: template.id,
      columns: template.columns.map(col => ({
        ...col,
        id: this.generateId(),
        blocks: col.blocks.map(block => ({
          ...block,
          id: this.generateId()
        }))
      })),
      style: { ...template.style }
    };

    const widget = this.mockApi.addWidget(newWidget);
    this.selectedWidgetId.set(widget.id);
    return widget;
  }

  createBlankWidget(): WidgetInstance {
    const newWidget: Omit<WidgetInstance, 'id'> = {
      name: 'New Widget',
      templateId: '',
      columns: [
        {
          id: this.generateId(),
          order: 0,
          blocks: [],
          widthFraction: 12 // Full width by default
        }
      ],
      style: {
        gap: 16,
        background: '#ffffff',
        maxWidth: 1200
      }
    };

    const widget = this.mockApi.addWidget(newWidget);
    this.selectedWidgetId.set(widget.id);
    return widget;
  }

  attachPlan(widgetId: string, planId: string): void {
    this.mockApi.updateWidget(widgetId, { attachedPlanId: planId });
  }

  addBlockToColumn(widgetId: string, columnId: string, blockType: WidgetBlockType): WidgetBlock {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) throw new Error('Widget not found');

    const column = widget.columns.find(col => col.id === columnId);
    if (!column) throw new Error('Column not found');

    const newBlock: WidgetBlock = {
      id: this.generateId(),
      type: blockType,
      text: this.getDefaultText(blockType),
      order: column.blocks.length,
      style: this.getDefaultStyle(blockType)
    };

    const updatedBlocks = [...column.blocks, newBlock];
    const updatedColumns = widget.columns.map(col =>
      col.id === columnId ? { ...col, blocks: updatedBlocks } : col
    );

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
    this.selectedBlockId.set(newBlock.id);
    return newBlock;
  }

  reorderBlocks(widgetId: string, columnId: string, newOrder: WidgetBlock[]): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col =>
      col.id === columnId ? { ...col, blocks: newOrder } : col
    );

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  moveBlockAcrossColumns(
    widgetId: string, 
    fromColumnId: string, 
    toColumnId: string, 
    blockId: string, 
    toIndex: number
  ): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const fromColumn = widget.columns.find(col => col.id === fromColumnId);
    const toColumn = widget.columns.find(col => col.id === toColumnId);
    
    if (!fromColumn || !toColumn) return;

    const block = fromColumn.blocks.find(b => b.id === blockId);
    if (!block) return;

    // Remove from source column
    const updatedFromBlocks = fromColumn.blocks.filter(b => b.id !== blockId);
    
    // Add to target column
    const updatedToBlocks = [...toColumn.blocks];
    updatedToBlocks.splice(toIndex, 0, { ...block, order: toIndex });

    // Update order for all blocks in target column
    const reorderedToBlocks = updatedToBlocks.map((b, index) => ({ ...b, order: index }));

    const updatedColumns = widget.columns.map(col => {
      if (col.id === fromColumnId) {
        return { ...col, blocks: updatedFromBlocks.map((b, index) => ({ ...b, order: index })) };
      }
      if (col.id === toColumnId) {
        return { ...col, blocks: reorderedToBlocks };
      }
      return col;
    });

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  updateBlockStyle(widgetId: string, blockId: string, partialStyle: Partial<WidgetBlock['style']>): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col => ({
      ...col,
      blocks: col.blocks.map(block =>
        block.id === blockId 
          ? { ...block, style: { ...block.style, ...partialStyle } }
          : block
      )
    }));

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  updateBlockText(widgetId: string, blockId: string, text: string): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col => ({
      ...col,
      blocks: col.blocks.map(block =>
        block.id === blockId ? { ...block, text } : block
      )
    }));

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  setColumnWidth(widgetId: string, columnId: string, widthFraction: WidgetColumn['widthFraction']): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col =>
      col.id === columnId ? { ...col, widthFraction } : col
    );

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  addColumn(widgetId: string): WidgetColumn {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) throw new Error('Widget not found');

    const newColumn: WidgetColumn = {
      id: this.generateId(),
      order: widget.columns.length,
      blocks: [],
      widthFraction: 4 // Default to 4/12 (1/3 width)
    };

    const updatedColumns = [...widget.columns, newColumn];
    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
    
    return newColumn;
  }

  deleteColumn(widgetId: string, columnId: string): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns
      .filter(col => col.id !== columnId)
      .map((col, index) => ({ ...col, order: index })); // Reorder remaining columns

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
  }

  selectWidget(widgetId: string | null): void {
    this.selectedWidgetId.set(widgetId);
    this.selectedBlockId.set(null);
  }

  deleteWidget(widgetId: string): boolean {
    const success = this.mockApi.deleteWidget(widgetId);
    if (success && this.selectedWidgetId() === widgetId) {
      this.selectedWidgetId.set(null);
      this.selectedBlockId.set(null);
    }
    return success;
  }

  updateWidgetName(widgetId: string, name: string): void {
    this.mockApi.updateWidget(widgetId, { name });
  }

  selectBlock(blockId: string | null): void {
    this.selectedBlockId.set(blockId);
  }

  deleteBlock(widgetId: string, blockId: string): void {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return;

    const updatedColumns = widget.columns.map(col => ({
      ...col,
      blocks: col.blocks.filter(block => block.id !== blockId)
    }));

    this.mockApi.updateWidget(widgetId, { columns: updatedColumns });
    
    if (this.selectedBlockId() === blockId) {
      this.selectedBlockId.set(null);
    }
  }

  exportHtml(widgetId: string): string {
    const widget = this.mockApi.getWidget(widgetId);
    if (!widget) return '';

    const plan = widget.attachedPlanId ? this.plans().find(p => p.id === widget.attachedPlanId) : null;
    
    // Framework-agnostic, semantic HTML structure
    let html = `<!-- Pricing Widget - Framework Agnostic HTML Export -->\n`;
    html += `<section class="pricing-widget" role="region" aria-label="Pricing">\n`;
    
    // Optional background wrapper
    if (widget.style?.background) {
      html += `  <div style="background: ${widget.style.background}; padding: 20px;">\n`;
    }
    
    // Main container with responsive max-width
    html += `    <div class="pricing-container" style="max-width: ${widget.style?.maxWidth || 1200}px; margin: 0 auto; padding: 0 16px;">\n`;
    
    // Grid layout for columns
    html += `      <div class="pricing-columns" style="display: grid; grid-template-columns: repeat(${widget.columns.length}, 1fr); gap: ${widget.style?.gap || 24}px; align-items: start;">\n`;

    for (const column of widget.columns) {
      html += `        <div class="pricing-column" role="listitem" aria-label="Pricing column">\n`;
      
      for (const block of column.blocks.sort((a, b) => a.order - b.order)) {
        html += this.renderBlockHtml(block, plan || null);
      }
      
      html += `        </div>\n`;
    }
    
    html += `      </div>\n`;
    html += `    </div>\n`;
    
    if (widget.style?.background) {
      html += `  </div>\n`;
    }
    
    html += `</section>\n`;
    html += `<!-- End Pricing Widget -->`;
    
    return html;
  }

  exportJson(widgetId: string): WidgetInstance | null {
    return this.mockApi.getWidget(widgetId) || null;
  }

  updateWidget(widgetId: string, updates: Partial<WidgetInstance>): WidgetInstance | undefined {
    return this.mockApi.updateWidget(widgetId, updates);
  }

  private renderBlockHtml(block: WidgetBlock, plan: Plan | null): string {
    const style = this.buildInlineStyle(block.style);
    
    switch (block.type) {
      case 'price-card':
        return this.renderPriceCardHtml(block, plan, style);
      case 'feature-list':
        return this.renderFeatureListHtml(block, plan, style);
      case 'headline':
        return `          <h2 class="pricing-headline" style="${style}">${block.text || 'Your Headline'}</h2>\n`;
      case 'subtext':
        return `          <p class="pricing-subtext" style="${style}">${block.text || 'Your subtext here'}</p>\n`;
      case 'badge':
        return `          <span class="pricing-badge" style="${style}">${block.text || 'Badge'}</span>\n`;
      case 'divider':
        return `          <hr class="pricing-divider" style="${style}">\n`;
      default:
        return `          <div class="pricing-block" style="${style}">${block.text || ''}</div>\n`;
    }
  }

  private renderPriceCardHtml(block: WidgetBlock, plan: Plan | null, style: string): string {
    if (!plan || !block.planTierId) {
      return `          <article class="pricing-card" style="${style}">
            <p>No plan attached</p>
          </article>\n`;
    }

    const tier = plan.tiers.find(t => t.id === block.planTierId);
    if (!tier) {
      return `          <article class="pricing-card" style="${style}">
            <p>Tier not found</p>
          </article>\n`;
    }

    const highlightClass = tier.highlight ? 'pricing-card--highlighted' : '';
    const price = tier.monthlyPrice;
    const currency = tier.currency;
    const currencySymbol = currency === 'USD' ? '$' : currency;

    return `          <article class="pricing-card ${highlightClass}" style="${style}">
            <header class="pricing-card__header">
              <h3 class="pricing-card__title">${tier.name}</h3>
              ${tier.highlight ? '<span class="pricing-badge">Popular</span>' : ''}
            </header>
            <div class="pricing-card__price">
              <span class="pricing-card__amount">${currencySymbol}${price}</span>
              <span class="pricing-card__period">/month</span>
            </div>
            <div class="pricing-card__features">
              <ul class="pricing-features">
                ${tier.features.map(featureKey => {
                  const feature = this.features().find(f => f.key === featureKey);
                  return `<li class="pricing-feature">${feature ? feature.name : featureKey}</li>`;
                }).join('\n                ')}
              </ul>
            </div>
            <footer class="pricing-card__footer">
              <button class="pricing-button pricing-button--primary" type="button">
                ${tier.ctaLabel || 'Get Started'}
              </button>
            </footer>
          </article>\n`;
  }

  private renderFeatureListHtml(block: WidgetBlock, plan: Plan | null, style: string): string {
    if (!plan || !block.planTierId) {
      return `          <div class="pricing-feature-list" style="${style}">
            <p>No plan attached</p>
          </div>\n`;
    }

    const tier = plan.tiers.find(t => t.id === block.planTierId);
    if (!tier) {
      return `          <div class="pricing-feature-list" style="${style}">
            <p>Tier not found</p>
          </div>\n`;
    }

    const features = tier.features.map(featureKey => {
      const feature = this.features().find(f => f.key === featureKey);
      return feature ? feature.name : featureKey;
    });

    const featureList = features.map(feature => `              <li class="pricing-feature">${feature}</li>`).join('\n');
    
    return `          <div class="pricing-feature-list" style="${style}">
            <h4 class="pricing-feature-list__title">Features</h4>
            <ul class="pricing-features">
${featureList}
            </ul>
          </div>\n`;
  }

  private buildInlineStyle(style?: WidgetBlock['style']): string {
    if (!style) return '';
    
    const styles: string[] = [];
    
    if (style.width) styles.push(`width: ${style.width}px`);
    if (style.textAlign) styles.push(`text-align: ${style.textAlign}`);
    if (style.radius) styles.push(`border-radius: ${style.radius}px`);
    if (style.padding) styles.push(`padding: ${style.padding}px`);
    if (style.elevation) styles.push(`box-shadow: 0 ${style.elevation * 2}px ${style.elevation * 4}px rgba(0,0,0,0.1)`);
    
    return styles.join('; ');
  }

  private getDefaultText(blockType: WidgetBlockType): string {
    const defaults: Record<WidgetBlockType, string> = {
      'price-card': 'Price Card',
      'feature-list': 'Features',
      'headline': 'Your Headline',
      'subtext': 'Your subtext here',
      'badge': 'Popular',
      'divider': ''
    };
    return defaults[blockType];
  }

  private getDefaultStyle(blockType: WidgetBlockType): WidgetBlock['style'] {
    const defaults: Record<WidgetBlockType, WidgetBlock['style']> = {
      'price-card': { padding: 20, radius: 8, elevation: 1, textAlign: 'center' },
      'feature-list': { padding: 16, textAlign: 'left' },
      'headline': { textAlign: 'center', padding: 8 },
      'subtext': { textAlign: 'center', padding: 8 },
      'badge': { padding: 4, radius: 4, textAlign: 'center' },
      'divider': { padding: 8 }
    };
    return defaults[blockType];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
