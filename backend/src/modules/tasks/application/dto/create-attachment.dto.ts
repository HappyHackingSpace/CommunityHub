import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttachmentDto {
  @ApiProperty({
    description: 'The ID of the task to attach the file to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({
    description: 'The name of the file',
    example: 'design-mockup.png',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'The URL where the file is stored',
    example: 'https://s3.amazonaws.com/bucket/files/design-mockup.png',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    description: 'The size of the file in bytes',
    example: 1024000,
  })
  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @ApiProperty({
    description: 'The MIME type of the file',
    example: 'image/png',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;
}
