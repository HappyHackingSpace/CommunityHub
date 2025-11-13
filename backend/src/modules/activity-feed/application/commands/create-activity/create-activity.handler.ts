import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateActivityCommand } from './create-activity.command';
import { ActivityFeedItem } from 'src/modules/activity-feed/domain/entities/activity-feed-item.entity';
import  type { IActivityFeedItemRepository } from 'src/modules/activity-feed/domain/repositories/activity-feed-item.repository.interface';
import { ActivityMetadata } from 'src/modules/activity-feed/domain/value-objects/activity-metadata.vo';


@CommandHandler(CreateActivityCommand)
export class CreateActivityHandler implements ICommandHandler<CreateActivityCommand> {
  constructor(
    @Inject('IActivityFeedItemRepository')
    private readonly repository: IActivityFeedItemRepository,
  ) {}

  async execute(command: CreateActivityCommand): Promise<string> {
    const metadata = ActivityMetadata.create(command.metadata);
    const activity = ActivityFeedItem.create({
      userId: command.userId,
      activityType: command.activityType,
      metadata,
    });

    await this.repository.save(activity);
    return activity.id;
  }
}
