export interface TenantContext {
  tenantId: string;
  userId: string | null;
  globalRole: string | null;
  tenants?: Array<{ id: string; name: string }>;
}

export const TENANT_CONTEXT_KEY = 'tenantContext';
