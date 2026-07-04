import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RevokeApiKeyCommand } from './revoke-api-key.command';
import type { IApiKeyRepository } from 'src/modules/iam/domain/repositories/api-key.repository.interface';

@CommandHandler(RevokeApiKeyCommand)
export class RevokeApiKeyHandler implements ICommandHandler<RevokeApiKeyCommand> {
  constructor(
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
  ) {}

  async execute(command: RevokeApiKeyCommand): Promise<void> {
    const apiKey = await this.apiKeyRepository.findById(command.apiKeyId);

    if (!apiKey) {
      throw new NotFoundException(`API key not found: ${command.apiKeyId}`);
    }

    apiKey.revoke();
    await this.apiKeyRepository.save(apiKey);
  }
}
