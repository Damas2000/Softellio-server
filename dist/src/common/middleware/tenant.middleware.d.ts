import { NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { PrismaService } from '../../config/prisma.service';
import { DomainResolverService } from '../services/domain-resolver.service';
import { RequestWithTenant } from '../interfaces/request.interface';
export declare class TenantMiddleware implements NestMiddleware {
    private prisma;
    private domainResolver;
    private readonly logger;
    constructor(prisma: PrismaService, domainResolver: DomainResolverService);
    use(req: RequestWithTenant, res: Response, next: NextFunction): Promise<void>;
}
