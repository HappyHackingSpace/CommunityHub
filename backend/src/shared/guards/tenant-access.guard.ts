import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { TENANT_CONTEXT_KEY, TenantContext } from '../context/tenant-context';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_TENANT_OPTIONAL_KEY } from '../decorators/tenant-optional.decorator';

/**
 * TenantAccessGuard - Validates user has access to requested tenant
 *
 * This guard ensures that:
 * 1. User is authenticated (request.user exists)
 * 2. User has access to the requested tenant (tenant ID in user.tenants)
 *
 * Skips validation for:
 * - @Public() routes (no tenant context required)
 * - @TenantOptional() routes WITHOUT tenant context (tenant context is truly optional)
 *
 * Still validates access if:
 * - @TenantOptional() route WITH tenant context (user explicitly provided tenant ID)
 * - Default/tenant-required routes (tenant context is required)
 */
@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip validation for public routes
    }

    // Check if route is marked as tenant-optional
    const isTenantOptional = this.reflector.getAllAndOverride<boolean>(
      IS_TENANT_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);
    const user = request.user;

    // For tenant-optional routes without tenant context, skip validation
    if (isTenantOptional && (!tenantContext || !tenantContext.tenantId)) {
      return true;
    }

    // For tenant-required routes or tenant-optional routes WITH tenant context
    if (!tenantContext || !tenantContext.tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }

    if (!user || !user.id) {
      throw new ForbiddenException('User context is required');
    }

    const userTenantIds = user.tenants?.map((t: any) => t.id || t.tenantId) || [];

    if (!userTenantIds.includes(tenantContext.tenantId)) {
      throw new ForbiddenException(
        'You do not have access to this tenant/community',
      );
    }

    return true;
  }
}
