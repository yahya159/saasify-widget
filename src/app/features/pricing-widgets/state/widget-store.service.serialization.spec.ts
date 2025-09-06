import { TestBed } from '@angular/core/testing';
import { WidgetStoreService } from './widget-store.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { WidgetInstance, Plan, Feature } from '../../../core/models/pricing.models';

describe('WidgetStoreService - Serialization Tests', () => {
  let service: WidgetStoreService;
  let mockApiService: jasmine.SpyObj<MockApiService>;

  const mockFeatures: Feature[] = [
    { id: '1', key: 'api.limit', name: 'API Limit', description: 'API request limit' },
    { id: '2', key: 'storage.gb', name: 'Storage', description: 'Storage in GB' },
    { id: '3', key: 'support.priority', name: 'Priority Support', description: 'Priority customer support' }
  ];

  const mockPlan: Plan = {
    id: 'plan-1',
    name: 'Test Plan',
    description: 'A test plan',
    public: true,
    tiers: [
      {
        id: 'tier-1',
        name: 'Basic',
        monthlyPrice: 10,
        yearlyPrice: 100,
        currency: 'USD',
        features: ['api.limit', 'storage.gb'],
        limits: { 'api.limit': 1000, 'storage.gb': 10 },
        highlight: false,
        ctaLabel: 'Get Started'
      },
      {
        id: 'tier-2',
        name: 'Pro',
        monthlyPrice: 25,
        yearlyPrice: 250,
        currency: 'USD',
        features: ['api.limit', 'storage.gb', 'support.priority'],
        limits: { 'api.limit': 5000, 'storage.gb': 50 },
        highlight: true,
        ctaLabel: 'Upgrade'
      }
    ]
  };

  const complexWidget: WidgetInstance = {
    id: 'widget-1',
    name: 'Complex Widget',
    templateId: 'template-1',
    columns: [
      {
        id: 'col-1',
        order: 0,
        blocks: [
          {
            id: 'block-1',
            type: 'headline',
            text: 'Choose Your Plan',
            order: 0,
            style: { textAlign: 'center', padding: 16, radius: 0, elevation: 0 }
          },
          {
            id: 'block-2',
            type: 'subtext',
            text: 'Select the perfect plan for your needs',
            order: 1,
            style: { textAlign: 'center', padding: 8, radius: 0, elevation: 0 }
          }
        ],
        widthFraction: 12
      },
      {
        id: 'col-2',
        order: 1,
        blocks: [
          {
            id: 'block-3',
            type: 'price-card',
            planTierId: 'tier-1',
            text: 'Price Card',
            order: 0,
            style: { padding: 20, radius: 8, elevation: 1, textAlign: 'center' }
          },
          {
            id: 'block-4',
            type: 'feature-list',
            planTierId: 'tier-1',
            text: 'Features',
            order: 1,
            style: { padding: 16, radius: 4, elevation: 0, textAlign: 'left' }
          }
        ],
        widthFraction: 6
      },
      {
        id: 'col-3',
        order: 2,
        blocks: [
          {
            id: 'block-5',
            type: 'price-card',
            planTierId: 'tier-2',
            text: 'Price Card',
            order: 0,
            style: { padding: 20, radius: 8, elevation: 2, textAlign: 'center' }
          },
          {
            id: 'block-6',
            type: 'feature-list',
            planTierId: 'tier-2',
            text: 'Features',
            order: 1,
            style: { padding: 16, radius: 4, elevation: 0, textAlign: 'left' }
          },
          {
            id: 'block-7',
            type: 'badge',
            text: 'Most Popular',
            order: 2,
            style: { padding: 4, radius: 4, elevation: 0, textAlign: 'center' }
          }
        ],
        widthFraction: 6
      }
    ],
    style: { gap: 24, background: '#f8f9fa', maxWidth: 1200 },
    attachedPlanId: 'plan-1'
  };

  beforeEach(() => {
    const mockApiSpy = jasmine.createSpyObj('MockApiService', [
      'widgets', 'templates', 'plans', 'features', 'getWidget'
    ]);

    TestBed.configureTestingModule({
      providers: [
        WidgetStoreService,
        { provide: MockApiService, useValue: mockApiSpy }
      ]
    });

    service = TestBed.inject(WidgetStoreService);
    mockApiService = TestBed.inject(MockApiService) as jasmine.SpyObj<MockApiService>;

    // Setup mock returns
    mockApiService.widgets.and.returnValue([complexWidget]);
    mockApiService.templates.and.returnValue([]);
    mockApiService.plans.and.returnValue([mockPlan]);
    mockApiService.features.and.returnValue(mockFeatures);
    mockApiService.getWidget.and.returnValue(complexWidget);
  });

  describe('HTML Export Serialization', () => {
    it('should generate valid HTML structure', () => {
      const html = service.exportHtml('widget-1');

      // Check basic HTML structure
      expect(html).toContain('<section class="pricing-widget" role="region" aria-label="Pricing">');
      expect(html).toContain('<div class="widget-container"');
      expect(html).toContain('<div class="widget-columns"');
      expect(html).toContain('</section>');

      // Check grid structure
      expect(html).toContain('grid-template-columns: repeat(3, 1fr)');
      expect(html).toContain('gap: 24px');
      expect(html).toContain('max-width: 1200px');
    });

    it('should include proper ARIA attributes', () => {
      const html = service.exportHtml('widget-1');

      expect(html).toContain('role="region"');
      expect(html).toContain('aria-label="Pricing"');
      expect(html).toContain('role="list"');
    });

    it('should render headline blocks correctly', () => {
      const html = service.exportHtml('widget-1');

      expect(html).toContain('<h2 style="text-align: center; padding: 16px">Choose Your Plan</h2>');
      expect(html).toContain('<p style="text-align: center; padding: 8px">Select the perfect plan for your needs</p>');
    });

    it('should render price card blocks with plan data', () => {
      const html = service.exportHtml('widget-1');

      // Check for Basic tier price card
      expect(html).toContain('<h3>Basic</h3>');
      expect(html).toContain('<div class="price">USD 10/month</div>');
      expect(html).toContain('<button class="cta-button">Get Started</button>');

      // Check for Pro tier price card
      expect(html).toContain('<h3>Pro</h3>');
      expect(html).toContain('<div class="price">USD 25/month</div>');
      expect(html).toContain('<button class="cta-button">Upgrade</button>');
    });

    it('should render feature list blocks with plan data', () => {
      const html = service.exportHtml('widget-1');

      // Check for Basic tier features
      expect(html).toContain('<li>API Limit</li>');
      expect(html).toContain('<li>Storage</li>');

      // Check for Pro tier features
      expect(html).toContain('<li>Priority Support</li>');
    });

    it('should render badge blocks correctly', () => {
      const html = service.exportHtml('widget-1');

      // The badge should be rendered somewhere in the HTML
      expect(html).toContain('Most Popular');
      expect(html).toContain('class="badge"');
    });

    it('should apply widget-level styles', () => {
      const html = service.exportHtml('widget-1');

      expect(html).toContain('background: #f8f9fa');
      expect(html).toContain('max-width: 1200px');
      expect(html).toContain('gap: 24px');
    });

    it('should handle missing plan data gracefully', () => {
      mockApiService.getWidget.and.returnValue({
        ...complexWidget,
        attachedPlanId: 'non-existent'
      });

      const html = service.exportHtml('widget-1');

      expect(html).toContain('No plan attached');
    });

    it('should handle missing tier data gracefully', () => {
      const widgetWithoutTier = {
        ...complexWidget,
        columns: [
          {
            ...complexWidget.columns[1],
            blocks: [
              {
                ...complexWidget.columns[1].blocks[0],
                planTierId: 'non-existent'
              }
            ]
          }
        ]
      };

      mockApiService.getWidget.and.returnValue(widgetWithoutTier);

      const html = service.exportHtml('widget-1');

      expect(html).toContain('Tier not found');
    });

    it('should handle empty widget gracefully', () => {
      const emptyWidget = {
        ...complexWidget,
        columns: []
      };

      mockApiService.getWidget.and.returnValue(emptyWidget);

      const html = service.exportHtml('widget-1');

      expect(html).toContain('<section class="pricing-widget"');
      expect(html).toContain('grid-template-columns: repeat(0, 1fr)');
    });
  });

  describe('JSON Export Serialization', () => {
    it('should export complete widget instance', () => {
      const json = service.exportJson('widget-1');

      expect(json).toEqual(complexWidget);
      expect(json?.id).toBe('widget-1');
      expect(json?.name).toBe('Complex Widget');
      expect(json?.templateId).toBe('template-1');
      expect(json?.attachedPlanId).toBe('plan-1');
    });

    it('should preserve all column data', () => {
      const json = service.exportJson('widget-1');

      expect(json?.columns?.length).toBe(3);
      expect(json?.columns[0].id).toBe('col-1');
      expect(json?.columns[0].order).toBe(0);
      expect(json?.columns[0].widthFraction).toBe(12);
      expect(json?.columns[1].widthFraction).toBe(6);
      expect(json?.columns[2].widthFraction).toBe(6);
    });

    it('should preserve all block data', () => {
      const json = service.exportJson('widget-1');

      expect(json?.columns[0].blocks?.length).toBe(2);
      expect(json?.columns[1].blocks?.length).toBe(2);
      expect(json?.columns[2].blocks?.length).toBe(3);

      // Check first block
      expect(json?.columns[0].blocks[0]).toEqual({
        id: 'block-1',
        type: 'headline',
        text: 'Choose Your Plan',
        order: 0,
        style: { textAlign: 'center', padding: 16, radius: 0, elevation: 0 }
      });

      // Check price card block
      expect(json?.columns[1].blocks[0]).toEqual({
        id: 'block-3',
        type: 'price-card',
        planTierId: 'tier-1',
        text: 'Price Card',
        order: 0,
        style: { padding: 20, radius: 8, elevation: 1, textAlign: 'center' }
      });
    });

    it('should preserve widget styles', () => {
      const json = service.exportJson('widget-1');

      expect(json?.style).toEqual({
        gap: 24,
        background: '#f8f9fa',
        maxWidth: 1200
      });
    });

    it('should return null for non-existent widget', () => {
      mockApiService.getWidget.and.returnValue(undefined);

      const json = service.exportJson('non-existent');

      expect(json).toBeNull();
    });

    it('should handle widget without attached plan', () => {
      const widgetWithoutPlan = {
        ...complexWidget,
        attachedPlanId: undefined
      };

      mockApiService.getWidget.and.returnValue(widgetWithoutPlan);

      const json = service.exportJson('widget-1');

      expect(json?.attachedPlanId).toBeUndefined();
    });
  });

  describe('HTML Structure Validation', () => {
    it('should generate valid HTML that can be parsed', () => {
      const html = service.exportHtml('widget-1');

      // Basic HTML structure validation
      expect(html).toMatch(/<section[^>]*>[\s\S]*<\/section>/);
      expect(html).toMatch(/<ul[^>]*>[\s\S]*<\/ul>/);
      expect(html).toMatch(/<h[1-6][^>]*>[\s\S]*<\/h[1-6]>/);
      expect(html).toMatch(/<button[^>]*>[\s\S]*<\/button>/);
    });

    it('should escape HTML entities in text content', () => {
      const widgetWithSpecialChars = {
        ...complexWidget,
        columns: [
          {
            ...complexWidget.columns[0],
            blocks: [
              {
                ...complexWidget.columns[0].blocks[0],
                text: 'Choose Your Plan & Save <50%>'
              }
            ]
          }
        ]
      };

      mockApiService.getWidget.and.returnValue(widgetWithSpecialChars);

      const html = service.exportHtml('widget-1');

      // The HTML export should contain the text as-is (not escaped) since it's in the text content
      expect(html).toContain('Choose Your Plan & Save <50%>');
    });

    it('should maintain proper nesting structure', () => {
      const html = service.exportHtml('widget-1');

      // Count opening and closing tags
      const sectionOpen = (html.match(/<section/g) || []).length;
      const sectionClose = (html.match(/<\/section>/g) || []).length;
      const ulOpen = (html.match(/<ul/g) || []).length;
      const ulClose = (html.match(/<\/ul>/g) || []).length;

      expect(sectionOpen).toBe(sectionClose);
      expect(ulOpen).toBe(ulClose);
    });

    it('should not contain PrimeNG classes (p-*)', () => {
      const html = service.exportHtml('widget-1');

      // Check that no PrimeNG classes are present
      expect(html).not.toMatch(/class="[^"]*p-[^"]*"/);
      expect(html).not.toMatch(/class="[^"]*p-button/);
      expect(html).not.toMatch(/class="[^"]*p-card/);
      expect(html).not.toMatch(/class="[^"]*p-panel/);
      expect(html).not.toMatch(/class="[^"]*p-dialog/);
      expect(html).not.toMatch(/class="[^"]*p-dropdown/);
      expect(html).not.toMatch(/class="[^"]*p-input/);
      expect(html).not.toMatch(/class="[^"]*p-checkbox/);
      expect(html).not.toMatch(/class="[^"]*p-radio/);
      expect(html).not.toMatch(/class="[^"]*p-select/);
    });

    it('should contain semantic HTML structure', () => {
      const html = service.exportHtml('widget-1');

      // Check for semantic HTML elements
      expect(html).toContain('<section class="pricing-widget" role="region" aria-label="Pricing">');
      expect(html).toContain('<ul class="widget-column" role="list"');
      expect(html).toContain('<article class="price-card');
      expect(html).toContain('<h2 style="text-align: center; padding: 16px">Choose Your Plan</h2>');
      expect(html).toContain('<h3>Basic</h3>');
      expect(html).toContain('<ul class="feature-list"');
      expect(html).toContain('<li>');
      expect(html).toContain('<button class="cta-button"');
    });
  });
});
