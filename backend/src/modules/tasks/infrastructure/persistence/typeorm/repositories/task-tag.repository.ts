import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITaskTagRepository } from '../../../../domain/repositories/task-tag.repository.interface';
import { TaskOrmEntity } from '../entities/task.orm-entity';
import { TagOrmEntity } from '../entities/tag.orm-entity';

@Injectable()
export class TaskTagRepository implements ITaskTagRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly taskRepository: Repository<TaskOrmEntity>,
    @InjectRepository(TagOrmEntity)
    private readonly tagRepository: Repository<TagOrmEntity>,
  ) {}

  async attachTags(taskId: string, tagIds: string[]): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['tags'],
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const tags = await this.tagRepository.findByIds(tagIds);

    // Add new tags without removing existing ones
    const existingTagIds = new Set(task.tags.map(t => t.id));
    const newTags = tags.filter(tag => !existingTagIds.has(tag.id));

    task.tags = [...task.tags, ...newTags];
    await this.taskRepository.save(task);
  }

  async detachTag(taskId: string, tagId: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['tags'],
    });

    if (!task) {
      throw new Error('Task not found');
    }

    task.tags = task.tags.filter((tag) => tag.id !== tagId);
    await this.taskRepository.save(task);
  }

  async findTagIdsByTaskId(taskId: string): Promise<string[]> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['tags'],
    });

    return task ? task.tags.map((tag) => tag.id) : [];
  }

  async findTaskIdsByTagId(tagId: string): Promise<string[]> {
    const tag = await this.tagRepository.findOne({
      where: { id: tagId },
      relations: ['tasks'],
    });

    return tag ? tag.tasks.map((task) => task.id) : [];
  }

  async detachAllTagsFromTask(taskId: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['tags'],
    });

    if (task) {
      task.tags = [];
      await this.taskRepository.save(task);
    }
  }
}
