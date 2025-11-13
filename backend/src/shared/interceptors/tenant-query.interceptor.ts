import {
  Injectable,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { TENANT_CONTEXT_KEY, TenantContext } from '../context/tenant-context';

@Injectable()
export class TenantQueryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TenantQueryInterceptor.name);

  constructor(private cls: ClsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const tenantContext = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY);

    if (!tenantContext && !this.isPublicEndpoint(request.path)) {
      this.logger.warn(
        `Query without tenant context: ${request.method} ${request.path}`,
      );
    }

    if (tenantContext) {
      this.logger.debug(
        `Processing request for tenant ${tenantContext.tenantId}: ${request.method} ${request.path}`,
      );
    }

    return next.handle();
  }

  private isPublicEndpoint(path: string): boolean {
    const publicEndpoints = ['/api/auth', '/api/health', '/swagger', '/api-docs'];
    return publicEndpoints.some(endpoint => path.startsWith(endpoint));
  }
}
