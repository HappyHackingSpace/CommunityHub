import { ApiKeyUsageLog } from '../entities/api-key-usage-log.entity';

export interface IApiKeyUsageLogRepository {
  save(log: ApiKeyUsageLog): Promise<ApiKeyUsageLog>;
  findByApiKeyId(apiKeyId: string, limit?: number): Promise<ApiKeyUsageLog[]>;
  getUsageStats(
    apiKeyId: string,
    from: Date,
    to: Date,
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  }>;
}
