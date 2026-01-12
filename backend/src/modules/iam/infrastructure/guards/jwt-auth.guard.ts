// src/modules/iam/infrastructure/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/shared/decorators/public.decorator';

/**
 * JwtAuthGuard - Validates JWT token with support for @Public() decorator
 *
 * This guard extends NestJS AuthGuard to add metadata support.
 * Routes marked with @Public() will skip JWT validation.
 *
 * Usage:
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile() { }
 *
 * @Get('public-data')
 * @Public()
 * @UseGuards(JwtAuthGuard)  // JWT validation will be skipped
 * async getPublicData() { }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip JWT validation for public routes
    }

    // Default behavior: validate JWT token
    return super.canActivate(context);
  }
}