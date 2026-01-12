import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import type { IApiKeyRepository } from '../../domain/repositories/api-key.repository.interface';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface';
import type { ICommunityMemberRepository } from 'src/modules/communities/domain/repositories/community-member.repository.interface';
import { ApiKeyGeneratorService } from '../../domain/services/api-key-generator.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(
    @Inject('IApiKeyRepository')
    private apiKeyRepository: IApiKeyRepository,
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    @Inject('ICommunityMemberRepository')
    private communityMemberRepository: ICommunityMemberRepository,
    private apiKeyGenerator: ApiKeyGeneratorService,
  ) {
    super();
  }

  async validate(token: string): Promise<any> {
    // Parse token: format is "key:secret"
    const parts = token.split(':');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid API key format');
    }

    const [key, secret] = parts;

    // Find API key by key
    const apiKey = await this.apiKeyRepository.findByKey(key);
    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Verify secret against hash
    const isValid = await this.apiKeyGenerator.verifySecret(secret, apiKey.secretHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid API secret');
    }

    // Check status and expiration
    if (!apiKey.isActive()) {
      throw new UnauthorizedException('API key is inactive or revoked');
    }

    if (apiKey.isExpired()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Load user
    const user = await this.userRepository.findById(apiKey.userId);
    if (!user || !user.isActive()) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Update last used timestamp
    apiKey.updateLastUsed();
    await this.apiKeyRepository.save(apiKey);

    const tenants = await this.communityMemberRepository.findUserTenantsWithCommunityInfo(user.id);

    // Return context for request
    return {
      id: user.id,
      userId: user.id,
      email: user.email,
      roles: user.roles,
      tenantId: apiKey.tenantId,
      tenants,
      scopes: apiKey.scopes,
      authType: 'api-key',
      apiKeyId: apiKey.id,
      rateLimitTier: apiKey.rateLimitTier,
    };
  }
}
