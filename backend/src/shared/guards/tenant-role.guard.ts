import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClsService } from 'nestjs-cls';
import { TENANT_CONTEXT_KEY, TenantContext } from '../context/tenant-context';

export const TENANT_ROLES_KEY = 'tenantRoles';

export const RequireTenantRole = (...roles: string[]) => (
  target: any,
  propertyKey?: string,
  descriptor?: PropertyDescriptor,
) => {
  Reflect.defineMetadata(TENANT_ROLES_KEY, roles, descriptor?.value || target);
};

@Injectable()
export class TenantRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private cls: ClsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      TENANT_ROLES_KEY,
      context.getHandler(),
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);
    const user = request.user;

    if (!tenantContext || !user) {
      throw new ForbiddenException('Tenant or user context is missing');
    }

    const userRoleInTenant = await this.getUserRoleInTenant(
      user.id,
      tenantContext.tenantId,
    );

    if (!requiredRoles.includes(userRoleInTenant)) {
      throw new ForbiddenException(
        `Required role(s): ${requiredRoles.join(', ')}. Your role: ${userRoleInTenant}`,
      );
    }

    return true;
  }

  private async getUserRoleInTenant(
    userId: string,
    tenantId: string,
  ): Promise<string> {
    // TODO: Implement database query to get user's role in this tenant
    // This should query club_members and club_roles tables
    // For now, return a default role
    return 'member';
  }
}
