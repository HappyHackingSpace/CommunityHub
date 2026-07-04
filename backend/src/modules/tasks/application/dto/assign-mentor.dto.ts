import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignMentorDto {
  @ApiProperty({
    description: 'The UUID of the mentor to assign',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'mentorId must be a valid UUID' })
  @IsNotEmpty()
  mentorId: string;
}
