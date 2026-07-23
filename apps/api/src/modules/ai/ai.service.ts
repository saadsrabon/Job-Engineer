import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';
import { AiChatClient, createAiClient, assertAiConfigured } from '@jobos/shared';
import {
  ATS_SCORER_SYSTEM_PROMPT,
  buildAtsScorerUserPrompt,
  JOB_ANALYZER_SYSTEM_PROMPT,
  buildJobAnalyzerUserPrompt,
  COVER_LETTER_SYSTEM_PROMPT,
  buildCoverLetterUserPrompt,
  INTERVIEW_COACH_SYSTEM_PROMPT,
  buildInterviewCoachUserPrompt,
} from '@jobos/prompts';
import { truncate } from '@jobos/utils';
import { CareerLibraryService } from '../career-library/career-library.service';
import { JobsRepository } from '../jobs/jobs.repository';
import { InterviewsRepository } from '../interviews/interviews.repository';
import { UsersRepository } from '../users/users.repository';

@Injectable()
export class AiRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  saveGeneration(data: {
    userId: string;
    agent: string;
    input: unknown;
    output: unknown;
    jobId?: string;
  }) {
    return this.prisma.aiGeneration.create({ data: data as never });
  }
}

@Injectable()
export class AiService {
  constructor(
    @Inject(AiRepository) private repository: AiRepository,
    @Inject(CareerLibraryService) private careerService: CareerLibraryService,
    @Inject(JobsRepository) private jobsRepository: JobsRepository,
    @Inject(InterviewsRepository) private interviewsRepository: InterviewsRepository,
    @Inject(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  private getClient(agent: string) {
    try {
      assertAiConfigured();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'AI provider is not configured',
      );
    }
    return createAiClient({ agent });
  }

  private async withAi<T>(agent: string, fn: (client: AiChatClient) => Promise<T>): Promise<T> {
    try {
      return await fn(this.getClient(agent));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw this.toAiHttpException(error);
    }
  }

  private toAiHttpException(error: unknown): HttpException {
    const message = error instanceof Error ? error.message : 'AI request failed';
    const lower = message.toLowerCase();

    if (lower.includes('402') || lower.includes('credit') || lower.includes('balance')) {
      return new BadRequestException(message);
    }
    if (
      lower.includes('429') ||
      lower.includes('concurrency') ||
      lower.includes('rate limit') ||
      lower.includes('rate_limited')
    ) {
      return new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
    }

    return new BadGatewayException(message);
  }

  private async getCareerJson(userId: string, maxLength = 12000) {
    const career = await this.careerService.getAll(userId);
    return truncate(JSON.stringify(career, null, 2), maxLength);
  }

  private async persistGeneration(data: {
    userId: string;
    agent: string;
    input: unknown;
    output: unknown;
    jobId?: string;
  }) {
    try {
      await this.repository.saveGeneration(data);
    } catch {
      // AI result is still returned even if audit logging fails
    }
  }

  async scoreAts(userId: string, jobId: string) {
    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');

    const careerJson = await this.getCareerJson(userId);
    const output = await this.withAi('ats-scorer', (client) =>
      client.extractJson<Record<string, unknown>>([
        { role: 'system', content: ATS_SCORER_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildAtsScorerUserPrompt(careerJson, {
            title: job.title,
            company: job.company,
            description: job.description,
          }),
        },
      ]),
    );

    await this.persistGeneration({
      userId,
      agent: 'ats-scorer',
      jobId,
      input: { jobId },
      output,
    });

    return output;
  }

  async analyzeJob(userId: string, jobId: string) {
    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');

    const output = await this.withAi('job-analyzer', (client) =>
      client.extractJson<Record<string, unknown>>([
        { role: 'system', content: JOB_ANALYZER_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildJobAnalyzerUserPrompt({
            title: job.title,
            company: job.company,
            description: job.description,
            location: job.location,
          }),
        },
      ]),
    );

    await this.persistGeneration({
      userId,
      agent: 'job-analyzer',
      jobId,
      input: { jobId },
      output,
    });

    return output;
  }

  async generateCoverLetter(userId: string, jobId: string) {
    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');

    const user = await this.usersRepository.findById(userId);
    const careerJson = await this.getCareerJson(userId);

    const letter = await this.withAi('cover-letter', (client) =>
      client.chat([
        { role: 'system', content: COVER_LETTER_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildCoverLetterUserPrompt(
            careerJson,
            { title: job.title, company: job.company, description: job.description },
            user?.name,
          ),
        },
      ]),
    );

    const output = { letter };
    await this.persistGeneration({
      userId,
      agent: 'cover-letter',
      jobId,
      input: { jobId },
      output,
    });

    return output;
  }

  async coachAnswer(userId: string, questionId: string) {
    const question = await this.interviewsRepository.findQuestion(questionId);
    if (!question) throw new NotFoundException('Question not found');

    const careerJson = await this.getCareerJson(userId);
    const output = await this.withAi('interview-coach', (client) =>
      client.extractJson<Record<string, unknown>>([
        { role: 'system', content: INTERVIEW_COACH_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildInterviewCoachUserPrompt(
            question.question,
            careerJson,
            question.company?.name,
          ),
        },
      ]),
    );

    await this.persistGeneration({
      userId,
      agent: 'interview-coach',
      input: { questionId },
      output,
    });

    return output;
  }
}
