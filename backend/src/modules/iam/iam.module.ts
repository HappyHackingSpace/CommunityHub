import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserOrmEntity } from './infrastructure/persistence/typeorm/entities/user.orm-entity';
import { RoleOrmEntity } from './infrastructure/persistence/typeorm/entities/role.orm-entity';

import { UserRepository } from './infrastructure/persistence/typeorm/repositories/user.repository';

import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';

import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { GoogleAuthGuard } from './infrastructure/guards/google-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';

import { AuthController } from './presentation/controllers/auth.controller';
import { UsersController } from './presentation/controllers/users.controller';

import { RegisterUserHandler } from './application/commands/register-user/register-user.handler';
import { AssignRoleHandler } from './application/commands/assign-role/assign-role.handler';

import { GetUserHandler } from './application/queries/get-user/get-user.handler';

const CommandHandlers = [RegisterUserHandler, AssignRoleHandler];
const QueryHandlers = [GetUserHandler];

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([UserOrmEntity, RoleOrmEntity]),
    CqrsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UsersController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    GoogleStrategy,
    JwtStrategy,
    JwtAuthGuard,
    GoogleAuthGuard,
    RolesGuard,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: ['IUserRepository', JwtAuthGuard, RolesGuard],
})
export class IamModule {}