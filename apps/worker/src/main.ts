import './load-env';

import { Worker } from 'bullmq';
import { prisma, ParseJobStatus, importParsedCareerData } from '@jobos/database';
import {
  QUEUE_NAMES,
  assertAiConfigured,
  createAiClient,
  resolveResumeParserMaxTokens,
} from '@jobos/shared';
import { resolveUploadFilePath } from '@jobos/shared/paths';
import { formatResumeTextToMarkdown, truncateResumeMarkdown } from '@jobos/utils';
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
    const resolvedPath = resolveUploadFilePath(filePath);
    const buffer = fs.readFileSync(resolvedPath);
    const pdf = await pdfParse(buffer);
    const resumeMarkdown = formatResumeTextToMarkdown(pdf.text);

    if (!resumeMarkdown.trim()) {
      throw new Error(
        'Could not extract readable text from PDF. Try a text-based PDF or re-export without image-only pages.',
      );
    }

    try {
      assertAiConfigured();
    } catch {
      throw new Error(
        'AI provider is not configured. Set AI_API_KEY (or OPENROUTER_API_KEY) in .env.',
      );
    }

    const maxTokens = resolveResumeParserMaxTokens(
      process.env.AI_MAX_TOKENS_RESUME_PARSER ||
        process.env.OPENROUTER_RESUME_PARSER_MAX_TOKENS,
    );

    const resumeForParsing = truncateResumeMarkdown(resumeMarkdown, 12000);

    const client = createAiClient({
      agent: 'resume-parser',
      ...(process.env.AI_MODEL_RESUME_PARSER?.trim()
        ? { model: process.env.AI_MODEL_RESUME_PARSER.trim() }
        : {}),
      maxTokens,
    });

    const extractedData = await client.extractJson<Record<string, unknown[]>>([
      { role: 'system', content: RESUME_PARSER_SYSTEM_PROMPT },
      { role: 'user', content: buildResumeParserUserPrompt(resumeForParsing) },
    ]);

    await prisma.$transaction(async (tx) => {
      await importParsedCareerData(tx, userId, extractedData);

      await tx.activityLog.create({
        data: {
          userId,
          type: 'resume.parsed',
          entityId: jobId,
          message: 'Resume parsed and imported to Career Library',
        },
      });
    });

    await prisma.resumeParseJob.update({
      where: { id: jobId },
      data: {
        status: ParseJobStatus.Completed,
        extractedText: resumeMarkdown,
        extractedData: extractedData as never,
        completedAt: new Date(),
      },
    });

    console.log(`Resume parse job ${jobId} completed`);
  } catch (error) {
    let message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('402') || message.includes('credits insufficient')) {
      message =
        `Local PDF extraction succeeded, but AI structuring failed: ${message} ` +
        'Add credits to your AI provider, choose a cheaper model, or lower AI_MAX_TOKENS_RESUME_PARSER.';
    }
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
try {
  assertAiConfigured();
} catch {
  console.warn(
    'AI provider is not configured. Set AI_API_KEY (or OPENROUTER_API_KEY) in root .env and restart the worker.',
  );
}

process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
});
