import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/modules/iam/infrastructure/guards/jwt-auth.guard';
import { TenantAccessGuard } from 'src/shared/guards/tenant-access.guard';
import { TenantContextCompleteGuard } from 'src/shared/guards/tenant-context-complete.guard';
import { RolesGuard } from 'src/modules/iam/infrastructure/guards/roles.guard';
import { Roles } from 'src/modules/iam/infrastructure/decorators/roles.decorator';
import { RoleType } from 'src/modules/iam/domain/enums/role-type.enum';
import { CurrentUser } from 'src/shared/infrastructure/decorators/current-user.decorator';
import { CreateReportCommand } from '../../application/commands/create-report/create-report.command';
import { ResolveReportCommand } from '../../application/commands/resolve-report/resolve-report.command';
import { BanUserCommand } from '../../application/commands/ban-user/ban-user.command';
import { GetReportsQuery } from '../../application/queries/get-reports/get-reports.query';
import { GetRolesQuery } from '../../application/queries/get-roles/get-roles.query';
import { CreateReportDto } from '../../application/dto/create-report.dto';
import { ResolveReportDto } from '../../application/dto/resolve-report.dto';
import { BanUserDto } from '../../application/dto/ban-user.dto';

@Controller('security-moderation')
@UseGuards(JwtAuthGuard, TenantContextCompleteGuard, TenantAccessGuard, RolesGuard)
export class ModerationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('reports')
  async createReport(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReportDto,
  ): Promise<{ reportId: string }> {
    const reportId = await this.commandBus.execute(
      new CreateReportCommand(
        userId,
        dto.targetUserId,
        dto.targetContentId,
        dto.reason,
        dto.description,
      ),
    );
    return { reportId };
  }

  @Get('reports')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  async getReports(
    @Query('status') status?: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<any> {
    return this.queryBus.execute(
      new GetReportsQuery(status as any, limit, offset),
    );
  }

  @Post('reports/:reportId/resolve')
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async resolveReport(
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReportDto,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResolveReportCommand(reportId, userId, dto.resolutionNotes),
    );
  }

  @Post('users/:userId/ban')
  @Roles(RoleType.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Param('userId') userId: string,
    @Body() dto: BanUserDto,
    @CurrentUser('id') moderatorId: string,
  ): Promise<void> {
    const banUntil = dto.banUntil ? new Date(dto.banUntil) : undefined;
    await this.commandBus.execute(
      new BanUserCommand(userId, dto.action, dto.reason, moderatorId, banUntil),
    );
  }

  @Get('roles')
  async getRoles(): Promise<any> {
    return this.queryBus.execute(new GetRolesQuery());
  }
}
