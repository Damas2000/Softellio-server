import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      throw err;
    }

    if (!user) {
      // Check for specific JWT errors
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired. Please login again.');
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please login again.');
      }

      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active yet. Please check your system clock.');
      }

      if (info?.message) {
        throw new UnauthorizedException(`Authentication failed: ${info.message}`);
      }

      // Default fallback
      throw new UnauthorizedException('Invalid token. Please login again.');
    }

    return user;
  }
}