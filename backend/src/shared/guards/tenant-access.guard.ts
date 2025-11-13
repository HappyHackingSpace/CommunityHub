import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { TENANT_CONTEXT_KEY, TenantContext } from '../context/tenant-context';

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(private cls: ClsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);
    const user = request.user;

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
