import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';

@Injectable()
export class InterviewsRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  listCompanies() {
    return this.prisma.interviewCompany.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { questions: true } } },
    });
  }

  findCompanyBySlug(slug: string) {
    return this.prisma.interviewCompany.findUnique({
      where: { slug },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    });
  }

  listAllSlugs() {
    return this.prisma.interviewCompany.findMany({
      select: { slug: true, name: true },
    });
  }

  searchQuestions(query: string, limit = 20) {
    return this.prisma.interviewQuestion.findMany({
      where: {
        OR: [
          { question: { contains: query, mode: 'insensitive' } },
          { answer: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { company: { select: { slug: true, name: true } } },
      take: limit,
      orderBy: { order: 'asc' },
    });
  }

  getQuestionsByCompanySlug(slug: string) {
    return this.prisma.interviewQuestion.findMany({
      where: { company: { slug } },
      include: { company: { select: { slug: true, name: true } } },
      orderBy: { order: 'asc' },
    });
  }

  findQuestion(id: string) {
    return this.prisma.interviewQuestion.findUnique({
      where: { id },
      include: { company: { select: { slug: true, name: true } } },
    });
  }

  upsertProgress(
    userId: string,
    questionId: string,
    data: { practiced?: boolean; confidence?: number },
  ) {
    return this.prisma.userQuestionProgress.upsert({
      where: { userId_questionId: { userId, questionId } },
      update: {
        practiced: data.practiced ?? true,
        practicedAt: data.practiced !== false ? new Date() : undefined,
        confidence: data.confidence,
      },
      create: {
        userId,
        questionId,
        practiced: data.practiced ?? true,
        practicedAt: new Date(),
        confidence: data.confidence,
      },
    });
  }

  getUserProgress(userId: string, questionIds: string[]) {
    return this.prisma.userQuestionProgress.findMany({
      where: { userId, questionId: { in: questionIds } },
    });
  }

  getProgressStats(userId: string) {
    return this.prisma.userQuestionProgress.groupBy({
      by: ['practiced'],
      where: { userId, practiced: true },
      _count: { _all: true },
    });
  }

  countQuestions() {
    return this.prisma.interviewQuestion.count();
  }

  countCompaniesWithProgress(userId: string) {
    return this.prisma.userQuestionProgress.findMany({
      where: { userId, practiced: true },
      select: { question: { select: { companyId: true } } },
      distinct: ['questionId'],
    });
  }

  listTopics() {
    return this.prisma.interviewQuestion.findMany({
      select: { topics: true },
    });
  }

  getSyncMeta() {
    return this.prisma.interviewSyncMeta.findUnique({ where: { id: 'default' } });
  }

  listRounds(userId: string, jobId: string) {
    return this.prisma.interviewRound.findMany({
      where: { userId, jobId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  createRound(
    userId: string,
    jobId: string,
    data: {
      title: string;
      scheduledAt?: Date | null;
      location?: string | null;
      prepNotes?: string | null;
      questionIds?: string[];
    },
  ) {
    return this.prisma.interviewRound.create({
      data: {
        userId,
        jobId,
        title: data.title,
        scheduledAt: data.scheduledAt,
        location: data.location,
        prepNotes: data.prepNotes,
        questionIds: data.questionIds ?? [],
      },
    });
  }

  updateRound(
    userId: string,
    roundId: string,
    data: {
      title?: string;
      scheduledAt?: Date | null;
      location?: string | null;
      prepNotes?: string | null;
      feedback?: string | null;
      status?: string;
      questionIds?: string[];
    },
  ) {
    return this.prisma.interviewRound.updateMany({
      where: { id: roundId, userId },
      data,
    });
  }

  getQuestionsByTopic(topic: string, limit = 30) {
    return this.prisma.interviewQuestion.findMany({
      where: { topics: { has: topic } },
      include: { company: { select: { slug: true, name: true } } },
      orderBy: { order: 'asc' },
      take: limit,
    });
  }

  getMockQuestions(companySlug?: string, limit = 5) {
    return this.prisma.interviewQuestion.findMany({
      where: companySlug ? { company: { slug: companySlug } } : undefined,
      include: { company: { select: { slug: true, name: true } } },
      orderBy: { order: 'asc' },
      take: Math.min(limit * 4, 40),
    });
  }

  deleteRound(userId: string, roundId: string) {
    return this.prisma.interviewRound.deleteMany({
      where: { id: roundId, userId },
    });
  }

  findRound(userId: string, roundId: string) {
    return this.prisma.interviewRound.findFirst({
      where: { id: roundId, userId },
    });
  }
}
