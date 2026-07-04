import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { CreateReportCommand } from './create-report.command';
import type { IReportRepository } from 'src/modules/security-moderation/domain/repositories/report.repository.interface';
import { Report } from 'src/modules/security-moderation/domain/entities/report.entity';
@CommandHandler(CreateReportCommand)
export class CreateReportHandler implements ICommandHandler<CreateReportCommand> {
  constructor(
    @Inject('IReportRepository')
    private readonly repository: IReportRepository,
  ) {}

  async execute(command: CreateReportCommand): Promise<string> {
    if (!command.targetUserId && !command.targetContentId) {
      throw new BadRequestException('Either targetUserId or targetContentId must be provided');
    }

    const report = Report.create({
      reporterId: command.reporterId,
      targetUserId: command.targetUserId,
      targetContentId: command.targetContentId,
      reason: command.reason,
      description: command.description,
    });

    await this.repository.save(report);
    return report.id;
  }
}
