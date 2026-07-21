import { IsArray, IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateInterviewRoundDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  prepNotes?: string;

  @IsOptional()
  @IsArray()
  questionIds?: string[];
}

export class UpdateInterviewRoundDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  prepNotes?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsArray()
  questionIds?: string[];
}
