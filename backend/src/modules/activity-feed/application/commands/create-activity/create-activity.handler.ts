import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { CreateActivityCommand } from './create-activity.command';
import { ActivityFeedItem } from 'src/modules/activity-feed/domain/entities/activity-feed-item.entity';
import  type { IActivityFeedItemRepository } from 'src/modules/activity-feed/domain/repositories/activity-feed-item.repository.interface';
import { ActivityMetadata } from 'src/modules/activity-feed/domain/value-objects/activity-metadata.vo';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';


@CommandHandler(CreateActivityCommand)
export class CreateActivityHandler implements ICommandHandler<CreateActivityCommand> {
  constructor(
    @Inject('IActivityFeedItemRepository')
    private readonly repository: IActivityFeedItemRepository,
    private readonly cls: ClsService,
  ) {}

  async execute(command: CreateActivityCommand): Promise<string> {
    const tenantId = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY)?.tenantId;

    if (!tenantId) {
       // Activity usually needs a tenant
    }

    const metadata = ActivityMetadata.create(command.metadata);
    const activity = ActivityFeedItem.create({
      tenantId: tenantId!,
      userId: command.userId,
      activityType: command.activityType,
      metadata,
    });

    await this.repository.save(activity);
    return activity.id;
  }
}
