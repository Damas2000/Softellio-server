"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const domain_management_controller_1 = require("./domain-management.controller");
const domain_resolver_service_1 = require("../services/domain-resolver.service");
const mockDomainResolverService = {
    getTenantDomains: jest.fn(),
    addCustomDomain: jest.fn(),
    checkDomainHealth: jest.fn(),
};
const mockTenantDomain = {
    id: 1,
    tenantId: 1,
    domain: 'hamza.com',
    isPrimary: false,
    isActive: true,
    type: 'CUSTOM',
    sslStatus: 'PENDING',
    sslIssuedAt: null,
    sslExpiresAt: null,
    isVerified: false,
    verificationToken: 'softellio-verify-12345',
    verifiedAt: null,
    createdAt: new Date('2025-12-22T10:00:00.000Z'),
    updatedAt: new Date('2025-12-22T10:00:00.000Z'),
};
const mockCreateDomainDto = {
    domain: 'hamza.com',
    isPrimary: false,
    type: 'custom',
};
describe('DomainManagementController', () => {
    let controller;
    let domainResolverService;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [domain_management_controller_1.DomainManagementController],
            providers: [
                {
                    provide: domain_resolver_service_1.DomainResolverService,
                    useValue: mockDomainResolverService,
                },
            ],
        }).compile();
        controller = module.get(domain_management_controller_1.DomainManagementController);
        domainResolverService = module.get(domain_resolver_service_1.DomainResolverService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('getTenantDomains', () => {
        it('should return domains for tenant', async () => {
            const tenantId = 1;
            const expectedDomains = [mockTenantDomain];
            mockDomainResolverService.getTenantDomains.mockResolvedValue(expectedDomains);
            const result = await controller.getTenantDomains(tenantId);
            expect(domainResolverService.getTenantDomains).toHaveBeenCalledWith(tenantId);
            expect(result).toEqual(expectedDomains);
        });
    });
    describe('addCustomDomain', () => {
        it('should successfully add a domain for tenant', async () => {
            const tenantId = 1;
            const createDomainDto = mockCreateDomainDto;
            mockDomainResolverService.addCustomDomain.mockResolvedValue(mockTenantDomain);
            const result = await controller.addCustomDomain(tenantId, createDomainDto);
            expect(domainResolverService.addCustomDomain).toHaveBeenCalledWith(tenantId, createDomainDto.domain, createDomainDto.isPrimary || false);
            expect(result).toEqual(mockTenantDomain);
        });
        it('should throw ConflictException when domain already exists', async () => {
            const tenantId = 1;
            const createDomainDto = mockCreateDomainDto;
            mockDomainResolverService.addCustomDomain.mockRejectedValue(new common_1.ConflictException('Domain is already registered to another tenant'));
            await expect(controller.addCustomDomain(tenantId, createDomainDto))
                .rejects
                .toThrow(common_1.ConflictException);
            expect(domainResolverService.addCustomDomain).toHaveBeenCalledWith(tenantId, createDomainDto.domain, createDomainDto.isPrimary || false);
        });
        it('should throw ConflictException when domain already exists for same tenant', async () => {
            const tenantId = 1;
            const createDomainDto = mockCreateDomainDto;
            mockDomainResolverService.addCustomDomain.mockRejectedValue(new common_1.ConflictException('Domain is already registered to this tenant'));
            await expect(controller.addCustomDomain(tenantId, createDomainDto))
                .rejects
                .toThrow(common_1.ConflictException);
            expect(domainResolverService.addCustomDomain).toHaveBeenCalledWith(tenantId, createDomainDto.domain, createDomainDto.isPrimary || false);
        });
    });
    describe('checkDomainHealth', () => {
        it('should return domain health check result', async () => {
            const domainParam = 'hamza.com';
            const mockHealthCheck = {
                domain: 'hamza.com',
                isReachable: true,
                responseTime: 250,
                statusCode: 200,
                error: null,
            };
            mockDomainResolverService.checkDomainHealth.mockResolvedValue(mockHealthCheck);
            const result = await controller.checkDomainHealth(domainParam);
            expect(domainResolverService.checkDomainHealth).toHaveBeenCalledWith(domainParam);
            expect(result).toMatchObject({
                domain: 'hamza.com',
                isReachable: true,
                responseTime: 250,
                statusCode: 200,
                error: null,
                checkedAt: expect.any(Date),
            });
        });
        it('should return health check with error when domain is unreachable', async () => {
            const domainParam = 'nonexistent.com';
            const mockHealthCheck = {
                domain: 'nonexistent.com',
                isReachable: false,
                responseTime: null,
                statusCode: null,
                error: 'Domain not reachable',
            };
            mockDomainResolverService.checkDomainHealth.mockResolvedValue(mockHealthCheck);
            const result = await controller.checkDomainHealth(domainParam);
            expect(domainResolverService.checkDomainHealth).toHaveBeenCalledWith(domainParam);
            expect(result).toMatchObject({
                domain: 'nonexistent.com',
                isReachable: false,
                responseTime: null,
                statusCode: null,
                error: 'Domain not reachable',
                checkedAt: expect.any(Date),
            });
        });
    });
});
//# sourceMappingURL=domain-management.controller.spec.js.map