import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

interface SyncedQuestion {
  question: string;
  answer: string | null;
  externalUrl: string | null;
  verified: boolean;
  topics: string[];
  order: number;
}

interface SyncedCompany {
  slug: string;
  name: string;
  stages: string | null;
  topics: string[];
  techStack: string[];
  sourceUrl: string;
  questions: SyncedQuestion[];
}

function isValidQuestion(text: string): boolean {
  if (text.length < 20) return false;
  if (text.startsWith('[!')) return false;
  if (/collected from|permission|disclosed the questions/i.test(text)) return false;
  return true;
}

export async function seedInterviews(prisma: PrismaClient) {
  const dataPath = join(__dirname, '../../interview-data/data/companies.json');

  if (!existsSync(dataPath)) {
    console.log('Interview data not found — run `pnpm interview:sync` first.');
    return;
  }

  const payload = JSON.parse(readFileSync(dataPath, 'utf8')) as {
    companies: SyncedCompany[];
  };

  let companyCount = 0;
  let questionCount = 0;

  for (const company of payload.companies) {
    const dbCompany = await prisma.interviewCompany.upsert({
      where: { slug: company.slug },
      update: {
        name: company.name,
        stages: company.stages,
        topics: company.topics,
        techStack: company.techStack,
        sourceUrl: company.sourceUrl,
        syncedAt: new Date(),
      },
      create: {
        slug: company.slug,
        name: company.name,
        stages: company.stages,
        topics: company.topics,
        techStack: company.techStack,
        sourceUrl: company.sourceUrl,
      },
    });

    await prisma.interviewQuestion.deleteMany({ where: { companyId: dbCompany.id } });

    const validQuestions = company.questions.filter((q) => isValidQuestion(q.question));

    for (const q of validQuestions) {
      await prisma.interviewQuestion.create({
        data: {
          companyId: dbCompany.id,
          question: q.question.slice(0, 4000),
          answer: q.answer?.slice(0, 12000) ?? null,
          externalUrl: q.externalUrl,
          verified: q.verified,
          topics: q.topics,
          order: q.order,
          sourceFile: company.slug,
        },
      });
      questionCount++;
    }

    companyCount++;
  }

  console.log(`Interview data seeded: ${companyCount} companies, ${questionCount} questions.`);

  const payloadMeta = JSON.parse(readFileSync(dataPath, 'utf8')) as {
    syncedAt?: string;
    source?: string;
    commitSha?: string;
  };

  await prisma.interviewSyncMeta.upsert({
    where: { id: 'default' },
    update: {
      syncedAt: payloadMeta.syncedAt ? new Date(payloadMeta.syncedAt) : new Date(),
      source: payloadMeta.source ?? null,
      commitSha: payloadMeta.commitSha ?? null,
    },
    create: {
      id: 'default',
      syncedAt: payloadMeta.syncedAt ? new Date(payloadMeta.syncedAt) : new Date(),
      source: payloadMeta.source ?? null,
      commitSha: payloadMeta.commitSha ?? null,
    },
  });
}
