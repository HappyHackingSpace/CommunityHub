import { ApiKey } from '../entities/api-key.entity';

export interface IApiKeyRepository {
  save(apiKey: ApiKey): Promise<ApiKey>;
  findByKey(key: string): Promise<ApiKey | null>;
  findById(id: string): Promise<ApiKey | null>;
  findByUserId(userId: string): Promise<ApiKey[]>;
  findByTenantId(tenantId: string): Promise<ApiKey[]>;
  delete(id: string): Promise<void>;
}
