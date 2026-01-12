import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddParticipantDto {
  @ApiProperty({
    description: 'UUID of the participant to add',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4', { message: 'participantId must be a valid UUID' })
  @IsNotEmpty()
  participantId: string;
}