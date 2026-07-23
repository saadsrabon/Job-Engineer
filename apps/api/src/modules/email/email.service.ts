import {
  Injectable,
  Inject,
  BadGatewayException,
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';
import { createAiClient, assertAiConfigured } from '@jobos/shared';
import { EMAIL_WRITER_SYSTEM_PROMPT, buildEmailWriterUserPrompt } from '@jobos/prompts';
import { truncate } from '@jobos/utils';
import { CareerLibraryService } from '../career-library/career-library.service';
import { JobsRepository } from '../jobs/jobs.repository';
import { UsersRepository } from '../users/users.repository';

export const EMAIL_TEMPLATES = [
  { id: 'follow-up', name: 'Application Follow-up', description: 'Polite check-in after applying' },
  { id: 'thank-you', name: 'Thank You', description: 'Post-interview thank you note' },
  { id: 'networking', name: 'Networking', description: 'Reach out to a connection at the company' },
] as const;

@Injectable()
export class EmailRepository {
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
export class EmailService {
  constructor(
    @Inject(EmailRepository) private repository: EmailRepository,
    @Inject(CareerLibraryService) private careerService: CareerLibraryService,
    @Inject(JobsRepository) private jobsRepository: JobsRepository,
    @Inject(UsersRepository) private usersRepository: UsersRepository,
  ) {}

  listTemplates() {
    return EMAIL_TEMPLATES;
  }

  async generate(userId: string, jobId: string, templateId: string) {
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!template) throw new BadRequestException('Unknown email template');

    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');

    try {
      assertAiConfigured();
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'AI provider is not configured',
      );
    }

    const [career, user] = await Promise.all([
      this.careerService.getAll(userId),
      this.usersRepository.findById(userId),
    ]);

    const client = createAiClient({ agent: 'email-writer' });
    let output: { subject: string; body: string };
    try {
      output = await client.extractJson<{ subject: string; body: string }>([
        { role: 'system', content: EMAIL_WRITER_SYSTEM_PROMPT },
        {
          role: 'user',
          content: buildEmailWriterUserPrompt(
            template.name,
            truncate(JSON.stringify(career, null, 2), 12000),
            { title: job.title, company: job.company, description: job.description },
            user?.name,
          ),
        },
      ]);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const message = error instanceof Error ? error.message : 'AI request failed';
      const lower = message.toLowerCase();
      if (lower.includes('402') || lower.includes('credit') || lower.includes('balance')) {
        throw new BadRequestException(message);
      }
      if (
        lower.includes('429') ||
        lower.includes('concurrency') ||
        lower.includes('rate limit') ||
        lower.includes('rate_limited')
      ) {
        throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
      }
      throw new BadGatewayException(message);
    }

    try {
      await this.repository.saveGeneration({
        userId,
        agent: 'email-writer',
        jobId,
        input: { jobId, templateId },
        output,
      });
    } catch {
      // AI result is still returned even if audit logging fails
    }

    return { template, ...output };
  }
}
