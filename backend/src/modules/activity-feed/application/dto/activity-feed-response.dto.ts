export class ActivityFeedResponseDto {
  id: string;
  userId: string;
  activityType: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
