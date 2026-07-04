import { ApiKeyUsageLog } from '../../../../domain/entities/api-key-usage-log.entity';
import { ApiKeyUsageLogOrmEntity } from '../entities/api-key-usage-log.orm-entity';

export class ApiKeyUsageLogMapper {
  static toPersistence(log: ApiKeyUsageLog): ApiKeyUsageLogOrmEntity {
    const ormEntity = new ApiKeyUsageLogOrmEntity();

    ormEntity.id = log.id;
    ormEntity.apiKeyId = log.apiKeyId;
    ormEntity.endpoint = log.endpoint;
    ormEntity.method = log.method;
    ormEntity.statusCode = log.statusCode;
    ormEntity.ipAddress = log.ipAddress;
    ormEntity.userAgent = log.userAgent;
    ormEntity.responseTimeMs = log.responseTimeMs;
    ormEntity.createdAt = log.createdAt;

    return ormEntity;
  }

  static toDomain(ormEntity: ApiKeyUsageLogOrmEntity): ApiKeyUsageLog {
    return ApiKeyUsageLog.restore(
      ormEntity.id,
      ormEntity.apiKeyId,
      ormEntity.endpoint,
      ormEntity.method,
      ormEntity.statusCode,
      ormEntity.ipAddress,
      ormEntity.userAgent,
      ormEntity.responseTimeMs,
      ormEntity.createdAt,
    );
  }
}
