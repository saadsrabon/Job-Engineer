import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { PipelineStage } from '@jobos/database';

export class CreateJobDto {
  @IsString()
  title!: string;

  @IsString()
  company!: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  salaryMax?: number;

  @IsOptional()
  @IsEnum(PipelineStage)
  stage?: PipelineStage;
}
