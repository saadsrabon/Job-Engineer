import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';
import { OpenRouterClient } from '@jobos/shared';
import { EMAIL_WRITER_SYSTEM_PROMPT, buildEmailWriterUserPrompt } from '@jobos/prompts';
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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new BadRequestException('OPENROUTER_API_KEY is not configured');

    const [career, user] = await Promise.all([
      this.careerService.getAll(userId),
      this.usersRepository.findById(userId),
    ]);

    const client = new OpenRouterClient({ apiKey, agent: 'email-writer' });
    const output = await client.extractJson<{ subject: string; body: string }>([
      { role: 'system', content: EMAIL_WRITER_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildEmailWriterUserPrompt(
          template.name,
          JSON.stringify(career, null, 2),
          { title: job.title, company: job.company, description: job.description },
          user?.name,
        ),
      },
    ]);

    await this.repository.saveGeneration({
      userId,
      agent: 'email-writer',
      jobId,
      input: { jobId, templateId },
      output,
    });

    return { template, ...output };
  }
}
