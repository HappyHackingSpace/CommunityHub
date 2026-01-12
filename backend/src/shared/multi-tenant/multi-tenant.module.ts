import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { TenantContextMiddleware } from '../middleware/tenant-context.middleware';
import { TenantAccessGuard } from '../guards/tenant-access.guard';
import { TenantRoleGuard } from '../guards/tenant-role.guard';
import { TenantContextCompleteGuard } from '../guards/tenant-context-complete.guard';
import { TenantRequiredGuard } from '../guards/tenant-required.guard';
import { TenantQueryInterceptor } from '../interceptors/tenant-query.interceptor';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
  ],
  providers: [
    TenantContextMiddleware,
    TenantAccessGuard,
    TenantRoleGuard,
    TenantContextCompleteGuard,
    TenantRequiredGuard,
    TenantQueryInterceptor,
  ],
  exports: [
    TenantAccessGuard,
    TenantRoleGuard,
    TenantContextCompleteGuard,
    TenantRequiredGuard,
    TenantQueryInterceptor,
  ],
})
export class MultiTenantModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantContextMiddleware).forRoutes('*');
  }
}
