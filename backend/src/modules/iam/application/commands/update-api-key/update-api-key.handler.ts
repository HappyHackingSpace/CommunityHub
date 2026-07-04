import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateApiKeyCommand } from './update-api-key.command';
import type { IApiKeyRepository } from 'src/modules/iam/domain/repositories/api-key.repository.interface';
import { ApiKey } from 'src/modules/iam/domain/entities/api-key.entity';

@CommandHandler(UpdateApiKeyCommand)
export class UpdateApiKeyHandler implements ICommandHandler<UpdateApiKeyCommand> {
  constructor(
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
  ) {}

  async execute(command: UpdateApiKeyCommand): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findById(command.apiKeyId);

    if (!apiKey) {
      throw new NotFoundException(`API key not found: ${command.apiKeyId}`);
    }

    // Update fields if provided
    if (command.dto.name) {
      apiKey.updateName(command.dto.name);
    }

    if (command.dto.scopes) {
      apiKey.updateScopes(command.dto.scopes);
    }

    if (command.dto.rateLimitTier) {
      apiKey.updateRateLimitTier(command.dto.rateLimitTier);
    }

    if (command.dto.status) {
      if (command.dto.status === 'REVOKED') {
        apiKey.revoke();
      }
      // Note: EXPIRED is set automatically by the entity, not manually updated
    }

    await this.apiKeyRepository.save(apiKey);
    return apiKey;
  }
}
