import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { UnlikePostCommand } from './unlike-post.command';
import  type { ISocialPostRepository } from 'src/modules/activity-feed/domain/repositories/social-post.repository.interface';

@CommandHandler(UnlikePostCommand)
export class UnlikePostHandler implements ICommandHandler<UnlikePostCommand> {
  constructor(
    @Inject('ISocialPostRepository')
    private readonly repository: ISocialPostRepository,
  ) {}

  async execute(command: UnlikePostCommand): Promise<void> {
    const post = await this.repository.findById(command.postId);
    if (!post) {
      throw new BadRequestException('Post not found');
    }

    post.decrementLikes();
    await this.repository.save(post);
  }
}
