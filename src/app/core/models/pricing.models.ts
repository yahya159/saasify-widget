export type CurrencyCode = 'USD' | 'EUR' | 'MAD';

export interface Feature {
  id: string;
  key: string;             // e.g., "api.limit", "branding.remove"
  name: string;            // UI label
  description?: string;
  enabledByDefault?: boolean;
}

export interface PlanTier {
  id: string;
  name: string;            // "Basic" | "Pro" | "Enterprise"
  monthlyPrice: number;
  yearlyPrice?: number;
  currency: CurrencyCode;
  features: string[];      // Feature.key[]
  limits?: Record<string, number | string>;
  highlight?: boolean;
  ctaLabel?: string;       // "Get started"
}

export interface Plan {
  id: string;
  name: string;            // "Starter Suite"
  description?: string;
  tiers: PlanTier[];
  public?: boolean;
}

export type WidgetBlockType = 'price-card' | 'feature-list' | 'headline' | 'subtext' | 'badge' | 'divider';

export interface WidgetBlock {
  id: string;
  type: WidgetBlockType;
  planTierId?: string;     // for price-card
  text?: string;           // for headline/subtext/badge
  style?: {
    width?: number;
    textAlign?: 'left' | 'center' | 'right';
    radius?: number;
    padding?: number;
    elevation?: 0 | 1 | 2 | 3;
  };
  order: number;           // index in column
}

export interface WidgetColumn {
  id: string;
  order: number;
  blocks: WidgetBlock[];
  widthFraction: 1 | 2 | 3 | 4 | 6 | 12; // 12-grid helper
}

export interface WidgetTemplate {
  id: string;
  name: string;            // "3-column classic"
  columns: WidgetColumn[];
  style?: {
    gap?: number;
    background?: string;
    maxWidth?: number;     // px
  };
}

export interface WidgetInstance {
  id: string;
  name: string;
  templateId: string;
  columns: WidgetColumn[];
  style?: WidgetTemplate['style'];
  attachedPlanId?: string; // plan that supplies tiers/features
}

export interface Catalog {
  features: Feature[];
  plans: Plan[];
  templates: WidgetTemplate[];
  widgets: WidgetInstance[];
}
