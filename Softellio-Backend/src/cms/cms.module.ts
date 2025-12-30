import { Module } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsPublicController } from './cms-public.controller';
import { FrontendModule } from '../frontend/frontend.module';
import { TenantsModule } from '../tenants/tenants.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [FrontendModule, TenantsModule, TemplatesModule],
  controllers: [CmsController, CmsPublicController],
})
export class CmsModule {}