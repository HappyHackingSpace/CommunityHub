import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/modules/iam/infrastructure/guards/jwt-auth.guard';
import { TenantAccessGuard } from 'src/shared/guards/tenant-access.guard';
import { TenantContextCompleteGuard } from 'src/shared/guards/tenant-context-complete.guard';
import { CurrentUser } from 'src/shared/infrastructure/decorators/current-user.decorator';
import { CreateSocialPostCommand } from '../../application/commands/create-social-post/create-social-post.command';
import { UpdatePostCommand } from '../../application/commands/update-post/update-post.command';
import { LikePostCommand } from '../../application/commands/like-post/like-post.command';
import { UnlikePostCommand } from '../../application/commands/unlike-post/unlike-post.command';
import { DeletePostCommand } from '../../application/commands/delete-post/delete-post.command';
import { GetFeedQuery } from '../../application/queries/get-feed/get-feed.query';
import { GetSocialPostsQuery } from '../../application/queries/get-social-posts/get-social-posts.query';
import { CreateSocialPostDto } from '../../application/dto/create-social-post.dto';
import { UpdateSocialPostDto } from '../../application/dto/update-social-post.dto';
import { SocialPostResponseDto } from '../../application/dto/social-post-response.dto';
import { ActivityFeedResponseDto } from '../../application/dto/activity-feed-response.dto';

@Controller('activity-feed')
@UseGuards(JwtAuthGuard, TenantContextCompleteGuard, TenantAccessGuard)
export class ActivityFeedController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('feed')
  async getFeed(
    @Query('userId') userId?: string,
    @Query('activityType') activityType?: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<{ items: ActivityFeedResponseDto[]; total: number }> {
    return this.queryBus.execute(
      new GetFeedQuery(userId, activityType as any, limit, offset),
    );
  }

  @Get('posts')
  async getSocialPosts(
    @Query('authorId') authorId?: string,
    @Query('status') status?: string,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ): Promise<{ items: SocialPostResponseDto[]; total: number }> {
    return this.queryBus.execute(
      new GetSocialPostsQuery(authorId, status as any, limit, offset),
    );
  }

  @Post('posts')
  async createPost(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSocialPostDto,
  ): Promise<{ postId: string }> {
    const postId = await this.commandBus.execute(
      new CreateSocialPostCommand(userId, dto.content, dto.imageUrls),
    );
    return { postId };
  }

  @Post('posts/:postId/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  async likePost(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.commandBus.execute(new LikePostCommand(postId, userId));
  }

  @Post('posts/:postId/unlike')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlikePost(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.commandBus.execute(new UnlikePostCommand(postId, userId));
  }

  @Patch('posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('postId') postId: string,
    @Body() dto: UpdateSocialPostDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(postId, dto.content));
  }

  @Delete('posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(postId));
  }
}
