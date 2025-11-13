import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ActivityFeedItemOrmEntity } from './infrastructure/persistence/typeorm/entities/activity-feed-item.orm-entity';
import { SocialPostOrmEntity } from './infrastructure/persistence/typeorm/entities/social-post.orm-entity';

import { ActivityFeedItemRepository } from './infrastructure/persistence/typeorm/repositories/activity-feed-item.repository';
import { SocialPostRepository } from './infrastructure/persistence/typeorm/repositories/social-post.repository';

import { CreateActivityHandler } from './application/commands/create-activity/create-activity.handler';
import { CreateSocialPostHandler } from './application/commands/create-social-post/create-social-post.handler';
import { LikePostHandler } from './application/commands/like-post/like-post.handler';
import { UnlikePostHandler } from './application/commands/unlike-post/unlike-post.handler';
import { DeletePostHandler } from './application/commands/delete-post/delete-post.handler';

import { GetFeedHandler } from './application/queries/get-feed/get-feed.handler';
import { GetSocialPostsHandler } from './application/queries/get-social-posts/get-social-posts.handler';

import { ActivityFeedController } from './presentation/controllers/activity-feed.controller';

const CommandHandlers = [
  CreateActivityHandler,
  CreateSocialPostHandler,
  LikePostHandler,
  UnlikePostHandler,
  DeletePostHandler,
];

const QueryHandlers = [
  GetFeedHandler,
  GetSocialPostsHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityFeedItemOrmEntity,
      SocialPostOrmEntity,
    ]),
    CqrsModule,
  ],
  controllers: [ActivityFeedController],
  providers: [
    {
      provide: 'IActivityFeedItemRepository',
      useClass: ActivityFeedItemRepository,
    },
    {
      provide: 'ISocialPostRepository',
      useClass: SocialPostRepository,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [
    'IActivityFeedItemRepository',
    'ISocialPostRepository',
  ],
})
export class ActivityFeedModule {}
