import { IsString, IsNotEmpty, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type NoteType = 'note' | 'decision' | 'action_item';

export class CreateMeetingNoteDto {
  @ApiProperty({
    description: 'Title of the note',
    example: 'Action: Update user documentation',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Content of the note',
    example: 'We need to update the user documentation to reflect the new features discussed in this meeting.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'Type of the note',
    enum: ['note', 'decision', 'action_item'],
    example: 'action_item',
  })
  @IsEnum(['note', 'decision', 'action_item'])
  noteType: NoteType;
}
