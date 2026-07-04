import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ApiKeyUsageLog } from '../../../../domain/entities/api-key-usage-log.entity';
import { IApiKeyUsageLogRepository } from '../../../../domain/repositories/api-key-usage-log.repository.interface';
import { ApiKeyUsageLogOrmEntity } from '../entities/api-key-usage-log.orm-entity';
import { ApiKeyUsageLogMapper } from '../mappers/api-key-usage-log.mapper';

@Injectable()
export class ApiKeyUsageLogRepository implements IApiKeyUsageLogRepository {
  constructor(
    @InjectRepository(ApiKeyUsageLogOrmEntity)
    private readonly ormRepository: Repository<ApiKeyUsageLogOrmEntity>,
  ) {}

  async save(log: ApiKeyUsageLog): Promise<ApiKeyUsageLog> {
    const ormEntity = ApiKeyUsageLogMapper.toPersistence(log);
    const savedOrmEntity = await this.ormRepository.save(ormEntity);
    return ApiKeyUsageLogMapper.toDomain(savedOrmEntity);
  }

  async findByApiKeyId(apiKeyId: string, limit?: number): Promise<ApiKeyUsageLog[]> {
    const ormEntities = await this.ormRepository.find({
      where: { apiKeyId },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return ormEntities.map(ormEntity => ApiKeyUsageLogMapper.toDomain(ormEntity));
  }

  async getUsageStats(
    apiKeyId: string,
    from: Date,
    to: Date,
  ): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  }> {
    const logs = await this.ormRepository.find({
      where: {
        apiKeyId,
        createdAt: Between(from, to),
      },
    });

    const totalRequests = logs.length;
    const successfulRequests = logs.filter(log => log.statusCode >= 200 && log.statusCode < 300).length;
    const failedRequests = logs.filter(log => log.statusCode >= 400).length;

    const totalResponseTime = logs.reduce((sum, log) => sum + (log.responseTimeMs || 0), 0);
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
    };
  }
}
