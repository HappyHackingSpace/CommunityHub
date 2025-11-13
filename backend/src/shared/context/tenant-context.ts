export interface TenantContext {
  tenantId: number;
  userId: string;
  globalRole: string;
  tenants?: Array<{ id: number; name: string }>;
}

export const TENANT_CONTEXT_KEY = 'tenantContext';
