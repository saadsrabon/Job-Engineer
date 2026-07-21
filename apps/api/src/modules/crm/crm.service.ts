import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';

@Injectable()
export class CrmRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  findJobForUser(userId: string, jobId: string) {
    return this.prisma.job.findFirst({ where: { id: jobId, userId } });
  }

  findTagForUser(userId: string, tagId: string) {
    return this.prisma.jobTag.findFirst({ where: { id: tagId, userId } });
  }

  createNote(jobId: string, content: string) {
    return this.prisma.jobNote.create({ data: { jobId, content } });
  }

  deleteNote(jobId: string, noteId: string) {
    return this.prisma.jobNote.delete({ where: { id: noteId, jobId } });
  }

  createTag(userId: string, name: string, color?: string) {
    return this.prisma.jobTag.create({ data: { userId, name, color: color || '#3B82F6' } });
  }

  listTags(userId: string) {
    return this.prisma.jobTag.findMany({ where: { userId } });
  }

  addTagToJob(jobId: string, tagId: string) {
    return this.prisma.jobTagOnJob.create({ data: { jobId, tagId } });
  }

  removeTagFromJob(jobId: string, tagId: string) {
    return this.prisma.jobTagOnJob.delete({ where: { jobId_tagId: { jobId, tagId } } });
  }
}

@Injectable()
export class CrmService {
  constructor(private repository: CrmRepository) {}

  private async assertJobAccess(userId: string, jobId: string) {
    const job = await this.repository.findJobForUser(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  private async assertTagAccess(userId: string, tagId: string) {
    const tag = await this.repository.findTagForUser(userId, tagId);
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async createNote(userId: string, jobId: string, content: string) {
    await this.assertJobAccess(userId, jobId);
    return this.repository.createNote(jobId, content);
  }

  async deleteNote(userId: string, jobId: string, noteId: string) {
    await this.assertJobAccess(userId, jobId);
    return this.repository.deleteNote(jobId, noteId);
  }

  createTag(userId: string, name: string, color?: string) {
    return this.repository.createTag(userId, name, color);
  }

  listTags(userId: string) {
    return this.repository.listTags(userId);
  }

  async addTagToJob(userId: string, jobId: string, tagId: string) {
    await this.assertJobAccess(userId, jobId);
    await this.assertTagAccess(userId, tagId);
    return this.repository.addTagToJob(jobId, tagId);
  }

  async removeTagFromJob(userId: string, jobId: string, tagId: string) {
    await this.assertJobAccess(userId, jobId);
    await this.assertTagAccess(userId, tagId);
    return this.repository.removeTagFromJob(jobId, tagId);
  }
}
