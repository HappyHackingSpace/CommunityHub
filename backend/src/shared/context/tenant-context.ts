export interface TenantContext {
  tenantId: number;
  userId: string | null;
  globalRole: string | null;
  tenants?: Array<{ id: number; name: string }>;
}

export const TENANT_CONTEXT_KEY = 'tenantContext';
