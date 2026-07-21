import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';
import { OpenRouterClient } from '@jobos/shared';
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

  private getClient() {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new BadRequestException('OPENROUTER_API_KEY is not configured');
    }
    return new OpenRouterClient({ apiKey });
  }

  private async getCareerJson(userId: string) {
    const career = await this.careerService.getAll(userId);
    return JSON.stringify(career, null, 2);
  }

  async scoreAts(userId: string, jobId: string) {
    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');

    const careerJson = await this.getCareerJson(userId);
    const client = this.getClient();

    const output = await client.extractJson<Record<string, unknown>>([
      { role: 'system', content: ATS_SCORER_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildAtsScorerUserPrompt(careerJson, {
          title: job.title,
          company: job.company,
          description: job.description,
        }),
      },
    ]);

    await this.repository.saveGeneration({
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

    const client = this.getClient();
    const output = await client.extractJson<Record<string, unknown>>([
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
    ]);

    await this.repository.saveGeneration({
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
    const client = this.getClient();

    const letter = await client.chat([
      { role: 'system', content: COVER_LETTER_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildCoverLetterUserPrompt(
          careerJson,
          { title: job.title, company: job.company, description: job.description },
          user?.name,
        ),
      },
    ]);

    const output = { letter };
    await this.repository.saveGeneration({
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
    const client = this.getClient();

    const output = await client.extractJson<Record<string, unknown>>([
      { role: 'system', content: INTERVIEW_COACH_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildInterviewCoachUserPrompt(
          question.question,
          careerJson,
          question.company?.name,
        ),
      },
    ]);

    await this.repository.saveGeneration({
      userId,
      agent: 'interview-coach',
      input: { questionId },
      output,
    });

    return output;
  }
}
