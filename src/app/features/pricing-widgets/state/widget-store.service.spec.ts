import { TestBed } from '@angular/core/testing';
import { WidgetStoreService } from './widget-store.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { WidgetInstance, WidgetTemplate, Plan, Feature } from '../../../core/models/pricing.models';

describe('WidgetStoreService', () => {
  let service: WidgetStoreService;
  let mockApiService: jasmine.SpyObj<MockApiService>;

  const mockFeatures: Feature[] = [
    { id: '1', key: 'api.limit', name: 'API Limit', description: 'API request limit' },
    { id: '2', key: 'storage.gb', name: 'Storage', description: 'Storage in GB' }
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
        currency: 'USD',
        features: ['api.limit', 'storage.gb'],
        limits: { 'api.limit': 1000, 'storage.gb': 10 },
        highlight: false,
        ctaLabel: 'Get Started'
      }
    ]
  };

  const mockTemplate: WidgetTemplate = {
    id: 'template-1',
    name: '3-column classic',
    columns: [
      {
        id: 'col-1',
        order: 0,
        blocks: [
          {
            id: 'block-1',
            type: 'price-card',
            planTierId: 'tier-1',
            text: 'Price Card',
            order: 0,
            style: { padding: 20, radius: 8, elevation: 1, textAlign: 'center' }
          }
        ],
        widthFraction: 4
      }
    ],
    style: { gap: 16, background: '#ffffff', maxWidth: 1200 }
  };

  const mockWidget: WidgetInstance = {
    id: 'widget-1',
    name: 'Test Widget',
    templateId: 'template-1',
    columns: [
      {
        id: 'col-1',
        order: 0,
        blocks: [
          {
            id: 'block-1',
            type: 'price-card',
            planTierId: 'tier-1',
            text: 'Price Card',
            order: 0,
            style: { padding: 20, radius: 8, elevation: 1, textAlign: 'center' }
          }
        ],
        widthFraction: 4
      }
    ],
    style: { gap: 16, background: '#ffffff', maxWidth: 1200 },
    attachedPlanId: 'plan-1'
  };

  beforeEach(() => {
    const mockApiSpy = jasmine.createSpyObj('MockApiService', [
      'widgets', 'templates', 'plans', 'features', 'addWidget', 'updateWidget', 'getWidget'
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
    mockApiService.widgets.and.returnValue([mockWidget]);
    mockApiService.templates.and.returnValue([mockTemplate]);
    mockApiService.plans.and.returnValue([mockPlan]);
    mockApiService.features.and.returnValue(mockFeatures);
    mockApiService.getWidget.and.returnValue(mockWidget);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with computed signals', () => {
      expect(service.widgets()).toEqual([mockWidget]);
      expect(service.templates()).toEqual([mockTemplate]);
      expect(service.plans()).toEqual([mockPlan]);
      expect(service.features()).toEqual(mockFeatures);
    });

    it('should have null selected widget and block initially', () => {
      expect(service.selectedWidgetId()).toBeNull();
      expect(service.selectedBlockId()).toBeNull();
      expect(service.selectedWidget()).toBeNull();
      expect(service.selectedBlock()).toBeNull();
    });

    it('should compute attached plan when widget has attachedPlanId', () => {
      service.selectWidget('widget-1');
      expect(service.attachedPlan()).toEqual(mockPlan);
    });
  });

  describe('Widget Management', () => {
    it('should create widget from template', () => {
      const newWidget = {
        ...mockWidget,
        id: 'new-widget-id',
        name: 'Widget from 3-column classic',
        columns: [
          {
            id: 'new-col-id',
            order: 0,
            blocks: [
              {
                id: 'new-block-id',
                type: 'price-card' as const,
                planTierId: 'tier-1',
                text: 'Price Card',
                order: 0,
                style: { padding: 20, radius: 8, elevation: 1 as const, textAlign: 'center' as const }
              }
            ],
            widthFraction: 4 as const
          }
        ]
      };

      mockApiService.addWidget.and.returnValue(newWidget);

      const result = service.createWidgetFromTemplate('template-1');

      expect(mockApiService.addWidget).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Widget from 3-column classic',
          templateId: 'template-1'
        })
      );
      expect(service.selectedWidgetId()).toBe(newWidget.id);
      expect(result).toEqual(newWidget);
    });

    it('should create blank widget', () => {
      const blankWidget = {
        id: 'blank-widget-id',
        name: 'New Widget',
        templateId: '',
        columns: [],
        style: { gap: 16, background: '#ffffff', maxWidth: 1200 }
      };

      mockApiService.addWidget.and.returnValue(blankWidget);

      const result = service.createBlankWidget();

      expect(mockApiService.addWidget).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'New Widget',
          templateId: '',
          columns: []
        })
      );
      expect(service.selectedWidgetId()).toBe(blankWidget.id);
      expect(result).toEqual(blankWidget);
    });

    it('should throw error when creating widget from non-existent template', () => {
      expect(() => service.createWidgetFromTemplate('non-existent')).toThrowError('Template not found');
    });

    it('should attach plan to widget', () => {
      service.attachPlan('widget-1', 'plan-1');
      expect(mockApiService.updateWidget).toHaveBeenCalledWith('widget-1', { attachedPlanId: 'plan-1' });
    });

    it('should select widget and block', () => {
      service.selectWidget('widget-1');
      expect(service.selectedWidgetId()).toBe('widget-1');
      expect(service.selectedWidget()).toEqual(mockWidget);

      service.selectBlock('block-1');
      expect(service.selectedBlockId()).toBe('block-1');
      expect(service.selectedBlock()).toEqual({
        block: mockWidget.columns[0].blocks[0],
        column: mockWidget.columns[0]
      });
    });
  });

  describe('Block Management', () => {
    beforeEach(() => {
      service.selectWidget('widget-1');
    });

    it('should add block to column', () => {
      service.addBlockToColumn('widget-1', 'col-1', 'headline');

      expect(mockApiService.updateWidget).toHaveBeenCalledWith('widget-1',
        jasmine.objectContaining({
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'col-1',
              blocks: jasmine.arrayContaining([
                jasmine.objectContaining({ type: 'headline' }),
                jasmine.objectContaining({ type: 'price-card' })
              ])
            })
          ])
        })
      );
      expect(service.selectedBlockId()).toBeTruthy();
    });

    it('should reorder blocks within column', () => {
      const reorderedBlocks = [mockWidget.columns[0].blocks[0]];
      service.reorderBlocks('widget-1', 'col-1', reorderedBlocks);

      expect(mockApiService.updateWidget).toHaveBeenCalledWith('widget-1',
        jasmine.objectContaining({
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'col-1',
              blocks: reorderedBlocks
            })
          ])
        })
      );
    });

    it('should move block across columns', () => {
      // First add a second column to the mock widget
      const widgetWithTwoColumns = {
        ...mockWidget,
        columns: [
          ...mockWidget.columns,
          {
            id: 'col-2',
            order: 1,
            blocks: [],
            widthFraction: 4 as const
          }
        ]
      };
      mockApiService.getWidget.and.returnValue(widgetWithTwoColumns);
      mockApiService.widgets.and.returnValue([widgetWithTwoColumns]);

      service.moveBlockAcrossColumns('widget-1', 'col-1', 'col-2', 'block-1', 0);

      expect(mockApiService.updateWidget).toHaveBeenCalledWith('widget-1',
        jasmine.objectContaining({
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'col-1',
              blocks: []
            }),
            jasmine.objectContaining({
              id: 'col-2',
              blocks: jasmine.arrayContaining([
                jasmine.objectContaining({ id: 'block-1' })
              ])
            })
          ])
        })
      );
    });

    it('should update block style', () => {
      const partialStyle = { padding: 30, radius: 12 };
      service.updateBlockStyle('widget-1', 'block-1', partialStyle);

      expect(mockApiService.updateWidget).toHaveBeenCalledWith('widget-1',
        jasmine.objectContaining({
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({
              blocks: jasmine.arrayContaining([
                jasmine.objectContaining({
                  id: 'block-1',
                  style: jasmine.objectContaining({
                    padding: 30,
                    radius: 12,
                    elevation: 1,
                    textAlign: 'center'
                  })
                })
              ])
            })
          ])
        })
      );
    });

    it('should update block text', () => {
      service.updateBlockText('widget-1', 'block-1', 'Updated Text');

      expect(mockApiService.updateWidget).toHaveBeenCalledWith('widget-1',
        jasmine.objectContaining({
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({
              blocks: jasmine.arrayContaining([
                jasmine.objectContaining({
                  id: 'block-1',
                  text: 'Updated Text'
                })
              ])
            })
          ])
        })
      );
    });

    it('should delete block', () => {
      service.deleteBlock('widget-1', 'block-1');

      expect(mockApiService.updateWidget).toHaveBeenCalledWith('widget-1',
        jasmine.objectContaining({
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'col-1',
              blocks: []
            })
          ])
        })
      );
      expect(service.selectedBlockId()).toBeNull();
    });
  });

  describe('Column Management', () => {
    beforeEach(() => {
      service.selectWidget('widget-1');
    });

    it('should set column width', () => {
      service.setColumnWidth('widget-1', 'col-1', 6);

      expect(mockApiService.updateWidget).toHaveBeenCalledWith('widget-1',
        jasmine.objectContaining({
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'col-1',
              widthFraction: 6
            })
          ])
        })
      );
    });
  });

  describe('Export Functions', () => {
    beforeEach(() => {
      service.selectWidget('widget-1');
    });

    it('should export HTML', () => {
      const html = service.exportHtml('widget-1');

      expect(html).toContain('<section class="pricing-widget" role="region" aria-label="Pricing">');
      expect(html).toContain('<ul class="widget-column" role="list"');
      expect(html).toContain('max-width: 1200px');
      expect(html).toContain('gap: 16px');
    });

    it('should export JSON', () => {
      const json = service.exportJson('widget-1');
      expect(json).toEqual(mockWidget);
    });

    it('should return empty string for HTML export of non-existent widget', () => {
      mockApiService.getWidget.and.returnValue(undefined);
      const html = service.exportHtml('non-existent');
      expect(html).toBe('');
    });

    it('should return null for JSON export of non-existent widget', () => {
      mockApiService.getWidget.and.returnValue(undefined);
      const json = service.exportJson('non-existent');
      expect(json).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle operations with non-existent widget', () => {
      mockApiService.getWidget.and.returnValue(undefined);
      expect(() => service.addBlockToColumn('non-existent', 'col-1', 'headline')).toThrowError('Widget not found');
    });

    it('should handle operations with non-existent column', () => {
      service.selectWidget('widget-1');
      expect(() => service.addBlockToColumn('widget-1', 'non-existent', 'headline')).toThrowError('Column not found');
    });

    it('should handle operations with non-existent block', () => {
      service.selectWidget('widget-1');
      service.updateBlockStyle('widget-1', 'non-existent', { padding: 20 });
      // The method should call updateWidget even if block doesn't exist (no-op update)
      expect(mockApiService.updateWidget).toHaveBeenCalledWith('widget-1', 
        jasmine.objectContaining({
          columns: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'col-1',
              blocks: jasmine.arrayContaining([
                jasmine.objectContaining({ id: 'block-1' })
              ])
            })
          ])
        })
      );
    });
  });
});
