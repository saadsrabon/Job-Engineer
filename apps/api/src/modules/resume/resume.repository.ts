import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient, ParseJobStatus } from '@jobos/database';

@Injectable()
export class ResumeRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  createParseJob(data: {
    userId: string;
    fileName: string;
    filePath: string;
    fileSize: number;
  }) {
    return this.prisma.resumeParseJob.create({ data });
  }

  findParseJob(userId: string, id: string) {
    return this.prisma.resumeParseJob.findFirst({ where: { id, userId } });
  }

  listParseJobs(userId: string) {
    return this.prisma.resumeParseJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  updateParseJob(
    id: string,
    data: Partial<{
      status: ParseJobStatus;
      extractedText: string;
      extractedData: unknown;
      error: string;
      completedAt: Date;
    }>,
  ) {
    return this.prisma.resumeParseJob.update({ where: { id }, data: data as never });
  }

  listVersions(userId: string) {
    return this.prisma.resumeVersion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findVersion(userId: string, id: string) {
    return this.prisma.resumeVersion.findFirst({ where: { id, userId } });
  }

  deleteParseJob(id: string) {
    return this.prisma.resumeParseJob.delete({ where: { id } });
  }

  deleteVersion(id: string) {
    return this.prisma.resumeVersion.delete({ where: { id } });
  }

  createVersion(userId: string, data: { name: string; snapshot: Record<string, unknown> }) {
    return this.prisma.resumeVersion.create({
      data: {
        userId,
        name: data.name,
        snapshot: data.snapshot as never,
      },
    });
  }
}
