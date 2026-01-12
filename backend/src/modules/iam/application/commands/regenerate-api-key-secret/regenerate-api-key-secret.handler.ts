import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { RegenerateApiKeySecretCommand } from './regenerate-api-key-secret.command';
import type { IApiKeyRepository } from 'src/modules/iam/domain/repositories/api-key.repository.interface';
import { ApiKeyGeneratorService } from 'src/modules/iam/domain/services/api-key-generator.service';


@CommandHandler(RegenerateApiKeySecretCommand)
export class RegenerateApiKeySecretHandler
  implements ICommandHandler<RegenerateApiKeySecretCommand>
{
  constructor(
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
    private readonly apiKeyGenerator: ApiKeyGeneratorService,
  ) {}

  async execute(
    command: RegenerateApiKeySecretCommand,
  ): Promise<{ plainSecret: string }> {
    const apiKey = await this.apiKeyRepository.findById(command.apiKeyId);

    if (!apiKey) {
      throw new NotFoundException(`API key not found: ${command.apiKeyId}`);
    }

    // Generate new secret
    const plainSecret = this.apiKeyGenerator.generateSecret();
    const secretHash = await this.apiKeyGenerator.hashSecret(plainSecret);

    // Update hash in entity
    apiKey.updateSecretHash(secretHash);

    // Save changes
    await this.apiKeyRepository.save(apiKey);

    return { plainSecret };
  }
}
