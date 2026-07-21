import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PracticeQuestionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  confidence?: number;
}
