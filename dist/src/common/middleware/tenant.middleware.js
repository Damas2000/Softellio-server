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
var TenantMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
const domain_resolver_service_1 = require("../services/domain-resolver.service");
let TenantMiddleware = TenantMiddleware_1 = class TenantMiddleware {
    constructor(prisma, domainResolver) {
        this.prisma = prisma;
        this.domainResolver = domainResolver;
        this.logger = new common_1.Logger(TenantMiddleware_1.name);
    }
    async use(req, res, next) {
        try {
            if (req.path.startsWith('/super-admin')) {
                this.logger.debug('Skipping tenant resolution for super-admin route');
                return next();
            }
            if (req.path.startsWith('/health') || req.path.startsWith('/metrics')) {
                return next();
            }
            const isApiRoute = req.path.startsWith('/api') ||
                req.path.startsWith('/auth') ||
                req.path.startsWith('/users') ||
                req.path.startsWith('/super-admin/tenants') ||
                req.path.startsWith('/pages') ||
                req.path.startsWith('/blog') ||
                req.path.startsWith('/media') ||
                req.path.startsWith('/site-settings') ||
                req.path.startsWith('/menu') ||
                req.path.startsWith('/services') ||
                req.path.startsWith('/contact-info') ||
                req.path.startsWith('/team-members') ||
                req.path.startsWith('/references') ||
                req.path.startsWith('/seo') ||
                req.path.startsWith('/banners-sliders') ||
                req.path.startsWith('/social-media-maps') ||
                req.path.startsWith('/dashboard-analytics') ||
                req.path.startsWith('/system-settings') ||
                req.path.startsWith('/monitoring') ||
                req.path.startsWith('/backup') ||
                req.path.startsWith('/domains') ||
                req.path.includes('api-docs');
            if (!isApiRoute) {
                this.logger.debug(`Skipping tenant resolution for frontend route: ${req.path}`);
                return next();
            }
            this.logger.debug(`Processing tenant resolution for API route: ${req.path}`);
            let tenantId;
            let tenant = null;
            const tenantIdHeader = req.headers['x-tenant-id'];
            if (tenantIdHeader) {
                tenantId = parseInt(tenantIdHeader, 10);
                if (isNaN(tenantId)) {
                    throw new common_1.BadRequestException('Invalid tenant ID in header');
                }
                tenant = await this.prisma.tenant.findFirst({
                    where: {
                        id: tenantId,
                        isActive: true,
                        status: { not: 'SUSPENDED' }
                    },
                });
                if (!tenant) {
                    throw new common_1.BadRequestException(`Tenant with ID ${tenantId} not found or inactive`);
                }
                this.logger.debug(`Tenant resolved by ID header: ${tenant.slug} (${tenantId})`);
            }
            else {
                const domainHeader = (req.headers['x-tenant-domain'] || req.headers['host']);
                if (!domainHeader) {
                    throw new common_1.BadRequestException('No domain information found in request headers');
                }
                const normalizedDomain = domainHeader.toLowerCase().split(':')[0];
                this.logger.debug(`Checking domain for portal: "${normalizedDomain}" - comparing with "portal.softellio.com"`);
                if (normalizedDomain === 'portal.softellio.com') {
                    this.logger.debug('Portal domain detected - special handling for shared admin panel');
                    if (req.path.startsWith('/auth')) {
                        this.logger.debug('Auth route on portal domain - proceeding without tenant resolution');
                        return next();
                    }
                    const authHeader = req.headers.authorization;
                    if (authHeader && authHeader.startsWith('Bearer ')) {
                        try {
                            const token = authHeader.substring(7);
                            const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
                            if (payload.tenantId) {
                                tenant = await this.prisma.tenant.findFirst({
                                    where: {
                                        id: payload.tenantId,
                                        isActive: true,
                                        status: { not: 'SUSPENDED' }
                                    },
                                });
                                if (!tenant) {
                                    throw new common_1.BadRequestException(`Tenant with ID ${payload.tenantId} not found or inactive`);
                                }
                                tenantId = tenant.id;
                                this.logger.debug(`Portal tenant resolved from JWT: ${tenant.slug} (${tenantId})`);
                                req.domainResolution = {
                                    originalDomain: domainHeader,
                                    resolvedBy: 'portal_jwt',
                                    tenantDomain: null,
                                };
                            }
                            else {
                                throw new common_1.BadRequestException('Portal access requires authentication with valid tenant information');
                            }
                        }
                        catch (error) {
                            this.logger.error(`Portal JWT parsing error: ${error.message}`);
                            throw new common_1.BadRequestException('Invalid authentication token for portal access');
                        }
                    }
                    else {
                        throw new common_1.BadRequestException('Portal access requires authentication');
                    }
                }
                else {
                    const resolution = await this.domainResolver.resolveTenantFromDomain(domainHeader);
                    this.domainResolver.validateTenantAccess(resolution.tenant);
                    tenant = resolution.tenant;
                    tenantId = tenant.id;
                    this.logger.debug(`Tenant resolved by ${resolution.resolvedBy}: ${tenant.slug} (${tenantId}) for domain: ${domainHeader}`);
                    req.domainResolution = {
                        originalDomain: domainHeader,
                        resolvedBy: resolution.resolvedBy,
                        tenantDomain: resolution.domain,
                    };
                }
            }
            req.tenantId = tenantId;
            req.tenant = tenant;
            this.logger.log(`🏢 Request for tenant: ${tenant.slug} (${tenantId}) - ${req.method} ${req.path}`);
            if (req.domainResolution) {
                this.logger.debug(`Domain resolution: ${req.domainResolution.originalDomain} -> ${tenant.slug} via ${req.domainResolution.resolvedBy}`);
            }
        }
        catch (error) {
            this.logger.error(`❌ Tenant middleware error: ${error.message}`, error.stack);
            if (process.env.NODE_ENV === 'development') {
                throw new common_1.BadRequestException(`Tenant resolution failed: ${error.message}`);
            }
            throw new common_1.BadRequestException('Unable to resolve tenant for this request');
        }
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = TenantMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        domain_resolver_service_1.DomainResolverService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map