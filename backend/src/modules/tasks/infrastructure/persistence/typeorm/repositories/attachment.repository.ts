import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAttachmentRepository } from '../../../../domain/repositories/attachment.repository.interface';
import { Attachment } from '../../../../domain/entities/attachment.entity';
import { AttachmentOrmEntity } from '../entities/attachment.orm-entity';
import { AttachmentMapper } from '../mappers/attachment.mapper';

@Injectable()
export class AttachmentRepository implements IAttachmentRepository {
  constructor(
    @InjectRepository(AttachmentOrmEntity)
    private readonly repository: Repository<AttachmentOrmEntity>,
  ) {}

  async save(attachment: Attachment): Promise<Attachment> {
    const ormEntity = AttachmentMapper.toPersistence(attachment);
    const saved = await this.repository.save(ormEntity);
    return AttachmentMapper.toDomain(saved);
  }

  async findById(id: string): Promise<Attachment | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    return ormEntity ? AttachmentMapper.toDomain(ormEntity) : null;
  }

  async findByTaskId(taskId: string): Promise<Attachment[]> {
    const ormEntities = await this.repository.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });
    return ormEntities.map((entity) => AttachmentMapper.toDomain(entity));
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByUploader(uploaderId: string): Promise<Attachment[]> {
    const ormEntities = await this.repository.find({
      where: { uploadedBy: uploaderId },
      order: { createdAt: 'DESC' },
    });
    return ormEntities.map((entity) => AttachmentMapper.toDomain(entity));
  }
}
