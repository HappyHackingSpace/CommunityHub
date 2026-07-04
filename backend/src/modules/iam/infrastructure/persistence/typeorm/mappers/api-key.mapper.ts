import { ApiKey } from '../../../../domain/entities/api-key.entity';
import { ApiKeyOrmEntity } from '../entities/api-key.orm-entity';

export class ApiKeyMapper {
  static toPersistence(apiKey: ApiKey): ApiKeyOrmEntity {
    const ormEntity = new ApiKeyOrmEntity();

    ormEntity.id = apiKey.id;
    ormEntity.name = apiKey.name;
    ormEntity.key = apiKey.key;
    ormEntity.secretHash = apiKey.secretHash;
    ormEntity.userId = apiKey.userId;
    ormEntity.tenantId = apiKey.tenantId;
    ormEntity.scopes = apiKey.scopes;
    ormEntity.rateLimitTier = apiKey.rateLimitTier;
    ormEntity.expiresAt = apiKey.expiresAt;
    ormEntity.lastUsedAt = apiKey.lastUsedAt;
    ormEntity.status = apiKey.status;
    ormEntity.metadata = apiKey.metadata;
    ormEntity.createdAt = apiKey.createdAt;
    ormEntity.updatedAt = apiKey.updatedAt;

    return ormEntity;
  }

  static toDomain(ormEntity: ApiKeyOrmEntity): ApiKey {
    return ApiKey.restore(
      ormEntity.id,
      ormEntity.name,
      ormEntity.key,
      ormEntity.secretHash,
      ormEntity.userId,
      ormEntity.tenantId,
      ormEntity.scopes,
      ormEntity.rateLimitTier,
      ormEntity.status,
      ormEntity.expiresAt,
      ormEntity.lastUsedAt,
      ormEntity.metadata,
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
