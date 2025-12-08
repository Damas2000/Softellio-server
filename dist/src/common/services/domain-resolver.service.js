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
        let result = null;
        result = await this.resolveByCustomDomain(normalizedHost);
        if (result) {
            this.logger.debug(`Tenant resolved by custom domain: ${result.tenant.slug}`);
            return result;
        }
        result = await this.resolveBySubdomain(normalizedHost);
        if (result) {
            this.logger.debug(`Tenant resolved by subdomain: ${result.tenant.slug}`);
            return result;
        }
        result = await this.resolveDefaultTenant(normalizedHost);
        if (result) {
            this.logger.debug(`Tenant resolved as default: ${result.tenant.slug}`);
            return result;
        }
        result = await this.resolveFallbackTenant();
        if (result) {
            this.logger.warn(`Using fallback tenant for domain: ${normalizedHost}`);
            return result;
        }
        throw new common_1.NotFoundException(`No tenant found for domain: ${normalizedHost}`);
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
    async resolveByCustomDomain(domain) {
        try {
            let tenantDomain = await this.prisma.tenantDomain.findFirst({
                where: {
                    domain: domain,
                    isActive: true,
                    tenant: {
                        isActive: true,
                        status: { not: 'SUSPENDED' }
                    }
                },
                include: {
                    tenant: {
                        include: {
                            tenantDomains: true
                        }
                    }
                }
            });
            if (tenantDomain) {
                return {
                    tenant: tenantDomain.tenant,
                    domain: tenantDomain,
                    resolvedBy: 'custom_domain'
                };
            }
            if (!domain.startsWith('www.')) {
                tenantDomain = await this.prisma.tenantDomain.findFirst({
                    where: {
                        domain: `www.${domain}`,
                        isActive: true,
                        tenant: {
                            isActive: true,
                            status: { not: 'SUSPENDED' }
                        }
                    },
                    include: {
                        tenant: {
                            include: {
                                tenantDomains: true
                            }
                        }
                    }
                });
                if (tenantDomain) {
                    return {
                        tenant: tenantDomain.tenant,
                        domain: tenantDomain,
                        resolvedBy: 'custom_domain'
                    };
                }
            }
            if (domain.startsWith('www.')) {
                const domainWithoutWww = domain.substring(4);
                tenantDomain = await this.prisma.tenantDomain.findFirst({
                    where: {
                        domain: domainWithoutWww,
                        isActive: true,
                        tenant: {
                            isActive: true,
                            status: { not: 'SUSPENDED' }
                        }
                    },
                    include: {
                        tenant: {
                            include: {
                                tenantDomains: true
                            }
                        }
                    }
                });
                if (tenantDomain) {
                    return {
                        tenant: tenantDomain.tenant,
                        domain: tenantDomain,
                        resolvedBy: 'custom_domain'
                    };
                }
            }
            return null;
        }
        catch (error) {
            this.logger.error('Error in custom domain resolution:', error);
            return null;
        }
    }
    async resolveBySubdomain(domain) {
        try {
            const softellioPattern = /^([^.]+)\.softellio\.com$/;
            const match = domain.match(softellioPattern);
            if (!match) {
                return null;
            }
            const subdomain = match[1];
            const reservedSubdomains = ['www', 'api', 'admin', 'connect', 'app', 'dashboard', 'mail'];
            if (reservedSubdomains.includes(subdomain)) {
                return null;
            }
            const tenant = await this.prisma.tenant.findFirst({
                where: {
                    slug: subdomain,
                    isActive: true,
                    status: { not: 'SUSPENDED' }
                },
                include: {
                    tenantDomains: true
                }
            });
            if (!tenant) {
                return null;
            }
            let tenantDomain = await this.prisma.tenantDomain.findFirst({
                where: {
                    tenantId: tenant.id,
                    domain: domain,
                    type: 'subdomain'
                }
            });
            if (!tenantDomain) {
                try {
                    tenantDomain = await this.prisma.tenantDomain.create({
                        data: {
                            tenantId: tenant.id,
                            domain: domain,
                            type: 'subdomain',
                            isPrimary: false,
                            isActive: true,
                            isVerified: true,
                            verifiedAt: new Date()
                        }
                    });
                }
                catch (createError) {
                    this.logger.warn(`Could not auto-create subdomain entry: ${createError.message}`);
                }
            }
            return {
                tenant,
                domain: tenantDomain,
                resolvedBy: 'subdomain'
            };
        }
        catch (error) {
            this.logger.error('Error in subdomain resolution:', error);
            return null;
        }
    }
    async resolveDefaultTenant(domain) {
        try {
            const defaultDomains = ['softellio.com', 'www.softellio.com'];
            if (!defaultDomains.includes(domain)) {
                return null;
            }
            const defaultTenantSlug = process.env.DEFAULT_TENANT_SLUG || 'softellio';
            const tenant = await this.prisma.tenant.findFirst({
                where: {
                    slug: defaultTenantSlug,
                    isActive: true,
                    status: { not: 'SUSPENDED' }
                },
                include: {
                    tenantDomains: true
                }
            });
            if (!tenant) {
                this.logger.error(`Default tenant '${defaultTenantSlug}' not found`);
                return null;
            }
            return {
                tenant,
                domain: null,
                resolvedBy: 'default'
            };
        }
        catch (error) {
            this.logger.error('Error in default tenant resolution:', error);
            return null;
        }
    }
    async resolveFallbackTenant() {
        try {
            const fallbackTenantSlug = process.env.FALLBACK_TENANT_SLUG;
            if (!fallbackTenantSlug) {
                return null;
            }
            const tenant = await this.prisma.tenant.findFirst({
                where: {
                    slug: fallbackTenantSlug,
                    isActive: true,
                    status: { not: 'SUSPENDED' }
                },
                include: {
                    tenantDomains: true
                }
            });
            if (!tenant) {
                this.logger.error(`Fallback tenant '${fallbackTenantSlug}' not found`);
                return null;
            }
            return {
                tenant,
                domain: null,
                resolvedBy: 'fallback'
            };
        }
        catch (error) {
            this.logger.error('Error in fallback tenant resolution:', error);
            return null;
        }
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