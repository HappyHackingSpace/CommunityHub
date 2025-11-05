import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../iam/infrastructure/guards/jwt-auth.guard';
import { CreateTagDto } from '../../application/dto/create-tag.dto';
import { TagResponseDto } from '../../application/dto/tag-response.dto';
import { CreateTagCommand } from '../../application/commands/create-tag/create-tag.command';
import { GetAllTagsQuery } from '../../application/queries/get-all-tags/get-all-tags.query';

@Controller('tags')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TagsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllTags(): Promise<TagResponseDto[]> {
    const query = new GetAllTagsQuery();
    return await this.queryBus.execute(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createTag(@Body() dto: CreateTagDto): Promise<TagResponseDto> {
    const command = new CreateTagCommand(dto.name, dto.color);
    const tag = await this.commandBus.execute(command);
    return TagResponseDto.fromDomain(tag);
  }
}
