import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
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