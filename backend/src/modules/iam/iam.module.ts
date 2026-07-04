import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserOrmEntity } from './infrastructure/persistence/typeorm/entities/user.orm-entity';
import { ApiKeyOrmEntity } from './infrastructure/persistence/typeorm/entities/api-key.orm-entity';
import { ApiKeyUsageLogOrmEntity } from './infrastructure/persistence/typeorm/entities/api-key-usage-log.orm-entity';

import { UserRepository } from './infrastructure/persistence/typeorm/repositories/user.repository';
import { ApiKeyRepository } from './infrastructure/persistence/typeorm/repositories/api-key.repository';
import { ApiKeyUsageLogRepository } from './infrastructure/persistence/typeorm/repositories/api-key-usage-log.repository';

import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
// import { ApiKeyStrategy } from './infrastructure/strategies/api-key.strategy';

import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { GoogleAuthGuard } from './infrastructure/guards/google-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
// import { ApiKeyAuthGuard } from './infrastructure/guards/api-key-auth.guard';
import { FlexibleAuthGuard } from './infrastructure/guards/flexible-auth.guard';
import { ScopesGuard } from './infrastructure/guards/scopes.guard';
import { ApiKeyThrottlerGuard } from './infrastructure/guards/api-key-throttler.guard';

import { AuthController } from './presentation/controllers/auth.controller';
import { UsersController } from './presentation/controllers/users.controller';
// import { ApiKeysController } from './presentation/controllers/api-keys.controller';

import { ApiKeyGeneratorService } from './domain/services/api-key-generator.service';

import { RegisterUserHandler } from './application/commands/register-user/register-user.handler';
import { AssignRoleHandler } from './application/commands/assign-role/assign-role.handler';
import { CreateApiKeyHandler } from './application/commands/create-api-key/create-api-key.handler';
import { RevokeApiKeyHandler } from './application/commands/revoke-api-key/revoke-api-key.handler';
import { UpdateApiKeyHandler } from './application/commands/update-api-key/update-api-key.handler';
import { RegenerateApiKeySecretHandler } from './application/commands/regenerate-api-key-secret/regenerate-api-key-secret.handler';
import { UpdateProfileHandler } from './application/commands/update-profile/update-profile.handler';

import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { GetApiKeysHandler } from './application/queries/get-api-keys/get-api-keys.handler';
import { GetApiKeyHandler } from './application/queries/get-api-key/get-api-key.handler';
import { GetApiKeyUsageHandler } from './application/queries/get-api-key-usage/get-api-key-usage.handler';
import { CommunitiesModule } from '../communities/communities.module';


const CommandHandlers = [
  RegisterUserHandler,
  AssignRoleHandler,
  CreateApiKeyHandler,
  RevokeApiKeyHandler,
  UpdateApiKeyHandler,
  RegenerateApiKeySecretHandler,
  UpdateProfileHandler,
];
const QueryHandlers = [
  GetUserHandler,
  GetApiKeysHandler,
  GetApiKeyHandler,
  GetApiKeyUsageHandler,
];

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => CommunitiesModule),
    TypeOrmModule.forFeature([
      UserOrmEntity,
      ApiKeyOrmEntity,
      ApiKeyUsageLogOrmEntity,
    ]),
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get('JWT_SECRET');
        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [
    AuthController,
    UsersController,
    // ApiKeysController, // Temporarily disabled: API key endpoints
  ],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IApiKeyRepository',
      useClass: ApiKeyRepository,
    },
    {
      provide: 'IApiKeyUsageLogRepository',
      useClass: ApiKeyUsageLogRepository,
    },
    GoogleStrategy,
    JwtStrategy,
    // ApiKeyStrategy, // Temporarily disabled: API key auth
    JwtAuthGuard,
    GoogleAuthGuard,
    RolesGuard,
    // ApiKeyAuthGuard, // Temporarily disabled: API key auth
    FlexibleAuthGuard,
    ScopesGuard,
    ApiKeyThrottlerGuard,
    ApiKeyGeneratorService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    'IUserRepository',
    'IApiKeyRepository',
    'IApiKeyUsageLogRepository',
    JwtAuthGuard,
    RolesGuard,
    // ApiKeyAuthGuard, // Temporarily disabled: API key auth
    FlexibleAuthGuard,
    ScopesGuard,
    ApiKeyThrottlerGuard,
    ApiKeyGeneratorService,
  ],
})
export class IamModule {}
