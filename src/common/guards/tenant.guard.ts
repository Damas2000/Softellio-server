import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestTenantId = request.tenantId;

    // Allow access if no user (will be handled by auth guard)
    if (!user) {
      return true;
    }

    // Super admins can access any tenant's data or operate without tenant context
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    // For reserved domains (api.softellio.com), only SUPER_ADMIN allowed
    if (requestTenantId === null) {
      throw new ForbiddenException('Access denied. Only SUPER_ADMIN can access this domain');
    }

    // For tenant-scoped users, ensure they can only access their tenant's data
    if (!user.tenantId) {
      throw new ForbiddenException('User is not associated with any tenant');
    }

    if (user.tenantId !== requestTenantId) {
      throw new ForbiddenException(
        `Access denied. User belongs to tenant ${user.tenantId} but trying to access tenant ${requestTenantId}`
      );
    }

    return true;
  }
}