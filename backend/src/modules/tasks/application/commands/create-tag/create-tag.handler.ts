import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { CreateTagCommand } from './create-tag.command';
import { Tag } from '../../../domain/entities/tag.entity';
import type { ITagRepository } from '../../../domain/repositories/tag.repository.interface';

@CommandHandler(CreateTagCommand)
export class CreateTagHandler implements ICommandHandler<CreateTagCommand> {
  constructor(
    @Inject('ITagRepository')
    private readonly tagRepository: ITagRepository,
  ) {}

  async execute(command: CreateTagCommand): Promise<Tag> {
    // Check if tag with same name already exists
    const existingTag = await this.tagRepository.findByName(command.name);

    if (existingTag) {
      throw new ConflictException('Tag with this name already exists');
    }

    const tag = Tag.create({
      name: command.name,
      color: command.color,
    });

    return await this.tagRepository.save(tag);
  }
}
