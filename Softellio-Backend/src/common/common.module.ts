import { Module, Global } from '@nestjs/common';
import { PrismaModule } from '../config/prisma.module';
import { DomainResolverService } from './services/domain-resolver.service';
import { TenantMiddleware } from './middleware/tenant.middleware';
import { DomainManagementController } from './controllers/domain-management.controller';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [DomainManagementController],
  providers: [
    DomainResolverService,
    TenantMiddleware,
  ],
  exports: [
    DomainResolverService,
    TenantMiddleware,
  ],
})
export class CommonModule {}