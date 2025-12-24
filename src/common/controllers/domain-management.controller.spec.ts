import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { DomainManagementController } from './domain-management.controller';
import { DomainResolverService } from '../services/domain-resolver.service';
import { CreateDomainDto } from '../dto/create-domain.dto';
import { UpdateDomainDto } from '../dto/update-domain.dto';
import { TenantDomain, DomainType } from '@prisma/client';

const mockDomainResolverService = {
  getTenantDomains: jest.fn(),
  addCustomDomain: jest.fn(),
  checkDomainHealth: jest.fn(),
};

const mockTenantDomain: TenantDomain = {
  id: 1,
  tenantId: 1,
  domain: 'hamza.com',
  isPrimary: false,
  isActive: true,
  type: 'CUSTOM' as const,
  sslStatus: 'PENDING' as const,
  sslIssuedAt: null,
  sslExpiresAt: null,
  isVerified: false,
  verificationToken: 'softellio-verify-12345',
  verifiedAt: null,
  createdAt: new Date('2025-12-22T10:00:00.000Z'),
  updatedAt: new Date('2025-12-22T10:00:00.000Z'),
};

const mockCreateDomainDto: CreateDomainDto = {
  domain: 'hamza.com',
  isPrimary: false,
  type: DomainType.CUSTOM,
};

describe('DomainManagementController', () => {
  let controller: DomainManagementController;
  let domainResolverService: DomainResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DomainManagementController],
      providers: [
        {
          provide: DomainResolverService,
          useValue: mockDomainResolverService,
        },
      ],
    }).compile();

    controller = module.get<DomainManagementController>(DomainManagementController);
    domainResolverService = module.get<DomainResolverService>(DomainResolverService);
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

      expect(domainResolverService.addCustomDomain).toHaveBeenCalledWith(
        tenantId,
        createDomainDto.domain,
        createDomainDto.isPrimary || false,
      );
      expect(result).toEqual(mockTenantDomain);
    });

    it('should throw ConflictException when domain already exists', async () => {
      const tenantId = 1;
      const createDomainDto = mockCreateDomainDto;

      mockDomainResolverService.addCustomDomain.mockRejectedValue(
        new ConflictException('Domain is already registered to another tenant')
      );

      await expect(controller.addCustomDomain(tenantId, createDomainDto))
        .rejects
        .toThrow(ConflictException);

      expect(domainResolverService.addCustomDomain).toHaveBeenCalledWith(
        tenantId,
        createDomainDto.domain,
        createDomainDto.isPrimary || false,
      );
    });

    it('should throw ConflictException when domain already exists for same tenant', async () => {
      const tenantId = 1;
      const createDomainDto = mockCreateDomainDto;

      mockDomainResolverService.addCustomDomain.mockRejectedValue(
        new ConflictException('Domain is already registered to this tenant')
      );

      await expect(controller.addCustomDomain(tenantId, createDomainDto))
        .rejects
        .toThrow(ConflictException);

      expect(domainResolverService.addCustomDomain).toHaveBeenCalledWith(
        tenantId,
        createDomainDto.domain,
        createDomainDto.isPrimary || false,
      );
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