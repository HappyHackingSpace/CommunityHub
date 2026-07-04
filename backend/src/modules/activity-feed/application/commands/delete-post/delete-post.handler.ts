import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { DeletePostCommand } from './delete-post.command';
import type { ISocialPostRepository } from 'src/modules/activity-feed/domain/repositories/social-post.repository.interface';

@CommandHandler(DeletePostCommand)
export class DeletePostHandler implements ICommandHandler<DeletePostCommand> {
  constructor(
    @Inject('ISocialPostRepository')
    private readonly repository: ISocialPostRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<void> {
    const post = await this.repository.findById(command.postId);
    if (!post) {
      throw new BadRequestException('Post not found');
    }

    post.delete();
    await this.repository.save(post);
  }
}
