import { ApiProperty } from '@nestjs/swagger';

export class AttachmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  taskId: string;

  @ApiProperty()
  uploadedBy: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  fileSize: number;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
