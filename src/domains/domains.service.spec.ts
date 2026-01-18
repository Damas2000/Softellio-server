import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DomainsService } from './domains.service';
import { DnsVerificationUtil } from './utils/dns-verification.util';
import { PrismaService } from '../config/prisma.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { DomainType, DomainSSLStatus } from '@prisma/client';

const mockPrismaService = {
  tenantDomain: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockDnsVerificationUtil = {
  generateVerificationToken: jest.fn(),
  generateDnsInstructions: jest.fn(),
  validateDomainFormat: jest.fn(),
  verifyDomainOwnership: jest.fn(),
};

const mockTenantDomain = {
  id: 1,
  tenantId: 1,
  domain: 'example.com',
  type: DomainType.CUSTOM,
  isPrimary: false,
  isActive: true,
  isVerified: false,
  verificationToken: 'test-token-123',
  verifiedAt: null,
  sslStatus: DomainSSLStatus.PENDING,
  sslIssuedAt: null,
  sslExpiresAt: null,
  createdAt: new Date('2024-01-15T10:30:00Z'),
  updatedAt: new Date('2024-01-15T10:30:00Z'),
};

const mockDnsInstructions = {
  type: 'TXT',
  host: '@',
  value: 'softellio-verify=test-token-123',
  instructions: 'Add this TXT record to your DNS settings',
};

describe('DomainsService', () => {
  let service;
  let prismaService;
  let dnsUtil;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DomainsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: DnsVerificationUtil,
          useValue: mockDnsVerificationUtil,
        },
      ],
    }).compile();

    service = module.get<DomainsService>(DomainsService);
    prismaService = module.get(PrismaService);
    dnsUtil = module.get(DnsVerificationUtil);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDomainDto = {
      domain: 'example.com',
      type: DomainType.CUSTOM,
      isPrimary: false,
    };

    beforeEach(() => {
      dnsUtil.validateDomainFormat.mockReturnValue(true);
      dnsUtil.generateVerificationToken.mockReturnValue('test-token-123');
      dnsUtil.generateDnsInstructions.mockReturnValue(mockDnsInstructions);
      prismaService.tenantDomain.findUnique.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation(async (callback) =>
        callback(prismaService)
      );
    });

    it('should create a custom domain successfully', async () => {
      prismaService.tenantDomain.create.mockResolvedValue(mockTenantDomain);

      const result = await service.create(1, createDomainDto);

      expect(dnsUtil.validateDomainFormat).toHaveBeenCalledWith('example.com');
      expect(prismaService.tenantDomain.findUnique).toHaveBeenCalledWith({
        where: { domain: 'example.com' },
      });
      expect(prismaService.tenantDomain.create).toHaveBeenCalledWith({
        data: {
          tenantId: 1,
          domain: 'example.com',
          type: DomainType.CUSTOM,
          isPrimary: false,
          isActive: true,
          isVerified: false,
          verificationToken: 'test-token-123',
          verifiedAt: null,
          sslStatus: DomainSSLStatus.PENDING,
        },
      });
      expect(result.domain).toBe('example.com');
      expect(result.dnsInstructions).toEqual(mockDnsInstructions);
    });

    it('should create a system domain with auto-verification', async () => {
      const systemDomainDto = { ...createDomainDto, type: DomainType.SYSTEM };
      const systemDomain = { ...mockTenantDomain, type: DomainType.SYSTEM, isVerified: true, verificationToken: null };

      prismaService.tenantDomain.create.mockResolvedValue(systemDomain);

      await service.create(1, systemDomainDto);

      expect(prismaService.tenantDomain.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          isVerified: true,
          verificationToken: null,
          verifiedAt: expect.any(Date),
        }),
      });
    });

    it('should throw BadRequestException for invalid domain format', async () => {
      dnsUtil.validateDomainFormat.mockReturnValue(false);

      await expect(service.create(1, createDomainDto)).rejects.toThrow(BadRequestException);
      expect(dnsUtil.validateDomainFormat).toHaveBeenCalledWith('example.com');
    });

    it('should throw ConflictException for existing domain', async () => {
      prismaService.tenantDomain.findUnique.mockResolvedValue(mockTenantDomain);

      await expect(service.create(1, createDomainDto)).rejects.toThrow(ConflictException);
    });

    it('should handle primary domain correctly', async () => {
      const primaryDomainDto = { ...createDomainDto, isPrimary: true };
      prismaService.tenantDomain.create.mockResolvedValue(mockTenantDomain);
      prismaService.tenantDomain.updateMany.mockResolvedValue({ count: 1 });

      await service.create(1, primaryDomainDto);

      expect(prismaService.tenantDomain.updateMany).toHaveBeenCalledWith({
        where: { tenantId: 1, isPrimary: true },
        data: { isPrimary: false },
      });
    });
  });

  describe('findAllByTenant', () => {
    it('should return all domains for a tenant', async () => {
      const domains = [mockTenantDomain];
      prismaService.tenantDomain.findMany.mockResolvedValue(domains);
      dnsUtil.generateDnsInstructions.mockReturnValue(mockDnsInstructions);

      const result = await service.findAllByTenant(1);

      expect(prismaService.tenantDomain.findMany).toHaveBeenCalledWith({
        where: { tenantId: 1 },
        orderBy: [
          { isPrimary: 'desc' },
          { type: 'asc' },
          { createdAt: 'desc' }
        ]
      });
      expect(result).toHaveLength(1);
      expect(result[0].domain).toBe('example.com');
    });
  });

  describe('findOne', () => {
    it('should return a domain by ID', async () => {
      prismaService.tenantDomain.findFirst.mockResolvedValue(mockTenantDomain);
      dnsUtil.generateDnsInstructions.mockReturnValue(mockDnsInstructions);

      const result = await service.findOne(1, 1);

      expect(prismaService.tenantDomain.findFirst).toHaveBeenCalledWith({
        where: { id: 1, tenantId: 1 }
      });
      expect(result.domain).toBe('example.com');
    });

    it('should throw NotFoundException if domain not found', async () => {
      prismaService.tenantDomain.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDomainDto = {
      isPrimary: true,
    };

    beforeEach(() => {
      prismaService.tenantDomain.findFirst.mockResolvedValue(mockTenantDomain);
      prismaService.$transaction.mockImplementation(async (callback) =>
        callback(prismaService)
      );
      dnsUtil.generateDnsInstructions.mockReturnValue(mockDnsInstructions);
    });

    it('should update domain successfully', async () => {
      const verifiedDomain = { ...mockTenantDomain, isVerified: true };
      prismaService.tenantDomain.findFirst.mockResolvedValue(verifiedDomain);
      prismaService.tenantDomain.update.mockResolvedValue({ ...verifiedDomain, isPrimary: true });
      prismaService.tenantDomain.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.update(1, 1, updateDomainDto);

      expect(prismaService.tenantDomain.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDomainDto
      });
      expect(result.domain).toBe('example.com');
    });

    it('should throw BadRequestException for unverified custom domain set as primary', async () => {
      await expect(service.update(1, 1, updateDomainDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if domain not found', async () => {
      prismaService.tenantDomain.findFirst.mockResolvedValue(null);

      await expect(service.update(1, 1, updateDomainDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('verify', () => {
    beforeEach(() => {
      prismaService.tenantDomain.findFirst.mockResolvedValue(mockTenantDomain);
    });

    it('should verify domain successfully', async () => {
      const verificationResult = { verified: true, records: ['softellio-verify=test-token-123'] };
      dnsUtil.verifyDomainOwnership.mockResolvedValue(verificationResult);
      prismaService.tenantDomain.update.mockResolvedValue({ ...mockTenantDomain, isVerified: true });

      const result = await service.verify(1, 1);

      expect(dnsUtil.verifyDomainOwnership).toHaveBeenCalledWith('example.com', 'test-token-123');
      expect(prismaService.tenantDomain.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          isVerified: true,
          verifiedAt: expect.any(Date)
        }
      });
      expect(result.status).toBe('verified');
    });

    it('should return pending status for failed verification', async () => {
      const verificationResult = {
        verified: false,
        records: [],
        error: 'Verification record not found'
      };
      dnsUtil.verifyDomainOwnership.mockResolvedValue(verificationResult);

      const result = await service.verify(1, 1);

      expect(result.status).toBe('pending');
      expect(result.message).toBe('Verification record not found');
    });

    it('should return verified status for already verified domain', async () => {
      const verifiedDomain = { ...mockTenantDomain, isVerified: true, verifiedAt: new Date() };
      prismaService.tenantDomain.findFirst.mockResolvedValue(verifiedDomain);

      const result = await service.verify(1, 1);

      expect(result.status).toBe('verified');
      expect(result.message).toBe('Domain is already verified');
    });

    it('should return verified status for system domain', async () => {
      const systemDomain = { ...mockTenantDomain, type: DomainType.SYSTEM };
      prismaService.tenantDomain.findFirst.mockResolvedValue(systemDomain);

      const result = await service.verify(1, 1);

      expect(result.status).toBe('verified');
      expect(result.message).toBe('System domains do not require verification');
    });

    it('should throw NotFoundException if domain not found', async () => {
      prismaService.tenantDomain.findFirst.mockResolvedValue(null);

      await expect(service.verify(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      prismaService.tenantDomain.findFirst.mockResolvedValue(mockTenantDomain);
      prismaService.tenantDomain.update.mockResolvedValue({ ...mockTenantDomain, isActive: false });
    });

    it('should soft delete domain successfully', async () => {
      const result = await service.remove(1, 1);

      expect(prismaService.tenantDomain.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false }
      });
      expect(result.message).toBe('Domain deleted successfully');
    });

    it('should throw BadRequestException for last active domain', async () => {
      const primaryDomain = { ...mockTenantDomain, isPrimary: true };
      prismaService.tenantDomain.findFirst.mockResolvedValue(primaryDomain);
      prismaService.tenantDomain.count.mockResolvedValue(1);

      await expect(service.remove(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should set another domain as primary when deleting primary domain', async () => {
      const primaryDomain = { ...mockTenantDomain, isPrimary: true };
      prismaService.tenantDomain.findFirst.mockResolvedValue(primaryDomain);
      prismaService.tenantDomain.count.mockResolvedValue(2);
      prismaService.tenantDomain.updateMany.mockResolvedValue({ count: 1 });

      await service.remove(1, 1);

      expect(prismaService.tenantDomain.updateMany).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          isActive: true,
          id: { not: 1 }
        },
        data: { isPrimary: true }
      });
    });

    it('should throw NotFoundException if domain not found', async () => {
      prismaService.tenantDomain.findFirst.mockResolvedValue(null);

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });
});