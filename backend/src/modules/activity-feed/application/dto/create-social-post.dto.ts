import { IsString, IsArray, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateSocialPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];
}
