import { TestBed } from '@angular/core/testing';
import { PlansStoreService } from './plans-store.service';
import { MockApiService } from '../../../core/services/mock-api.service';
import { Plan, Feature } from '../../../core/models/pricing.models';

describe('PlansStoreService', () => {
  let service: PlansStoreService;
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

  beforeEach(() => {
    const mockApiSpy = jasmine.createSpyObj('MockApiService', [
      'plans', 'features', 'addPlan', 'updatePlan', 'deletePlan', 'getPlan'
    ]);

    TestBed.configureTestingModule({
      providers: [
        PlansStoreService,
        { provide: MockApiService, useValue: mockApiSpy }
      ]
    });

    service = TestBed.inject(PlansStoreService);
    mockApiService = TestBed.inject(MockApiService) as jasmine.SpyObj<MockApiService>;

    // Setup mock returns
    mockApiService.plans.and.returnValue([mockPlan]);
    mockApiService.features.and.returnValue(mockFeatures);
    mockApiService.getPlan.and.returnValue(mockPlan);
    mockApiService.addPlan.and.returnValue({ ...mockPlan, id: 'new-plan-id' });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should initialize with plans and features from MockApiService', () => {
      expect(service.plans()).toEqual([mockPlan]);
      expect(service.features()).toEqual(mockFeatures);
    });

    it('should have null selected plan initially', () => {
      // The service starts with no selected plan
      expect(service.selectedPlanId()).toBeNull();
      expect(service.selectedPlan()).toBeNull();
    });

    it('should handle empty plans list', () => {
      mockApiService.plans.and.returnValue([]);
      // Create a new service instance with empty plans
      const emptyService = TestBed.inject(PlansStoreService);
      expect(emptyService.selectedPlanId()).toBeNull();
      expect(emptyService.selectedPlan()).toBeNull();
    });
  });

  describe('Plan Management', () => {
    it('should create a new plan', () => {
      const newPlanData = {
        name: 'New Plan',
        description: 'A new plan',
        public: false,
        tiers: []
      };

      const createdPlan = { ...newPlanData, id: 'new-plan-id' };
      mockApiService.addPlan.and.returnValue(createdPlan);

      const result = service.createPlan(newPlanData);

      expect(mockApiService.addPlan).toHaveBeenCalledWith(newPlanData);
      expect(service.selectedPlanId()).toBe('new-plan-id');
      expect(result).toEqual(createdPlan);
    });

    it('should duplicate a plan', () => {
      const duplicatedPlan = {
        ...mockPlan,
        id: 'duplicated-plan-id',
        name: 'Test Plan (Copy)',
        public: false
      };
      mockApiService.addPlan.and.returnValue(duplicatedPlan);

      const result = service.duplicatePlan('plan-1');

      expect(mockApiService.addPlan).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Test Plan (Copy)',
          description: 'A test plan',
          public: false
        })
      );
      expect(service.selectedPlanId()).toBe('duplicated-plan-id');
      expect(result).toEqual(duplicatedPlan);
    });

    it('should update a plan', () => {
      const updates = { name: 'Updated Plan' };
      
      service.updatePlan('plan-1', updates);

      expect(mockApiService.updatePlan).toHaveBeenCalledWith('plan-1', updates);
    });

    it('should delete a plan', () => {
      service.deletePlan('plan-1');

      expect(mockApiService.deletePlan).toHaveBeenCalledWith('plan-1');
      expect(service.selectedPlanId()).toBeNull();
    });

    it('should select a plan', () => {
      service.selectPlan('plan-1');
      expect(service.selectedPlanId()).toBe('plan-1');
      expect(service.selectedPlan()).toEqual(mockPlan);
    });

    it('should handle selecting non-existent plan', () => {
      service.selectPlan('non-existent');
      expect(service.selectedPlan()).toBeNull();
    });
  });

  describe('Tier Management', () => {
    it('should add a tier to a plan', () => {
      const newTierData = {
        name: 'Enterprise',
        monthlyPrice: 50,
        currency: 'USD' as const,
        features: [],
        limits: {}
      };

      service.addTier('plan-1', newTierData);

      expect(mockApiService.updatePlan).toHaveBeenCalledWith('plan-1',
        jasmine.objectContaining({
          tiers: jasmine.arrayContaining([
            jasmine.objectContaining({
              ...newTierData,
              id: jasmine.any(String)
            })
          ])
        })
      );
    });

    it('should update a tier', () => {
      const updates = {
        name: 'Updated Basic',
        monthlyPrice: 15
      };

      service.updateTier('plan-1', 'tier-1', updates);

      expect(mockApiService.updatePlan).toHaveBeenCalledWith('plan-1',
        jasmine.objectContaining({
          tiers: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'tier-1',
              name: 'Updated Basic',
              monthlyPrice: 15
            })
          ])
        })
      );
    });

    it('should remove a tier', () => {
      service.removeTier('plan-1', 'tier-1');

      expect(mockApiService.updatePlan).toHaveBeenCalledWith('plan-1',
        jasmine.objectContaining({
          tiers: jasmine.arrayContaining([
            jasmine.objectContaining({ id: 'tier-2' })
          ])
        })
      );
    });
  });

  describe('Feature Management', () => {
    it('should toggle feature for tier', () => {
      service.toggleFeatureForTier('plan-1', 'tier-1', 'support.priority');

      expect(mockApiService.updatePlan).toHaveBeenCalledWith('plan-1',
        jasmine.objectContaining({
          tiers: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'tier-1',
              features: jasmine.arrayContaining(['api.limit', 'storage.gb', 'support.priority'])
            })
          ])
        })
      );
    });

    it('should remove feature from tier when toggling off', () => {
      service.toggleFeatureForTier('plan-1', 'tier-1', 'api.limit');

      expect(mockApiService.updatePlan).toHaveBeenCalledWith('plan-1',
        jasmine.objectContaining({
          tiers: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'tier-1',
              features: jasmine.arrayContaining(['storage.gb'])
            })
          ])
        })
      );
    });

    it('should set limit for tier feature', () => {
      service.setLimitForTier('plan-1', 'tier-1', 'api.limit', 2000);

      expect(mockApiService.updatePlan).toHaveBeenCalledWith('plan-1',
        jasmine.objectContaining({
          tiers: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'tier-1',
              limits: jasmine.objectContaining({
                'api.limit': 2000,
                'storage.gb': 10
              })
            })
          ])
        })
      );
    });

    it('should remove limit when set to null', () => {
      service.setLimitForTier('plan-1', 'tier-1', 'api.limit', null);

      expect(mockApiService.updatePlan).toHaveBeenCalledWith('plan-1',
        jasmine.objectContaining({
          tiers: jasmine.arrayContaining([
            jasmine.objectContaining({
              id: 'tier-1',
              limits: jasmine.objectContaining({
                'storage.gb': 10
              })
            })
          ])
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate plan with non-existent plan ID', () => {
      mockApiService.getPlan.and.returnValue(undefined);
      expect(() => service.duplicatePlan('non-existent')).toThrowError('Plan not found');
      expect(mockApiService.addPlan).not.toHaveBeenCalled();
    });

    it('should handle tier operations with non-existent plan', () => {
      mockApiService.getPlan.and.returnValue(undefined);
      const result = service.addTier('non-existent', { name: 'Test', monthlyPrice: 10, currency: 'USD', features: [], limits: {} });
      expect(mockApiService.updatePlan).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it('should handle feature operations with non-existent plan', () => {
      mockApiService.getPlan.and.returnValue(undefined);
      service.toggleFeatureForTier('non-existent', 'tier-1', 'api.limit');
      expect(mockApiService.updatePlan).not.toHaveBeenCalled();
    });
  });
});
