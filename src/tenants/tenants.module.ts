import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { TenantsPublicController } from './tenants-public.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TenantsController, TenantsPublicController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}