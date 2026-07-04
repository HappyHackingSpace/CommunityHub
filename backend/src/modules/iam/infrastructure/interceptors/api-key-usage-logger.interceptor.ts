import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import type { CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { IApiKeyUsageLogRepository } from '../../domain/repositories/api-key-usage-log.repository.interface';
import { ApiKeyUsageLog } from '../../domain/entities/api-key-usage-log.entity';

@Injectable()
export class ApiKeyUsageLoggerInterceptor implements NestInterceptor {
  constructor(
    @Inject('IApiKeyUsageLogRepository')
    private readonly usageLogRepository: IApiKeyUsageLogRepository,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.user?.authType !== 'api-key') {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(async () => {
        const responseTime = Date.now() - startTime;

        setImmediate(async () => {
          try {
            const log = ApiKeyUsageLog.create({
              apiKeyId: request.user.apiKeyId,
              endpoint: request.route?.path || request.originalUrl || 'unknown',
              method: request.method,
              statusCode: response.statusCode,
              ipAddress: this.getClientIp(request),
              userAgent: request.headers['user-agent'],
              responseTimeMs: responseTime,
            });

            await this.usageLogRepository.save(log);
          } catch (error) {
            console.error('Failed to log API key usage:', error);
          }
        });
      }),
    );
  }

  /**
   * Extract client IP from request
   * Handles X-Forwarded-For and other proxy headers
   */
  private getClientIp(request: any): string {
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    return request.ip || request.connection?.remoteAddress || 'unknown';
  }
}
