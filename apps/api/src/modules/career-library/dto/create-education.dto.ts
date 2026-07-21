import { IsString, IsOptional } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  institution!: string;

  @IsString()
  degree!: string;

  @IsOptional()
  @IsString()
  field?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  gpa?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
