import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { CreateSocialPostCommand } from './create-social-post.command';
import { SocialPost } from 'src/modules/activity-feed/domain/entities/social-post.entity';
import type { ISocialPostRepository } from 'src/modules/activity-feed/domain/repositories/social-post.repository.interface';
import { TENANT_CONTEXT_KEY, TenantContext } from 'src/shared/context/tenant-context';


@CommandHandler(CreateSocialPostCommand)
export class CreateSocialPostHandler implements ICommandHandler<CreateSocialPostCommand> {
  constructor(
    @Inject('ISocialPostRepository')
    private readonly repository: ISocialPostRepository,
    private readonly cls: ClsService,
  ) {}

  async execute(command: CreateSocialPostCommand): Promise<string> {
    const tenantId = this.cls.get<TenantContext>(TENANT_CONTEXT_KEY)?.tenantId;
    
    const post = SocialPost.create({
      tenantId: tenantId || null,
      authorId: command.authorId,
      content: command.content,
      imageUrls: command.imageUrls,
    });

    await this.repository.save(post);
    return post.id;
  }
}
