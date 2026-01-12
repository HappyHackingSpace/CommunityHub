import { IsString, IsNumber, IsNotEmpty, IsUUID, IsUrl, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttachmentDto {
  @ApiProperty({
    description: 'The UUID of the file',
    example: 'file-name.pdf',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'File name cannot exceed 255 characters' })
  fileName: string;

  @ApiProperty({
    description: 'The URL where the file is stored',
    example: 'https://s3.amazonaws.com/bucket/files/design-mockup.png',
  })
  @IsUrl({}, { message: 'fileUrl must be a valid URL' })
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    description: 'The size of the file in bytes',
    example: 1024000,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'File size must be greater than 0' })
  fileSize: number;

  @ApiProperty({
    description: 'The MIME type of the file (e.g., image/png, application/pdf)',
    example: 'image/png',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'MIME type cannot exceed 100 characters' })
  mimeType: string;
}
