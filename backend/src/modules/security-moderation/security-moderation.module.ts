import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReportOrmEntity } from './infrastructure/persistence/typeorm/entities/report.orm-entity';
import { RoleOrmEntity } from './infrastructure/persistence/typeorm/entities/role.orm-entity';
import { UserBanOrmEntity } from './infrastructure/persistence/typeorm/entities/user-ban.orm-entity';

import { ReportRepository } from './infrastructure/persistence/typeorm/repositories/report.repository';
import { RoleRepository } from './infrastructure/persistence/typeorm/repositories/role.repository';
import { UserBanRepository } from './infrastructure/persistence/typeorm/repositories/user-ban.repository';

import { CreateReportHandler } from './application/commands/create-report/create-report.handler';
import { ResolveReportHandler } from './application/commands/resolve-report/resolve-report.handler';
import { BanUserHandler } from './application/commands/ban-user/ban-user.handler';

import { GetReportsHandler } from './application/queries/get-reports/get-reports.handler';
import { GetRolesHandler } from './application/queries/get-roles/get-roles.handler';

import { ContentReviewService } from './application/services/content-review.service';
import { ModerationController } from './presentation/controllers/moderation.controller';

const CommandHandlers = [
  CreateReportHandler,
  ResolveReportHandler,
  BanUserHandler,
];

const QueryHandlers = [
  GetReportsHandler,
  GetRolesHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReportOrmEntity,
      RoleOrmEntity,
      UserBanOrmEntity,
    ]),
    CqrsModule,
  ],
  controllers: [ModerationController],
  providers: [
    {
      provide: 'IReportRepository',
      useClass: ReportRepository,
    },
    {
      provide: 'IRoleRepository',
      useClass: RoleRepository,
    },
    {
      provide: 'IUserBanRepository',
      useClass: UserBanRepository,
    },
    ContentReviewService,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    'IReportRepository',
    'IRoleRepository',
    'IUserBanRepository',
    ContentReviewService,
  ],
})
export class SecurityModerationModule {}
