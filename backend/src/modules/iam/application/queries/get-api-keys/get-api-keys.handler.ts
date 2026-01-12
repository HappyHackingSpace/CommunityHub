import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetApiKeysQuery } from './get-api-keys.query';
import type { IApiKeyRepository } from 'src/modules/iam/domain/repositories/api-key.repository.interface';
import { ApiKey } from 'src/modules/iam/domain/entities/api-key.entity';

@QueryHandler(GetApiKeysQuery)
export class GetApiKeysHandler implements IQueryHandler<GetApiKeysQuery> {
  constructor(
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
  ) {}

  async execute(query: GetApiKeysQuery): Promise<ApiKey[]> {
    return this.apiKeyRepository.findByUserId(query.userId);
  }
}
