import { NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../config/prisma.service';
import { DomainResolverService } from '../services/domain-resolver.service';
import { RequestWithTenant } from '../interfaces/request.interface';
export declare class TenantMiddleware implements NestMiddleware {
    private prisma;
    private domainResolver;
    private reflector;
    private readonly logger;
    constructor(prisma: PrismaService, domainResolver: DomainResolverService, reflector: Reflector);
    use(req: RequestWithTenant, res: Response, next: NextFunction): Promise<void>;
}
