import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../../../domain/entities/api-key.entity';
import { IApiKeyRepository } from '../../../../domain/repositories/api-key.repository.interface';
import { ApiKeyOrmEntity } from '../entities/api-key.orm-entity';
import { ApiKeyMapper } from '../mappers/api-key.mapper';

@Injectable()
export class ApiKeyRepository implements IApiKeyRepository {
  constructor(
    @InjectRepository(ApiKeyOrmEntity)
    private readonly ormRepository: Repository<ApiKeyOrmEntity>,
  ) {}

  async save(apiKey: ApiKey): Promise<ApiKey> {
    const ormEntity = ApiKeyMapper.toPersistence(apiKey);
    const savedOrmEntity = await this.ormRepository.save(ormEntity);
    return ApiKeyMapper.toDomain(savedOrmEntity);
  }

  async findByKey(key: string): Promise<ApiKey | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { key },
    });
    return ormEntity ? ApiKeyMapper.toDomain(ormEntity) : null;
  }

  async findById(id: string): Promise<ApiKey | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id },
    });
    return ormEntity ? ApiKeyMapper.toDomain(ormEntity) : null;
  }

  async findByUserId(userId: string): Promise<ApiKey[]> {
    const ormEntities = await this.ormRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(ormEntity => ApiKeyMapper.toDomain(ormEntity));
  }

  async findByTenantId(tenantId: string): Promise<ApiKey[]> {
    const ormEntities = await this.ormRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map(ormEntity => ApiKeyMapper.toDomain(ormEntity));
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }
}
