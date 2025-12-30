import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesPublicController } from './templates-public.controller';
import { TemplatesService } from './templates.service';
import { SiteConfigService } from './site-config.service';
import { DynamicPagesService } from './dynamic-pages.service';
import { SiteBootstrapService } from './site-bootstrap.service';
import { TemplateValidationService } from './template-validation.service';
import { PageCmsIntegrationService } from './page-cms-integration.service';
import { PublicRequestLoggerService } from './public-request-logger.service';
import { TenantResolutionService } from './tenant-resolution.service';
import { TemplateSeederService } from './seed/template-seeder.service';
import { PrismaModule } from '../config/prisma.module';
import { FrontendModule } from '../frontend/frontend.module';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    PrismaModule,
    FrontendModule,  // For PageLayoutsService
    TenantsModule    // For TenantsService
  ],
  controllers: [
    TemplatesController,
    TemplatesPublicController
  ],
  providers: [
    TemplatesService,
    SiteConfigService,
    DynamicPagesService,
    SiteBootstrapService,
    TemplateValidationService,
    PageCmsIntegrationService,
    PublicRequestLoggerService,
    TenantResolutionService,
    TemplateSeederService
  ],
  exports: [
    TemplatesService,
    SiteConfigService,
    DynamicPagesService,
    SiteBootstrapService,
    TemplateValidationService,
    PageCmsIntegrationService,
    PublicRequestLoggerService,
    TenantResolutionService,
    TemplateSeederService
  ]
})
export class TemplatesModule {}