import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { AddAttachmentCommand } from './add-attachment.command';
import type { IAttachmentRepository } from '../../../domain/repositories/attachment.repository.interface';
import type { ITaskRepository } from '../../../domain/repositories/task.repository.interface';
import type { IActivityLogRepository } from '../../../domain/repositories/activity-log.repository.interface';
import { Attachment } from '../../../domain/entities/attachment.entity';
import { ActivityLog } from '../../../domain/entities/activity-log.entity';
import { ActivityAction } from '../../../domain/enums/activity-action.enum';

@CommandHandler(AddAttachmentCommand)
export class AddAttachmentHandler
  implements ICommandHandler<AddAttachmentCommand>
{
  constructor(
    @Inject('IAttachmentRepository')
    private readonly attachmentRepository: IAttachmentRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IActivityLogRepository')
    private readonly activityLogRepository: IActivityLogRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AddAttachmentCommand): Promise<Attachment> {
    // Verify task exists
    const task = await this.taskRepository.findById(command.taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${command.taskId} not found`);
    }

    // Create attachment
    const attachment = Attachment.create({
      taskId: command.taskId,
      uploadedBy: command.uploadedBy,
      fileName: command.fileName,
      fileUrl: command.fileUrl,
      fileSize: command.fileSize,
      mimeType: command.mimeType,
    });

    // Save attachment
    const savedAttachment = await this.attachmentRepository.save(attachment);

    // Log activity
    const activityLog = ActivityLog.create({
      taskId: command.taskId,
      userId: command.uploadedBy,
      action: ActivityAction.ATTACHMENT_ADDED,
      details: { fileName: command.fileName, fileSize: command.fileSize },
    });
    await this.activityLogRepository.save(activityLog);

    return savedAttachment;
  }
}
