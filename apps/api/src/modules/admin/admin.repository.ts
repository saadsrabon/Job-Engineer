import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';

@Injectable()
export class AdminRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  getOverview() {
    return Promise.all([
      this.prisma.user.count(),
      this.prisma.job.count(),
      this.prisma.interviewCompany.count(),
      this.prisma.interviewQuestion.count(),
      this.prisma.interviewSyncMeta.findUnique({ where: { id: 'default' } }),
      this.prisma.aiModelConfig.findMany({ orderBy: { agent: 'asc' } }),
      this.prisma.aiGeneration.count(),
    ]).then(([users, jobs, companies, questions, syncMeta, aiModels, aiGenerations]) => ({
      users,
      jobs,
      interviewCompanies: companies,
      interviewQuestions: questions,
      syncMeta,
      aiModels,
      aiGenerations,
    }));
  }
}
