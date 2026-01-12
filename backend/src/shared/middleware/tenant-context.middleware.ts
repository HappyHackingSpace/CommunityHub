import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { TENANT_CONTEXT_KEY, TenantContext } from '../context/tenant-context';


@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = this.extractTenantId(req);

 
    if (tenantId) {
      const tenantContext: TenantContext = {
        tenantId,
        userId: null as any, 
        globalRole: null as any, 
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
}
