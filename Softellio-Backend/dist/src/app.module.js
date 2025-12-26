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
var AppModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const prisma_module_1 = require("./config/prisma.module");
const cloudinary_module_1 = require("./config/cloudinary.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const tenants_module_1 = require("./tenants/tenants.module");
const domains_module_1 = require("./domains/domains.module");
const pages_module_1 = require("./pages/pages.module");
const blog_module_1 = require("./blog/blog.module");
const menu_module_1 = require("./menu/menu.module");
const media_module_1 = require("./media/media.module");
const site_settings_module_1 = require("./site-settings/site-settings.module");
const seeding_module_1 = require("./seeding/seeding.module");
const services_module_1 = require("./services/services.module");
const contact_info_module_1 = require("./contact-info/contact-info.module");
const team_members_module_1 = require("./team-members/team-members.module");
const references_module_1 = require("./references/references.module");
const seo_module_1 = require("./seo/seo.module");
const banners_sliders_module_1 = require("./banners-sliders/banners-sliders.module");
const social_media_maps_module_1 = require("./social-media-maps/social-media-maps.module");
const dashboard_analytics_module_1 = require("./dashboard-analytics/dashboard-analytics.module");
const system_settings_module_1 = require("./system-settings/system-settings.module");
const monitoring_module_1 = require("./monitoring/monitoring.module");
const common_module_1 = require("./common/common.module");
const backup_module_1 = require("./backup/backup.module");
const billing_module_1 = require("./billing/billing.module");
const frontend_module_1 = require("./frontend/frontend.module");
const frontend_bootstrap_service_1 = require("./frontend/frontend-bootstrap.service");
const tenant_middleware_1 = require("./common/middleware/tenant.middleware");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const tenant_guard_1 = require("./common/guards/tenant.guard");
const subscription_guard_1 = require("./common/guards/subscription.guard");
const prisma_exception_filter_1 = require("./common/filters/prisma-exception.filter");
const app_controller_1 = require("./app.controller");
let AppModule = AppModule_1 = class AppModule {
    constructor(frontendBootstrapService) {
        this.frontendBootstrapService = frontendBootstrapService;
        this.logger = new common_1.Logger(AppModule_1.name);
    }
    configure(consumer) {
        consumer
            .apply(tenant_middleware_1.TenantMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
    async onModuleInit() {
        const shouldBootstrap = this.shouldRunBootstrap();
        if (shouldBootstrap) {
            this.logger.log('🎯 Starting frontend bootstrap...');
            try {
                await this.frontendBootstrapService.bootstrapAllTenants();
                this.logger.log('✅ Frontend bootstrap completed');
            }
            catch (error) {
                this.logger.error('❌ Frontend bootstrap failed:', error.message);
            }
        }
        else {
            this.logger.log('🔒 Bootstrap disabled (production safety)');
        }
    }
    shouldRunBootstrap() {
        const env = process.env.NODE_ENV;
        const bootstrapDemo = process.env.BOOTSTRAP_DEMO === 'true';
        const bootstrapAll = process.env.BOOTSTRAP_ALL_TENANTS === 'true';
        const shouldRun = env !== 'production' || bootstrapDemo || bootstrapAll;
        this.logger.log(`🔍 Bootstrap check: NODE_ENV=${env}, BOOTSTRAP_DEMO=${bootstrapDemo}, BOOTSTRAP_ALL_TENANTS=${bootstrapAll} → ${shouldRun ? 'ENABLED' : 'DISABLED'}`);
        return shouldRun;
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = AppModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            prisma_module_1.PrismaModule,
            common_module_1.CommonModule,
            cloudinary_module_1.CloudinaryModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            tenants_module_1.TenantsModule,
            domains_module_1.DomainsModule,
            pages_module_1.PagesModule,
            blog_module_1.BlogModule,
            menu_module_1.MenuModule,
            media_module_1.MediaModule,
            site_settings_module_1.SiteSettingsModule,
            seeding_module_1.SeedingModule,
            services_module_1.ServicesModule,
            contact_info_module_1.ContactInfoModule,
            team_members_module_1.TeamMembersModule,
            references_module_1.ReferencesModule,
            seo_module_1.SEOModule,
            banners_sliders_module_1.BannersSlidersModule,
            social_media_maps_module_1.SocialMediaMapsModule,
            dashboard_analytics_module_1.DashboardAnalyticsModule,
            system_settings_module_1.SystemSettingsModule,
            monitoring_module_1.MonitoringModule,
            backup_module_1.BackupModule,
            billing_module_1.BillingModule,
            frontend_module_1.FrontendModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 3,
                },
                {
                    name: 'medium',
                    ttl: 10000,
                    limit: 20,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100,
                },
            ]),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: prisma_exception_filter_1.PrismaExceptionFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: tenant_guard_1.TenantGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: subscription_guard_1.SubscriptionGuard,
            },
        ],
    }),
    __metadata("design:paramtypes", [frontend_bootstrap_service_1.FrontendBootstrapService])
], AppModule);
//# sourceMappingURL=app.module.js.map