import { Attachment } from '../../../../domain/entities/attachment.entity';
import { AttachmentOrmEntity } from '../entities/attachment.orm-entity';

export class AttachmentMapper {
  static toPersistence(attachment: Attachment): AttachmentOrmEntity {
    const ormEntity = new AttachmentOrmEntity();
    ormEntity.id = attachment.id;
    ormEntity.taskId = attachment.taskId;
    ormEntity.uploadedBy = attachment.uploadedBy;
    ormEntity.fileName = attachment.fileName;
    ormEntity.fileUrl = attachment.fileUrl;
    ormEntity.fileSize = attachment.fileSize;
    ormEntity.mimeType = attachment.mimeType;
    ormEntity.createdAt = attachment.createdAt;
    ormEntity.updatedAt = attachment.updatedAt;
    return ormEntity;
  }

  static toDomain(ormEntity: AttachmentOrmEntity): Attachment {
    return Attachment.restore(
      ormEntity.id,
      {
        taskId: ormEntity.taskId,
        uploadedBy: ormEntity.uploadedBy,
        fileName: ormEntity.fileName,
        fileUrl: ormEntity.fileUrl,
        fileSize: ormEntity.fileSize,
        mimeType: ormEntity.mimeType,
      },
      ormEntity.createdAt,
      ormEntity.updatedAt,
    );
  }
}
