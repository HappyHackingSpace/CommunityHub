import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateSocialPostCommand } from './create-social-post.command';
import { SocialPost } from 'src/modules/activity-feed/domain/entities/social-post.entity';
import type { ISocialPostRepository } from 'src/modules/activity-feed/domain/repositories/social-post.repository.interface';


@CommandHandler(CreateSocialPostCommand)
export class CreateSocialPostHandler implements ICommandHandler<CreateSocialPostCommand> {
  constructor(
    @Inject('ISocialPostRepository')
    private readonly repository: ISocialPostRepository,
  ) {}

  async execute(command: CreateSocialPostCommand): Promise<string> {
    const post = SocialPost.create({
      authorId: command.authorId,
      content: command.content,
      imageUrls: command.imageUrls,
    });

    await this.repository.save(post);
    return post.id;
  }
}
