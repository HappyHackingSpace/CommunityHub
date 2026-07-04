import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { TenantAccessGuard } from '../../../../shared/guards/tenant-access.guard';
import { TenantContextCompleteGuard } from '../../../../shared/guards/tenant-context-complete.guard';
import { Roles } from '../../infrastructure/decorators/roles.decorator';
import { RoleType } from '../../domain/enums/role-type.enum';
import { CreateApiKeyDto } from '../../application/dto/create-api-key.dto';
import { UpdateApiKeyDto } from '../../application/dto/update-api-key.dto';
import { ApiKeyResponseDto } from '../../application/dto/api-key-response.dto';
import { CreateApiKeyCommand } from '../../application/commands/create-api-key/create-api-key.command';
import { RevokeApiKeyCommand } from '../../application/commands/revoke-api-key/revoke-api-key.command';
import { UpdateApiKeyCommand } from '../../application/commands/update-api-key/update-api-key.command';
import { RegenerateApiKeySecretCommand } from '../../application/commands/regenerate-api-key-secret/regenerate-api-key-secret.command';
import { GetApiKeysQuery } from '../../application/queries/get-api-keys/get-api-keys.query';
import { GetApiKeyQuery } from '../../application/queries/get-api-key/get-api-key.query';
import { GetApiKeyUsageQuery } from '../../application/queries/get-api-key-usage/get-api-key-usage.query';
import { ApiKey } from '../../domain/entities/api-key.entity';
import { RateLimitTier } from '../../domain/enums/rate-limit-tier.enum';

@ApiTags('API Keys')
@ApiBearerAuth()
@Controller('api-keys')
@UseGuards(JwtAuthGuard, TenantContextCompleteGuard, TenantAccessGuard)
export class ApiKeysController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new API key (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'API key created successfully (secret shown only once)',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async createApiKey(
    @Body() dto: CreateApiKeyDto,
    @Req() request,
  ): Promise<ApiKeyResponseDto> {
    const user = request.user;

    const tenantId = dto.tenantId || user.tenantId;

    const { apiKey, plainSecret } = await this.commandBus.execute(
      new CreateApiKeyCommand(
        dto.name,
        user.id,
        tenantId,
        dto.scopes,
        dto.rateLimitTier || RateLimitTier.FREE,
        dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      ),
    );

    return {
      ...this.toResponseDto(apiKey),
      secret: plainSecret,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys for current user' })
  @ApiResponse({ status: 200, description: 'List of API keys (no secrets)' })
  async listApiKeys(@Req() request): Promise<ApiKeyResponseDto[]> {
    const apiKeys = await this.queryBus.execute(
      new GetApiKeysQuery(request.user.id),
    );
    return apiKeys.map(key => this.toResponseDto(key));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get API key details' })
  @ApiResponse({ status: 200, description: 'API key details (no secret)' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async getApiKey(@Param('id') id: string): Promise<ApiKeyResponseDto> {
    const apiKey = await this.queryBus.execute(new GetApiKeyQuery(id));
    return this.toResponseDto(apiKey);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Update API key (Admin only)' })
  @ApiResponse({ status: 200, description: 'API key updated successfully' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async updateApiKey(
    @Param('id') id: string,
    @Body() dto: UpdateApiKeyDto,
  ): Promise<ApiKeyResponseDto> {
    const apiKey = await this.commandBus.execute(
      new UpdateApiKeyCommand(id, dto),
    );
    return this.toResponseDto(apiKey);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke API key (Admin only)' })
  @ApiResponse({ status: 204, description: 'API key revoked successfully' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async revokeApiKey(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new RevokeApiKeyCommand(id));
  }

  @Post(':id/regenerate')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Regenerate API key secret (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'New secret generated (shown only once)',
  })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async regenerateSecret(@Param('id') id: string): Promise<{ secret: string }> {
    const { plainSecret } = await this.commandBus.execute(
      new RegenerateApiKeySecretCommand(id),
    );
    return { secret: plainSecret };
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get API key usage statistics' })
  @ApiResponse({ status: 200, description: 'Usage statistics' })
  @ApiResponse({ status: 404, description: 'API key not found' })
  async getUsage(@Param('id') id: string): Promise<any> {
    return this.queryBus.execute(new GetApiKeyUsageQuery(id));
  }

  private toResponseDto(apiKey: ApiKey): ApiKeyResponseDto {
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key,
      userId: apiKey.userId,
      tenantId: apiKey.tenantId,
      scopes: apiKey.scopes,
      rateLimitTier: apiKey.rateLimitTier,
      expiresAt: apiKey.expiresAt,
      lastUsedAt: apiKey.lastUsedAt,
      status: apiKey.status,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
    };
  }
}
