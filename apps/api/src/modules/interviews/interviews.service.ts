import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { InterviewsRepository } from './interviews.repository';
import { JobsRepository } from '../jobs/jobs.repository';
import { resolveCompanySlug } from '@jobos/utils';

@Injectable()
export class InterviewsService {
  constructor(
    @Inject(InterviewsRepository) private repository: InterviewsRepository,
    @Inject(JobsRepository) private jobsRepository: JobsRepository,
  ) {}

  listCompanies() {
    return this.repository.listCompanies();
  }

  getCompany(slug: string) {
    return this.repository.findCompanyBySlug(slug);
  }

  searchQuestions(query: string) {
    if (!query.trim()) return Promise.resolve([]);
    return this.repository.searchQuestions(query.trim());
  }

  getQuestionsByTopic(topic: string) {
    return this.repository.getQuestionsByTopic(topic);
  }

  async getMockSession(companySlug?: string) {
    const pool = await this.repository.getMockQuestions(companySlug, 5);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  async getSuggestedForJob(userId: string, jobId: string) {
    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');

    const slugs = await this.repository.listAllSlugs();
    const knownSlugs = slugs.map((s) => s.slug);
    const matchedSlug = resolveCompanySlug(job.company, knownSlugs);

    if (!matchedSlug) {
      const general = await this.repository.getQuestionsByCompanySlug('general');
      return {
        job: { id: job.id, company: job.company, title: job.title },
        matchedCompany: null,
        questions: general.slice(0, 10),
      };
    }

    const company = await this.repository.findCompanyBySlug(matchedSlug);
    const questions = company?.questions ?? [];

    return {
      job: { id: job.id, company: job.company, title: job.title },
      matchedCompany: company
        ? { slug: company.slug, name: company.name, questionCount: questions.length }
        : null,
      questions: questions.slice(0, 15),
    };
  }

  practiceQuestion(userId: string, questionId: string, confidence?: number) {
    return this.repository.upsertProgress(userId, questionId, { practiced: true, confidence });
  }

  getQuestion(id: string) {
    return this.repository.findQuestion(id);
  }

  async getProgress(userId: string) {
    const [practicedRows, totalQuestions, practicedQuestions] = await Promise.all([
      this.repository.getProgressStats(userId),
      this.repository.countQuestions(),
      this.repository.countCompaniesWithProgress(userId),
    ]);

    const practiced = practicedRows.reduce((sum, row) => sum + row._count._all, 0);
    const companyIds = new Set(practicedQuestions.map((p) => p.question.companyId));

    return {
      practiced,
      totalQuestions,
      companiesStarted: companyIds.size,
    };
  }

  async listTopics() {
    const rows = await this.repository.listTopics();
    const counts = new Map<string, number>();
    for (const row of rows) {
      for (const topic of row.topics) {
        counts.set(topic, (counts.get(topic) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);
  }

  getSyncMeta() {
    return this.repository.getSyncMeta();
  }

  async listRounds(userId: string, jobId: string) {
    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');
    return this.repository.listRounds(userId, jobId);
  }

  async createRound(
    userId: string,
    jobId: string,
    dto: {
      title: string;
      scheduledAt?: string;
      location?: string;
      prepNotes?: string;
      questionIds?: string[];
    },
  ) {
    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');
    return this.repository.createRound(userId, jobId, {
      title: dto.title,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
      location: dto.location ?? null,
      prepNotes: dto.prepNotes ?? null,
      questionIds: dto.questionIds,
    });
  }

  async updateRound(
    userId: string,
    jobId: string,
    roundId: string,
    dto: {
      title?: string;
      scheduledAt?: string;
      location?: string;
      prepNotes?: string;
      feedback?: string;
      status?: string;
      questionIds?: string[];
    },
  ) {
    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');

    const result = await this.repository.updateRound(userId, roundId, {
      title: dto.title,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      location: dto.location,
      prepNotes: dto.prepNotes,
      feedback: dto.feedback,
      status: dto.status,
      questionIds: dto.questionIds,
    });

    if (result.count === 0) throw new NotFoundException('Round not found');
    return this.repository.findRound(userId, roundId);
  }

  async deleteRound(userId: string, jobId: string, roundId: string) {
    const job = await this.jobsRepository.findById(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');
    const result = await this.repository.deleteRound(userId, roundId);
    if (result.count === 0) throw new NotFoundException('Round not found');
    return { id: roundId, deleted: true };
  }
}
