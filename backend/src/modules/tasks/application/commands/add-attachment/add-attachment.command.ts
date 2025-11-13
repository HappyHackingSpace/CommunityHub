export class AddAttachmentCommand {
  constructor(
    public readonly taskId: string,
    public readonly uploadedBy: string,
    public readonly fileName: string,
    public readonly fileUrl: string,
    public readonly fileSize: number,
    public readonly mimeType: string,
  ) {}
}
