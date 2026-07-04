import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { ResolveReportCommand } from './resolve-report.command';
import type { IReportRepository } from 'src/modules/security-moderation/domain/repositories/report.repository.interface';

@CommandHandler(ResolveReportCommand)
export class ResolveReportHandler implements ICommandHandler<ResolveReportCommand> {
  constructor(
    @Inject('IReportRepository')
    private readonly repository: IReportRepository,
  ) {}

  async execute(command: ResolveReportCommand): Promise<void> {
    const report = await this.repository.findById(command.reportId);
    if (!report) {
      throw new BadRequestException('Report not found');
    }

    report.resolve(command.moderatorId, command.resolutionNotes);
    await this.repository.save(report);
  }
}
