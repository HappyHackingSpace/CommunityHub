import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetApiKeyUsageQuery } from './get-api-key-usage.query';
import type { IApiKeyUsageLogRepository } from 'src/modules/iam/domain/repositories/api-key-usage-log.repository.interface';
import type { IApiKeyRepository } from 'src/modules/iam/domain/repositories/api-key.repository.interface';

export interface ApiKeyUsageStatsResponse {
  apiKeyId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  successRate: number;
}

@QueryHandler(GetApiKeyUsageQuery)
export class GetApiKeyUsageHandler implements IQueryHandler<GetApiKeyUsageQuery> {
  constructor(
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
    @Inject('IApiKeyUsageLogRepository')
    private readonly usageLogRepository: IApiKeyUsageLogRepository,
  ) {}

  async execute(query: GetApiKeyUsageQuery): Promise<ApiKeyUsageStatsResponse> {
    // Verify API key exists
    const apiKey = await this.apiKeyRepository.findById(query.apiKeyId);
    if (!apiKey) {
      throw new NotFoundException(`API key not found: ${query.apiKeyId}`);
    }

    // Default time range: last 30 days
    const to = query.to || new Date();
    const from = query.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get usage stats
    const stats = await this.usageLogRepository.getUsageStats(query.apiKeyId, from, to);

    const successRate =
      stats.totalRequests > 0
        ? (stats.successfulRequests / stats.totalRequests) * 100
        : 0;

    return {
      apiKeyId: query.apiKeyId,
      totalRequests: stats.totalRequests,
      successfulRequests: stats.successfulRequests,
      failedRequests: stats.failedRequests,
      averageResponseTime: stats.averageResponseTime,
      successRate,
    };
  }
}
