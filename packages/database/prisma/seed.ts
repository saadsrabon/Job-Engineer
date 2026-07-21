import { PrismaClient, PipelineStage } from '@prisma/client';

const DEFAULT_MODELS: Record<string, string> = {
  'resume-parser': 'openai/gpt-4.1-mini',
  'cover-letter': 'anthropic/claude-3.5-sonnet',
  'job-analyzer': 'openai/gpt-4.1-mini',
};

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  for (const [agent, modelId] of Object.entries(DEFAULT_MODELS)) {
    await prisma.aiModelConfig.upsert({
      where: { agent },
      update: { modelId },
      create: {
        agent,
        modelId,
        provider: 'openrouter',
        enabled: true,
      },
    });
  }

  console.log('AI model configs seeded.');

  // Demo user (for local dev without Clerk)
  const demoUser = await prisma.user.upsert({
    where: { clerkId: 'demo_clerk_id' },
    update: {},
    create: {
      clerkId: 'demo_clerk_id',
      email: 'demo@jobos.app',
      name: 'Demo User',
      onboardingComplete: true,
    },
  });

  await prisma.job.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: demoUser.id,
        title: 'Senior Software Engineer',
        company: 'Linear',
        location: 'Remote',
        stage: PipelineStage.Applied,
        source: 'LinkedIn',
      },
      {
        userId: demoUser.id,
        title: 'Full Stack Developer',
        company: 'Stripe',
        location: 'San Francisco, CA',
        stage: PipelineStage.Interview,
        source: 'Company Site',
      },
      {
        userId: demoUser.id,
        title: 'Frontend Engineer',
        company: 'Vercel',
        location: 'Remote',
        stage: PipelineStage.Saved,
        source: 'Indeed',
      },
    ],
  });

  console.log('Demo data seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
