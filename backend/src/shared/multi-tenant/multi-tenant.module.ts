import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { TenantContextMiddleware } from '../middleware/tenant-context.middleware';
import { TenantAccessGuard } from '../guards/tenant-access.guard';
import { TenantRoleGuard } from '../guards/tenant-role.guard';
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
    TenantQueryInterceptor,
  ],
  exports: [
    TenantAccessGuard,
    TenantRoleGuard,
    TenantQueryInterceptor,
  ],
})
export class MultiTenantModule {}
