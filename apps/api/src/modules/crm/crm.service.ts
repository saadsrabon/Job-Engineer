import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';

@Injectable()
export class CrmRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

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

  createNote(jobId: string, content: string) {
    return this.repository.createNote(jobId, content);
  }

  deleteNote(jobId: string, noteId: string) {
    return this.repository.deleteNote(jobId, noteId);
  }

  createTag(userId: string, name: string, color?: string) {
    return this.repository.createTag(userId, name, color);
  }

  listTags(userId: string) {
    return this.repository.listTags(userId);
  }

  addTagToJob(jobId: string, tagId: string) {
    return this.repository.addTagToJob(jobId, tagId);
  }

  removeTagFromJob(jobId: string, tagId: string) {
    return this.repository.removeTagFromJob(jobId, tagId);
  }
}
