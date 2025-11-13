import { ActivityType } from "src/modules/activity-feed/domain/enums/activity-type.enum";
import { ActivityMetadataProps } from "src/modules/activity-feed/domain/value-objects/activity-metadata.vo";

export class CreateActivityCommand {
  constructor(
    public readonly userId: string,
    public readonly activityType: ActivityType,
    public readonly metadata: ActivityMetadataProps,
  ) {}
}
