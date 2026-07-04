import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateApiKeyCommand } from './create-api-key.command';
import type { IApiKeyRepository } from 'src/modules/iam/domain/repositories/api-key.repository.interface';
import { ApiKey } from 'src/modules/iam/domain/entities/api-key.entity';
import { ApiKeyStatus } from 'src/modules/iam/domain/enums/api-key-status.enum';
import { RateLimitTier } from 'src/modules/iam/domain/enums/rate-limit-tier.enum';
import { ApiKeyGeneratorService } from 'src/modules/iam/domain/services/api-key-generator.service';


const DEFAULT_API_KEY_EXPIRATION_DAYS = 90;

@CommandHandler(CreateApiKeyCommand)
export class CreateApiKeyHandler implements ICommandHandler<CreateApiKeyCommand> {
  constructor(
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
    private readonly apiKeyGenerator: ApiKeyGeneratorService,
  ) {}

  async execute(
    command: CreateApiKeyCommand,
  ): Promise<{ apiKey: ApiKey; plainSecret: string }> {
    const key = this.apiKeyGenerator.generateKey();
    const plainSecret = this.apiKeyGenerator.generateSecret();
    const secretHash = await this.apiKeyGenerator.hashSecret(plainSecret);

    const expiresAt =
      command.expiresAt || new Date(Date.now() + DEFAULT_API_KEY_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    const apiKey = ApiKey.create({
      name: command.name,
      key,
      secretHash,
      userId: command.userId,
      tenantId: command.tenantId,
      scopes: command.scopes,
      rateLimitTier: command.rateLimitTier || RateLimitTier.FREE,
      expiresAt,
      status: ApiKeyStatus.ACTIVE,
    });

    await this.apiKeyRepository.save(apiKey);

    return { apiKey, plainSecret };
  }
}
