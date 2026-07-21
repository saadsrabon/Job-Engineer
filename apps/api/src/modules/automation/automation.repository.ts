import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';

@Injectable()
export class AutomationRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  listReminders(userId: string) {
    return this.prisma.jobReminder.findMany({
      where: { job: { userId } },
      include: {
        job: { select: { id: true, title: true, company: true, stage: true } },
      },
      orderBy: { dueAt: 'asc' },
    });
  }

  createReminder(userId: string, jobId: string, data: { title: string; dueAt: Date }) {
    return this.prisma.jobReminder.create({
      data: { jobId, title: data.title, dueAt: data.dueAt },
      include: {
        job: { select: { id: true, title: true, company: true, stage: true } },
      },
    });
  }

  updateReminder(userId: string, id: string, data: { completed?: boolean; title?: string; dueAt?: Date }) {
    return this.prisma.jobReminder.updateMany({
      where: { id, job: { userId } },
      data,
    });
  }

  findJob(userId: string, jobId: string) {
    return this.prisma.job.findFirst({ where: { id: jobId, userId } });
  }

  deleteReminder(userId: string, id: string) {
    return this.prisma.jobReminder.deleteMany({
      where: { id, job: { userId } },
    });
  }
}
