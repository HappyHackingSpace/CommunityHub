import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetApiKeyQuery } from './get-api-key.query';
import type { IApiKeyRepository } from 'src/modules/iam/domain/repositories/api-key.repository.interface';
import type { ApiKey } from 'src/modules/iam/domain/entities/api-key.entity';

@QueryHandler(GetApiKeyQuery)
export class GetApiKeyHandler implements IQueryHandler<GetApiKeyQuery> {
  constructor(
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
  ) {}

  async execute(query: GetApiKeyQuery): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findById(query.apiKeyId);

    if (!apiKey) {
      throw new NotFoundException(`API key not found: ${query.apiKeyId}`);
    }

    return apiKey;
  }
}
