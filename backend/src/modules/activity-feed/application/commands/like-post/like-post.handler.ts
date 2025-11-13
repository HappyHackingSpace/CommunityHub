import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { LikePostCommand } from './like-post.command';
import type { ISocialPostRepository } from 'src/modules/activity-feed/domain/repositories/social-post.repository.interface';

@CommandHandler(LikePostCommand)
export class LikePostHandler implements ICommandHandler<LikePostCommand> {
  constructor(
    @Inject('ISocialPostRepository')
    private readonly repository: ISocialPostRepository,
  ) {}

  async execute(command: LikePostCommand): Promise<void> {
    const post = await this.repository.findById(command.postId);
    if (!post) {
      throw new BadRequestException('Post not found');
    }

    post.incrementLikes();
    await this.repository.save(post);
  }
}
