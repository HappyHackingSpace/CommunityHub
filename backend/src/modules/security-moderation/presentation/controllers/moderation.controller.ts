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
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateReportCommand } from '../../application/commands/create-report/create-report.command';
import { ResolveReportCommand } from '../../application/commands/resolve-report/resolve-report.command';
import { BanUserCommand } from '../../application/commands/ban-user/ban-user.command';
import { GetReportsQuery } from '../../application/queries/get-reports/get-reports.query';
import { GetRolesQuery } from '../../application/queries/get-roles/get-roles.query';
import { CreateReportDto } from '../../application/dto/create-report.dto';
import { ResolveReportDto } from '../../application/dto/resolve-report.dto';
import { BanUserDto } from '../../application/dto/ban-user.dto';

@Controller('security-moderation')
export class ModerationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('reports')
  async createReport(
    @Req() req: any,
    @Body() dto: CreateReportDto,
  ): Promise<{ reportId: string }> {
    const reportId = await this.commandBus.execute(
      new CreateReportCommand(
        req.user.id,
        dto.targetUserId,
        dto.targetContentId,
        dto.reason,
        dto.description,
      ),
    );
    return { reportId };
  }

  @Get('reports')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async resolveReport(
    @Req() req: any,
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReportDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new ResolveReportCommand(reportId, req.user.id, dto.resolutionNotes),
    );
  }

  @Post('users/:userId/ban')
  @HttpCode(HttpStatus.NO_CONTENT)
  async banUser(
    @Req() req: any,
    @Param('userId') userId: string,
    @Body() dto: BanUserDto,
  ): Promise<void> {
    const banUntil = dto.banUntil ? new Date(dto.banUntil) : undefined;
    await this.commandBus.execute(
      new BanUserCommand(userId, dto.action, dto.reason, req.user.id, banUntil),
    );
  }

  @Get('roles')
  async getRoles(): Promise<any> {
    return this.queryBus.execute(new GetRolesQuery());
  }
}
