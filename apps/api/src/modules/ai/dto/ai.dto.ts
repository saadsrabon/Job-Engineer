import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/** Prisma entity ids use cuid(), not UUID. */
export class JobAiDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  jobId!: string;
}

export class CoachAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  questionId!: string;
}
