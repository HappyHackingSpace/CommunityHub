import { ActivityType } from "src/modules/activity-feed/domain/enums/activity-type.enum";

export class GetFeedQuery {
  constructor(
    public readonly userId?: string,
    public readonly activityType?: ActivityType,
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}
