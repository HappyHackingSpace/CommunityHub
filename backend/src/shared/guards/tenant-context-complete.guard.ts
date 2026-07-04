import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { TENANT_CONTEXT_KEY, TenantContext } from '../context/tenant-context';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * TenantContextCompleteGuard - Enriches tenant context with user information
 *
 * After JWT authentication, this guard enriches the tenant context with:
 * - userId: Authenticated user's ID
 * - globalRole: User's global role (ADMIN, SUPER_ADMIN, USER, etc.)
 *
 * Skips enrichment for @Public() routes since they have no authenticated user.
 */
@Injectable()
export class TenantContextCompleteGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cls: ClsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public - skip enrichment
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip enrichment for public routes
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // No user to enrich with
    }

    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);

    if (tenantContext) {
      this.cls.set(TENANT_CONTEXT_KEY, {
        ...tenantContext,
        userId: user.id || user.userId || user.sub,
        globalRole: user.globalRole || 'USER',
      });
    }

    return true;
  }
}
