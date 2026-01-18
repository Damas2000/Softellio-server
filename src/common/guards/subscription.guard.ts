import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Only apply subscription checks to admin CMS routes
    if (!url.includes('/admin')) {
      return true;
    }

    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const user = request.user;
    const tenant = request.tenant;

    // Allow access if no user (will be handled by auth guard)
    if (!user) {
      return true;
    }

    // Super admins bypass subscription checks
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    // If no tenant context, allow (this handles global endpoints)
    if (!tenant) {
      return true;
    }

    // Check if tenant has active subscription
    const tenantData = await this.prisma.tenant.findUnique({
      where: { id: tenant.id },
      select: { subscriptionStatus: true },
    });

    if (!tenantData) {
      // If tenant doesn't exist, let other guards handle it
      return true;
    }

    // Check if subscription is active
    if (tenantData.subscriptionStatus !== 'active') {
      throw new HttpException('Subscription required', HttpStatus.PAYMENT_REQUIRED);
    }

    return true;
  }
}