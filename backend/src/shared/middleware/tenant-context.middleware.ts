import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { TENANT_CONTEXT_KEY, TenantContext } from '../context/tenant-context';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.extractTenantId(req);
    const user = (req as any).user;

    if (!tenantId && !this.isPublicRoute(req.path)) {
      throw new BadRequestException(
        'Tenant context is required. Provide X-Tenant-Id header or tenantId in query params.',
      );
    }

    if (tenantId && user) {
      const tenantContext: TenantContext = {
        tenantId,
        userId: user.id || user.sub,
        globalRole: user.globalRole || 'USER',
        tenants: user.tenants,
      };

      this.cls.set(TENANT_CONTEXT_KEY, tenantContext);
    }

    next();
  }

  private extractTenantId(req: Request): number | null {
    const headerTenantId = req.headers['x-tenant-id'];
    const queryTenantId = req.query['tenantId'];

    let tenantId: number | null = null;

    if (typeof headerTenantId === 'string') {
      tenantId = parseInt(headerTenantId, 10);
    } else if (typeof queryTenantId === 'string') {
      tenantId = parseInt(queryTenantId, 10);
    }

    return tenantId !== null && !isNaN(tenantId) ? tenantId : null;
  }

  private isPublicRoute(path: string): boolean {
    const publicRoutes = [
      '/api/auth',
      '/api/health',
      '/swagger',
      '/api-docs',
    ];
    return publicRoutes.some(route => path.startsWith(route));
  }
}
