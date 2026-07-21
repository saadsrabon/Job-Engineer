import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../../.env') });
config({ path: resolve(__dirname, '../../../.env.local') });

import { Worker } from 'bullmq';
import { prisma, ParseJobStatus } from '@jobos/database';
import { QUEUE_NAMES, OpenRouterClient } from '@jobos/shared';
import {
  RESUME_PARSER_SYSTEM_PROMPT,
  buildResumeParserUserPrompt,
} from '@jobos/prompts';
import * as fs from 'fs';
import pdfParse = require('pdf-parse');

const connection = process.env.REDIS_URL
  ? { url: process.env.REDIS_URL }
  : {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    };

async function parseResume(jobId: string, userId: string, filePath: string) {
  await prisma.resumeParseJob.update({
    where: { id: jobId },
    data: { status: ParseJobStatus.Processing },
  });

  try {
    const buffer = fs.readFileSync(filePath);
    const pdf = await pdfParse(buffer);
    const extractedText = pdf.text;

    let extractedData: Record<string, unknown[]> | null = null;

    if (process.env.OPENROUTER_API_KEY) {
      const client = new OpenRouterClient({
        apiKey: process.env.OPENROUTER_API_KEY,
        agent: 'resume-parser',
      });

      extractedData = await client.extractJson<Record<string, unknown[]>>([
        { role: 'system', content: RESUME_PARSER_SYSTEM_PROMPT },
        { role: 'user', content: buildResumeParserUserPrompt(extractedText) },
      ]);
    }

    if (extractedData) {
      await prisma.$transaction(async (tx) => {
        if (extractedData!.experiences?.length) {
          await tx.experience.deleteMany({ where: { userId } });
          await Promise.all(
            extractedData!.experiences!.map((item, i) =>
              tx.experience.create({
                data: { ...(item as object), userId, order: i } as never,
              }),
            ),
          );
        }

        if (extractedData!.skills?.length) {
          await tx.skill.deleteMany({ where: { userId } });
          await Promise.all(
            extractedData!.skills!.map((item, i) =>
              tx.skill.create({
                data: { ...(item as object), userId, order: i } as never,
              }),
            ),
          );
        }

        if (extractedData!.projects?.length) {
          await tx.project.deleteMany({ where: { userId } });
          await Promise.all(
            extractedData!.projects!.map((item, i) =>
              tx.project.create({
                data: { ...(item as object), userId, order: i } as never,
              }),
            ),
          );
        }

        if (extractedData!.education?.length) {
          await tx.education.deleteMany({ where: { userId } });
          await Promise.all(
            extractedData!.education!.map((item, i) =>
              tx.education.create({
                data: { ...(item as object), userId, order: i } as never,
              }),
            ),
          );
        }

        await tx.activityLog.create({
          data: {
            userId,
            type: 'resume.parsed',
            entityId: jobId,
            message: 'Resume parsed and imported to Career Library',
          },
        });
      });
    }

    await prisma.resumeParseJob.update({
      where: { id: jobId },
      data: {
        status: ParseJobStatus.Completed,
        extractedText,
        extractedData: (extractedData ?? undefined) as never,
        completedAt: new Date(),
      },
    });

    console.log(`Resume parse job ${jobId} completed`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await prisma.resumeParseJob.update({
      where: { id: jobId },
      data: { status: ParseJobStatus.Failed, error: message },
    });
    console.error(`Resume parse job ${jobId} failed:`, message);
    throw error;
  }
}

const worker = new Worker(
  QUEUE_NAMES.RESUME_PARSE,
  async (job) => {
    const { jobId, userId, filePath } = job.data as {
      jobId: string;
      userId: string;
      filePath: string;
    };
    await parseResume(jobId, userId, filePath);
  },
  { connection },
);

worker.on('completed', (job) => console.log(`Job ${job.id} completed`));
worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed:`, err));

console.log('JobOS Worker started — listening for resume parse jobs');

process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
});
