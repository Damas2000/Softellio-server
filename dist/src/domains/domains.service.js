"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DomainsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../config/prisma.service");
const dns_verification_util_1 = require("./utils/dns-verification.util");
const client_1 = require("@prisma/client");
let DomainsService = DomainsService_1 = class DomainsService {
    constructor(prisma, dnsVerification) {
        this.prisma = prisma;
        this.dnsVerification = dnsVerification;
        this.logger = new common_1.Logger(DomainsService_1.name);
    }
    async create(tenantId, createDomainDto) {
        const { domain, type, isPrimary = false } = createDomainDto;
        if (type === client_1.DomainType.CUSTOM && !this.dnsVerification.validateDomainFormat(domain)) {
            throw new common_1.BadRequestException('Invalid domain format or reserved domain. Custom domains cannot use *.softellio.com or reserved domains.');
        }
        const existingDomain = await this.prisma.tenantDomain.findUnique({
            where: { domain }
        });
        if (existingDomain) {
            throw new common_1.ConflictException('This domain is already registered to another tenant');
        }
        if (isPrimary) {
            await this.ensureSinglePrimaryDomain(tenantId);
        }
        return this.prisma.$transaction(async (tx) => {
            let verificationToken = null;
            let isVerified = false;
            if (type === client_1.DomainType.CUSTOM) {
                verificationToken = this.dnsVerification.generateVerificationToken();
            }
            else {
                isVerified = true;
            }
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
                    sslStatus: client_1.DomainSSLStatus.PENDING,
                },
            });
            const dnsInstructions = this.generateDnsInstructions(domain, verificationToken);
            return this.formatDomainResponse(createdDomain, dnsInstructions);
        });
    }
    async findAllByTenant(tenantId) {
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
    async findOne(tenantId, domainId) {
        const domain = await this.prisma.tenantDomain.findFirst({
            where: {
                id: domainId,
                tenantId
            }
        });
        if (!domain) {
            throw new common_1.NotFoundException('Domain not found');
        }
        const dnsInstructions = this.generateDnsInstructions(domain.domain, domain.verificationToken);
        return this.formatDomainResponse(domain, dnsInstructions);
    }
    async update(tenantId, domainId, updateDomainDto) {
        const existingDomain = await this.prisma.tenantDomain.findFirst({
            where: {
                id: domainId,
                tenantId
            }
        });
        if (!existingDomain) {
            throw new common_1.NotFoundException('Domain not found');
        }
        if (updateDomainDto.isPrimary === true) {
            if (existingDomain.type === client_1.DomainType.CUSTOM && !existingDomain.isVerified) {
                throw new common_1.BadRequestException('Cannot set unverified custom domain as primary');
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
    async verify(tenantId, domainId) {
        const domain = await this.prisma.tenantDomain.findFirst({
            where: {
                id: domainId,
                tenantId
            }
        });
        if (!domain) {
            throw new common_1.NotFoundException('Domain not found');
        }
        if (domain.isVerified) {
            return {
                status: 'verified',
                message: 'Domain is already verified',
                checkedRecords: [],
                verifiedAt: domain.verifiedAt
            };
        }
        if (domain.type === client_1.DomainType.SYSTEM) {
            return {
                status: 'verified',
                message: 'System domains do not require verification',
                checkedRecords: []
            };
        }
        if (!domain.verificationToken) {
            throw new common_1.BadRequestException('Domain has no verification token');
        }
        const verificationResult = await this.dnsVerification.verifyDomainOwnership(domain.domain, domain.verificationToken);
        if (verificationResult.verified) {
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
        }
        else {
            this.logger.warn(`Domain ${domain.domain} verification failed for tenant ${tenantId}: ${verificationResult.error}`);
            return {
                status: 'pending',
                message: verificationResult.error || 'Verification record not found. Please ensure the TXT record is added to your DNS settings.',
                checkedRecords: verificationResult.records.map(record => `TXT @ ${record}`)
            };
        }
    }
    async remove(tenantId, domainId) {
        const domain = await this.prisma.tenantDomain.findFirst({
            where: {
                id: domainId,
                tenantId
            }
        });
        if (!domain) {
            throw new common_1.NotFoundException('Domain not found');
        }
        if (domain.isPrimary && domain.isActive) {
            const activeDomains = await this.prisma.tenantDomain.count({
                where: {
                    tenantId,
                    isActive: true
                }
            });
            if (activeDomains === 1) {
                throw new common_1.BadRequestException('Cannot delete the last active domain. Please add another domain first.');
            }
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
        await this.prisma.tenantDomain.update({
            where: { id: domainId },
            data: { isActive: false }
        });
        this.logger.log(`Domain ${domain.domain} deleted for tenant ${tenantId}`);
        return {
            message: 'Domain deleted successfully'
        };
    }
    async ensureSinglePrimaryDomain(tenantId, excludeId) {
        const whereCondition = {
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
    generateDnsInstructions(domain, verificationToken) {
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
    formatDomainResponse(domain, dnsInstructions) {
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
};
exports.DomainsService = DomainsService;
exports.DomainsService = DomainsService = DomainsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        dns_verification_util_1.DnsVerificationUtil])
], DomainsService);
//# sourceMappingURL=domains.service.js.map