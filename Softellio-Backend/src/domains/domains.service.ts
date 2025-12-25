import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger
} from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';
import { DnsVerificationUtil } from './utils/dns-verification.util';
import {
  CreateDomainDto,
  UpdateDomainDto,
  DomainWithInstructionsDto,
  VerifyDomainResponseDto,
  DnsInstructionsDto
} from './dto';
import { TenantDomain, DomainType, DomainSSLStatus } from '@prisma/client';

@Injectable()
export class DomainsService {
  private readonly logger = new Logger(DomainsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dnsVerification: DnsVerificationUtil,
  ) {}

  /**
   * Create a new domain for a tenant
   */
  async create(tenantId: number, createDomainDto: CreateDomainDto): Promise<DomainWithInstructionsDto> {
    const { domain, type, isPrimary = false } = createDomainDto;

    // Validate domain format
    if (type === DomainType.CUSTOM && !this.dnsVerification.validateDomainFormat(domain)) {
      throw new BadRequestException(
        'Invalid domain format or reserved domain. Custom domains cannot use *.softellio.com or reserved domains.'
      );
    }

    // Check if domain already exists
    const existingDomain = await this.prisma.tenantDomain.findUnique({
      where: { domain }
    });

    if (existingDomain) {
      throw new ConflictException('This domain is already registered to another tenant');
    }

    // If setting as primary, ensure only one primary domain per tenant
    if (isPrimary) {
      await this.ensureSinglePrimaryDomain(tenantId);
    }

    return this.prisma.$transaction(async (tx) => {
      // Generate verification token for custom domains
      let verificationToken: string | null = null;
      let isVerified = false;

      if (type === DomainType.CUSTOM) {
        verificationToken = this.dnsVerification.generateVerificationToken();
      } else {
        // System domains are automatically verified
        isVerified = true;
      }

      // Create the domain
      const createdDomain = await tx.tenantDomain.create({
        data: {
          tenantId,
          domain,
          type,
          isPrimary,
          isActive: true,
          isVerified,
          verificationToken,
          verifiedAt: isVerified ? new Date() : null,
          sslStatus: DomainSSLStatus.PENDING,
        },
      });

      // Generate DNS instructions
      const dnsInstructions = this.generateDnsInstructions(domain, verificationToken);

      return this.formatDomainResponse(createdDomain, dnsInstructions);
    });
  }

  /**
   * Get all domains for a tenant
   */
  async findAllByTenant(tenantId: number): Promise<DomainWithInstructionsDto[]> {
    const domains = await this.prisma.tenantDomain.findMany({
      where: { tenantId },
      orderBy: [
        { isPrimary: 'desc' },
        { type: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return domains.map(domain => {
      const dnsInstructions = this.generateDnsInstructions(domain.domain, domain.verificationToken);
      return this.formatDomainResponse(domain, dnsInstructions);
    });
  }

  /**
   * Get a specific domain by ID for a tenant
   */
  async findOne(tenantId: number, domainId: number): Promise<DomainWithInstructionsDto> {
    const domain = await this.prisma.tenantDomain.findFirst({
      where: {
        id: domainId,
        tenantId
      }
    });

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    const dnsInstructions = this.generateDnsInstructions(domain.domain, domain.verificationToken);
    return this.formatDomainResponse(domain, dnsInstructions);
  }

  /**
   * Update domain settings
   */
  async update(tenantId: number, domainId: number, updateDomainDto: UpdateDomainDto): Promise<DomainWithInstructionsDto> {
    // Check if domain exists and belongs to tenant
    const existingDomain = await this.prisma.tenantDomain.findFirst({
      where: {
        id: domainId,
        tenantId
      }
    });

    if (!existingDomain) {
      throw new NotFoundException('Domain not found');
    }

    // If setting as primary, ensure it's verified for custom domains
    if (updateDomainDto.isPrimary === true) {
      if (existingDomain.type === DomainType.CUSTOM && !existingDomain.isVerified) {
        throw new BadRequestException('Cannot set unverified custom domain as primary');
      }

      await this.ensureSinglePrimaryDomain(tenantId, domainId);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedDomain = await tx.tenantDomain.update({
        where: { id: domainId },
        data: updateDomainDto
      });

      const dnsInstructions = this.generateDnsInstructions(updatedDomain.domain, updatedDomain.verificationToken);
      return this.formatDomainResponse(updatedDomain, dnsInstructions);
    });
  }

  /**
   * Verify domain ownership via DNS
   */
  async verify(tenantId: number, domainId: number): Promise<VerifyDomainResponseDto> {
    // Get the domain
    const domain = await this.prisma.tenantDomain.findFirst({
      where: {
        id: domainId,
        tenantId
      }
    });

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    if (domain.isVerified) {
      return {
        status: 'verified',
        message: 'Domain is already verified',
        checkedRecords: [],
        verifiedAt: domain.verifiedAt
      };
    }

    if (domain.type === DomainType.SYSTEM) {
      return {
        status: 'verified',
        message: 'System domains do not require verification',
        checkedRecords: []
      };
    }

    if (!domain.verificationToken) {
      throw new BadRequestException('Domain has no verification token');
    }

    // Perform DNS verification
    const verificationResult = await this.dnsVerification.verifyDomainOwnership(
      domain.domain,
      domain.verificationToken
    );

    if (verificationResult.verified) {
      // Update domain as verified
      await this.prisma.tenantDomain.update({
        where: { id: domainId },
        data: {
          isVerified: true,
          verifiedAt: new Date()
        }
      });

      this.logger.log(`Domain ${domain.domain} verified successfully for tenant ${tenantId}`);

      return {
        status: 'verified',
        message: 'Domain successfully verified!',
        checkedRecords: verificationResult.records.map(record => `TXT @ ${record}`),
        verifiedAt: new Date()
      };
    } else {
      this.logger.warn(`Domain ${domain.domain} verification failed for tenant ${tenantId}: ${verificationResult.error}`);

      return {
        status: 'pending',
        message: verificationResult.error || 'Verification record not found. Please ensure the TXT record is added to your DNS settings.',
        checkedRecords: verificationResult.records.map(record => `TXT @ ${record}`)
      };
    }
  }

  /**
   * Delete a domain (soft delete by setting isActive: false)
   */
  async remove(tenantId: number, domainId: number): Promise<{ message: string }> {
    // Check if domain exists and belongs to tenant
    const domain = await this.prisma.tenantDomain.findFirst({
      where: {
        id: domainId,
        tenantId
      }
    });

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    // Prevent deleting the last active primary domain
    if (domain.isPrimary && domain.isActive) {
      const activeDomains = await this.prisma.tenantDomain.count({
        where: {
          tenantId,
          isActive: true
        }
      });

      if (activeDomains === 1) {
        throw new BadRequestException('Cannot delete the last active domain. Please add another domain first.');
      }

      // If deleting primary domain, set another domain as primary
      await this.prisma.tenantDomain.updateMany({
        where: {
          tenantId,
          isActive: true,
          id: { not: domainId }
        },
        data: {
          isPrimary: true
        }
      });
    }

    // Soft delete the domain
    await this.prisma.tenantDomain.update({
      where: { id: domainId },
      data: { isActive: false }
    });

    this.logger.log(`Domain ${domain.domain} deleted for tenant ${tenantId}`);

    return {
      message: 'Domain deleted successfully'
    };
  }

  /**
   * Ensure only one primary domain per tenant
   */
  private async ensureSinglePrimaryDomain(tenantId: number, excludeId?: number): Promise<void> {
    const whereCondition: any = {
      tenantId,
      isPrimary: true
    };

    if (excludeId) {
      whereCondition.id = { not: excludeId };
    }

    await this.prisma.tenantDomain.updateMany({
      where: whereCondition,
      data: { isPrimary: false }
    });
  }

  /**
   * Generate DNS instructions for domain verification
   */
  private generateDnsInstructions(domain: string, verificationToken: string | null): DnsInstructionsDto {
    if (!verificationToken) {
      return {
        type: 'TXT',
        host: '@',
        value: 'No verification required (system domain)',
        instructions: 'This is a system domain and does not require DNS verification.'
      };
    }

    return this.dnsVerification.generateDnsInstructions(domain, verificationToken);
  }

  /**
   * Format domain response with DNS instructions
   */
  private formatDomainResponse(domain: TenantDomain, dnsInstructions: DnsInstructionsDto): DomainWithInstructionsDto {
    return {
      id: domain.id,
      domain: domain.domain,
      type: domain.type,
      isPrimary: domain.isPrimary,
      isActive: domain.isActive,
      isVerified: domain.isVerified,
      sslStatus: domain.sslStatus,
      verifiedAt: domain.verifiedAt,
      dnsInstructions,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt
    };
  }
}