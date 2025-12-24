import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './config/prisma.module';
import { CloudinaryModule } from './config/cloudinary.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { DomainsModule } from './domains/domains.module';
import { PagesModule } from './pages/pages.module';
import { BlogModule } from './blog/blog.module';
import { MenuModule } from './menu/menu.module';
import { MediaModule } from './media/media.module';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { SeedingModule } from './seeding/seeding.module';
import { ServicesModule } from './services/services.module';
import { ContactInfoModule } from './contact-info/contact-info.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { ReferencesModule } from './references/references.module';
import { SEOModule } from './seo/seo.module';
import { BannersSlidersModule } from './banners-sliders/banners-sliders.module';
import { SocialMediaMapsModule } from './social-media-maps/social-media-maps.module';
import { DashboardAnalyticsModule } from './dashboard-analytics/dashboard-analytics.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { CommonModule } from './common/common.module';
import { BackupModule } from './backup/backup.module';
import { FrontendModule } from './frontend/frontend.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Database module
    PrismaModule,
    // Common utilities module
    CommonModule,
    // Cloudinary module
    CloudinaryModule,
    // Authentication module
    AuthModule,
    // User management module
    UsersModule,
    // Tenant management module
    TenantsModule,
    // Domain management module
    DomainsModule,
    // Content management modules
    PagesModule,
    BlogModule,
    MenuModule,
    MediaModule,
    SiteSettingsModule,
    SeedingModule,
    ServicesModule,
    ContactInfoModule,
    TeamMembersModule,
    ReferencesModule,
    SEOModule,
    BannersSlidersModule,
    SocialMediaMapsModule,
    DashboardAnalyticsModule,
    SystemSettingsModule,
    MonitoringModule,
    BackupModule,
    // Frontend serving module
    FrontendModule,
    // Rate limiting
    ThrottlerModule.forRoot([
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
  controllers: [AppController],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}