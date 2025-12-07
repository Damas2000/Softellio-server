"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const tenant_middleware_1 = require("./common/middleware/tenant.middleware");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const tenant_guard_1 = require("./common/guards/tenant.guard");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(tenant_middleware_1.TenantMiddleware)
            .forRoutes({ path: '*', method: common_1.RequestMethod.ALL });
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
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
        controllers: [],
        providers: [
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
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map