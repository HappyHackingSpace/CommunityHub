import { PostStatus } from "src/modules/activity-feed/domain/enums/post-status.enum";

export class GetSocialPostsQuery {
  constructor(
    public readonly authorId?: string,
    public readonly status?: PostStatus,
    public readonly limit: number = 20,
    public readonly offset: number = 0,
  ) {}
}
