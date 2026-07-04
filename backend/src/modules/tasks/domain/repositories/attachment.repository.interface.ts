import { Attachment } from '../entities/attachment.entity';

export interface IAttachmentRepository {
  save(attachment: Attachment): Promise<Attachment>;
  findById(id: string): Promise<Attachment | null>;
  findByTaskId(taskId: string): Promise<Attachment[]>;
  delete(id: string): Promise<void>;
  findByUploader(uploaderId: string): Promise<Attachment[]>;
}
