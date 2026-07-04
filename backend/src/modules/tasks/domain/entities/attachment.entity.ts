import { BaseEntity } from 'src/shared/domain/base-entity';
import { v4 as uuidv4 } from 'uuid';

interface AttachmentProps {
  taskId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // in bytes
  mimeType: string;
}

export class Attachment extends BaseEntity {
  private props: AttachmentProps;

  private constructor(
    id: string,
    props: AttachmentProps,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt || new Date(), updatedAt);
    this.props = props;
  }

  // Getters
  get taskId(): string {
    return this.props.taskId;
  }

  get uploadedBy(): string {
    return this.props.uploadedBy;
  }

  get fileName(): string {
    return this.props.fileName;
  }

  get fileUrl(): string {
    return this.props.fileUrl;
  }

  get fileSize(): number {
    return this.props.fileSize;
  }

  get mimeType(): string {
    return this.props.mimeType;
  }

  // Static factory method for creation
  public static create(props: {
    taskId: string;
    uploadedBy: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }): Attachment {
    const attachmentId = uuidv4();
    return new Attachment(attachmentId, {
      taskId: props.taskId,
      uploadedBy: props.uploadedBy,
      fileName: props.fileName,
      fileUrl: props.fileUrl,
      fileSize: props.fileSize,
      mimeType: props.mimeType,
    });
  }

  // Static factory method for restoration from DB
  public static restore(
    id: string,
    props: AttachmentProps,
    createdAt: Date,
    updatedAt?: Date,
  ): Attachment {
    return new Attachment(id, props, createdAt, updatedAt);
  }

  // Helper methods
  public isImage(): boolean {
    return this.props.mimeType.startsWith('image/');
  }

  public isDocument(): boolean {
    const docTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    return docTypes.includes(this.props.mimeType);
  }
}
