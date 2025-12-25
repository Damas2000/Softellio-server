import { Module } from '@nestjs/common';
import { DomainsController } from './domains.controller';
import { DomainsService } from './domains.service';
import { DnsVerificationUtil } from './utils/dns-verification.util';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DomainsController],
  providers: [DomainsService, DnsVerificationUtil],
  exports: [DomainsService, DnsVerificationUtil],
})
export class DomainsModule {}