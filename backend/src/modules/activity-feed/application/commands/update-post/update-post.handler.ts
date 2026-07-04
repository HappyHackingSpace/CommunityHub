import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { UpdatePostCommand } from './update-post.command';
import type { ISocialPostRepository } from 'src/modules/activity-feed/domain/repositories/social-post.repository.interface';

@CommandHandler(UpdatePostCommand)
export class UpdatePostHandler implements ICommandHandler<UpdatePostCommand> {
  constructor(
    @Inject('ISocialPostRepository')
    private readonly repository: ISocialPostRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const post = await this.repository.findById(command.postId);
    if (!post) {
      throw new BadRequestException('Post not found');
    }

    post.updateContent(command.content);
    await this.repository.save(post);
  }
}
