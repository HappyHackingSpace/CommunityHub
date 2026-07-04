import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { TENANT_CONTEXT_KEY, TenantContext } from '../context/tenant-context';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_TENANT_OPTIONAL_KEY } from '../decorators/tenant-optional.decorator';

/**
 * TenantRequiredGuard - Enforces tenant context requirement
 *
 * This guard validates that routes that require tenant context have it.
 * Routes are exempt from validation if marked with @Public() or @TenantOptional().
 *
 * Guard Flow:
 * 1. Check if route is marked @Public() → skip validation
 * 2. Check if route is marked @TenantOptional() → skip validation
 * 3. Default: require tenant context, throw BadRequestException if missing
 *
 * Should be used as:
 * - Global guard (via APP_GUARD provider in AppModule)
 * - Or at controller level via @UseGuards()
 */
@Injectable()
export class TenantRequiredGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cls: ClsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip tenant validation for public routes
    }

    // Check if route is marked as tenant-optional
    const isTenantOptional = this.reflector.getAllAndOverride<boolean>(
      IS_TENANT_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isTenantOptional) {
      return true; // Skip tenant validation for tenant-optional routes
    }

    // Default behavior: require tenant context for this route
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);

    if (!tenantContext || !tenantContext.tenantId) {
      throw new BadRequestException(
        'Tenant context is required. Provide X-Tenant-Id header.',
      );
    }

    return true;
  }
}
