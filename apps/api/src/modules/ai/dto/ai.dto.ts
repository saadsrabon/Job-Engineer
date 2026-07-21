import { IsString, IsUUID } from 'class-validator';

export class JobAiDto {
  @IsUUID()
  jobId!: string;
}

export class CoachAnswerDto {
  @IsUUID()
  questionId!: string;
}
