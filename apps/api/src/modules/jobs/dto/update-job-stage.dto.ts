import { IsEnum } from 'class-validator';
import { PipelineStage } from '@jobos/database';

export class UpdateJobStageDto {
  @IsEnum(PipelineStage)
  stage!: PipelineStage;
}
