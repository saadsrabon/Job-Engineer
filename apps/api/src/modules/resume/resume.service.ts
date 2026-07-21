import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient, ParseJobStatus } from '@jobos/database';
import { QUEUE_NAMES } from '@jobos/shared';
import * as fs from 'fs';
import * as path from 'path';

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

  updateParseJob(id: string, data: Partial<{ status: ParseJobStatus; extractedText: string; extractedData: unknown; error: string; completedAt: Date }>) {
    return this.prisma.resumeParseJob.update({ where: { id }, data: data as never });
  }

  listVersions(userId: string) {
    return this.prisma.resumeVersion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

@Injectable()
export class ResumeService {
  private uploadDir: string;

  constructor(
    private repository: ResumeRepository,
    @InjectQueue(QUEUE_NAMES.RESUME_PARSE) private parseQueue: Queue,
  ) {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(userId: string, file: Express.Multer.File) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(this.uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    const job = await this.repository.createParseJob({
      userId,
      fileName: file.originalname,
      filePath,
      fileSize: file.size,
    });

    await this.parseQueue.add('parse', { jobId: job.id, userId, filePath });

    return job;
  }

  getParseJob(userId: string, id: string) {
    return this.repository.findParseJob(userId, id);
  }

  listParseJobs(userId: string) {
    return this.repository.listParseJobs(userId);
  }

  listVersions(userId: string) {
    return this.repository.listVersions(userId);
  }

  exportPdf(_userId: string) {
    return { message: 'PDF export coming in Phase 2', status: 'stub' };
  }
}
