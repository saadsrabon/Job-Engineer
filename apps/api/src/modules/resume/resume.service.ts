import { Injectable, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES } from '@jobos/shared';
import { resolveStorageDir } from '@jobos/shared/paths';
import { CareerLibraryService } from '../career-library/career-library.service';
import { UsersRepository } from '../users/users.repository';
import { ResumeRepository } from './resume.repository';
import { generateResumePdf } from './pdf-generator';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResumeService {
  private uploadDir: string;
  private exportDir: string;

  constructor(
    @Inject(ResumeRepository) private repository: ResumeRepository,
    @Inject(CareerLibraryService) private careerService: CareerLibraryService,
    @Inject(UsersRepository) private usersRepository: UsersRepository,
    @InjectQueue(QUEUE_NAMES.RESUME_PARSE) private parseQueue: Queue,
  ) {
    this.uploadDir = resolveStorageDir('UPLOAD_DIR', './uploads');
    this.exportDir = resolveStorageDir('EXPORT_DIR', './exports');
    for (const dir of [this.uploadDir, this.exportDir]) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  }

  async upload(userId: string, file: Express.Multer.File) {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_MIMES = ['application/pdf'];

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 10MB.');
    }

    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF files are allowed.');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const filePath = path.resolve(this.uploadDir, fileName).replace(/\\/g, '/');

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

  async deleteParseJob(userId: string, id: string) {
    const job = await this.repository.findParseJob(userId, id);
    if (!job) throw new NotFoundException('Parse job not found');

    if (fs.existsSync(job.filePath)) {
      try {
        fs.unlinkSync(job.filePath);
      } catch {
        // file may already be removed
      }
    }

    await this.repository.deleteParseJob(id);
    return { id };
  }

  async deleteVersion(userId: string, id: string) {
    const version = await this.repository.findVersion(userId, id);
    if (!version) throw new NotFoundException('Resume version not found');

    await this.repository.deleteVersion(id);
    return { id };
  }

  async exportPdf(userId: string) {
    const [career, user] = await Promise.all([
      this.careerService.getAll(userId),
      this.usersRepository.findById(userId),
    ]);

    const hasContent =
      career.experiences.length > 0 ||
      career.skills.length > 0 ||
      career.projects.length > 0;

    if (!hasContent) {
      throw new BadRequestException('Career Library is empty. Add content before exporting.');
    }

    const buffer = await generateResumePdf(career, user?.name);
    const fileName = `resume-${Date.now()}.pdf`;
    const filePath = path.join(this.exportDir, `${userId}-${fileName}`);
    fs.writeFileSync(filePath, buffer);

    await this.repository.createVersion(userId, {
      name: fileName,
      snapshot: career as unknown as Record<string, unknown>,
    });

    return {
      fileName,
      filePath,
      size: buffer.length,
      downloadPath: `/api/v1/resume/export/download/${fileName}`,
    };
  }

  getExportFile(userId: string, fileName: string) {
    const safeName = path.basename(fileName);
    const filePath = path.join(this.exportDir, `${userId}-${safeName}`);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Export file not found');
    }
    return { filePath, fileName: safeName };
  }
}
