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
var DomainResolverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainResolverService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let DomainResolverService = DomainResolverService_1 = class DomainResolverService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DomainResolverService_1.name);
    }
    async resolveTenantFromDomain(hostHeader) {
        if (!hostHeader) {
            throw new common_1.NotFoundException('Domain header is required');
        }
        const normalizedHost = this.normalizeHost(hostHeader);
        this.logger.debug(`Resolving tenant for domain: ${normalizedHost}`);
        if (this.isReservedDomain(normalizedHost)) {
            throw new common_1.NotFoundException(`Reserved domain cannot be used for tenant resolution: ${normalizedHost}`);
        }
        const tenant = await this.findTenantByDomain(normalizedHost);
        if (!tenant) {
            throw new common_1.NotFoundException(`No tenant found for domain: ${normalizedHost}`);
        }
        this.logger.debug(`Tenant resolved: ${tenant.slug} (${tenant.id})`);
        let tenantDomain = null;
        try {
            tenantDomain = await this.prisma.tenantDomain.findFirst({
                where: {
                    tenantId: tenant.id,
                    domain: normalizedHost,
                    isActive: true
                }
            });
        }
        catch (error) {
            this.logger.warn(`Could not find TenantDomain entry for ${normalizedHost}: ${error.message}`);
        }
        return {
            tenant: tenant,
            domain: tenantDomain,
            resolvedBy: tenantDomain ? 'custom_domain' : 'subdomain'
        };
    }
    async findTenantByDomain(host) {
        const cleanHost = host.replace(/^https?:\/\//, '').split(':')[0];
        let tenant = await this.prisma.tenant.findFirst({
            where: {
                domain: cleanHost,
                isActive: true,
                status: 'active'
            }
        });
        if (!tenant) {
            const tenantDomain = await this.prisma.tenantDomain.findFirst({
                where: {
                    domain: cleanHost,
                    isActive: true,
                    tenant: {
                        isActive: true,
                        status: 'active'
                    }
                },
                include: {
                    tenant: true
                }
            });
            if (tenantDomain) {
                tenant = tenantDomain.tenant;
            }
        }
        if (!tenant && cleanHost.includes('.softellio.com')) {
            const subdomain = cleanHost.replace('.softellio.com', '');
            const slug = subdomain.replace(/panel$/, '');
            tenant = await this.prisma.tenant.findFirst({
                where: {
                    slug: slug,
                    isActive: true,
                    status: 'active'
                }
            });
        }
        return tenant;
    }
    isReservedDomain(domain) {
        const reservedDomains = [
            'platform.softellio.com',
            'portal.softellio.com',
            'localhost',
            'api.softellio.com',
            'admin.softellio.com',
            'connect.softellio.com',
            'app.softellio.com',
            'dashboard.softellio.com',
            'mail.softellio.com'
        ];
        return reservedDomains.includes(domain);
    }
    normalizeHost(host) {
        if (!host)
            return '';
        let normalized = host.toLowerCase().trim();
        if (normalized.includes(':')) {
            normalized = normalized.split(':')[0];
        }
        normalized = normalized.replace(/\.+$/, '');
        return normalized;
    }
    validateTenantAccess(tenant) {
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        if (!tenant.isActive) {
            throw new common_1.ForbiddenException('Tenant is inactive');
        }
        if (tenant.status === 'SUSPENDED') {
            throw new common_1.ForbiddenException('Tenant account has been suspended');
        }
        if (tenant.status === 'TRIAL_EXPIRED') {
            throw new common_1.ForbiddenException('Tenant trial period has expired');
        }
    }
    async getTenantDomains(tenantId) {
        return this.prisma.tenantDomain.findMany({
            where: {
                tenantId,
                isActive: true
            },
            orderBy: [
                { isPrimary: 'desc' },
                { createdAt: 'asc' }
            ]
        });
    }
    async addCustomDomain(tenantId, domain, isPrimary = false) {
        const normalizedDomain = this.normalizeHost(domain);
        const existingDomain = await this.prisma.tenantDomain.findFirst({
            where: {
                domain: normalizedDomain
            }
        });
        if (existingDomain) {
            throw new common_1.ForbiddenException('Domain is already registered to another tenant');
        }
        if (isPrimary) {
            await this.prisma.tenantDomain.updateMany({
                where: {
                    tenantId,
                    isPrimary: true
                },
                data: {
                    isPrimary: false
                }
            });
        }
        return this.prisma.tenantDomain.create({
            data: {
                tenantId,
                domain: normalizedDomain,
                type: 'custom',
                isPrimary,
                isActive: true,
                isVerified: false,
                verificationToken: this.generateVerificationToken()
            }
        });
    }
    generateVerificationToken() {
        return `softellio-verify-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    }
    async checkDomainHealth(domain) {
        const startTime = Date.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`https://${domain}`, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Softellio-Domain-Health-Check'
                }
            });
            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;
            return {
                domain,
                isReachable: response.ok,
                responseTime,
                statusCode: response.status,
                error: null
            };
        }
        catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                domain,
                isReachable: false,
                responseTime,
                statusCode: null,
                error: error.message
            };
        }
    }
};
exports.DomainResolverService = DomainResolverService;
exports.DomainResolverService = DomainResolverService = DomainResolverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DomainResolverService);
//# sourceMappingURL=domain-resolver.service.js.map