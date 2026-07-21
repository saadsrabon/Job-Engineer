import type { PrismaClient } from '@prisma/client';

type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function importParsedCareerData(
  tx: TransactionClient,
  userId: string,
  data: Record<string, unknown[]>,
): Promise<Record<string, unknown[]>> {
  const results: Record<string, unknown[]> = {};

  if (data.experiences?.length) {
    await tx.experience.deleteMany({ where: { userId } });
    results.experiences = await Promise.all(
      (data.experiences as Record<string, unknown>[]).map((item, i) =>
        tx.experience.create({ data: { ...item, userId, order: i } as never }),
      ),
    );
  }

  if (data.projects?.length) {
    await tx.project.deleteMany({ where: { userId } });
    results.projects = await Promise.all(
      (data.projects as Record<string, unknown>[]).map((item, i) =>
        tx.project.create({ data: { ...item, userId, order: i } as never }),
      ),
    );
  }

  if (data.education?.length) {
    await tx.education.deleteMany({ where: { userId } });
    results.education = await Promise.all(
      (data.education as Record<string, unknown>[]).map((item, i) =>
        tx.education.create({ data: { ...item, userId, order: i } as never }),
      ),
    );
  }

  if (data.skills?.length) {
    await tx.skill.deleteMany({ where: { userId } });
    results.skills = await Promise.all(
      (data.skills as Record<string, unknown>[]).map((item, i) =>
        tx.skill.create({ data: { ...item, userId, order: i } as never }),
      ),
    );
  }

  if (data.certificates?.length) {
    await tx.certificate.deleteMany({ where: { userId } });
    results.certificates = await Promise.all(
      (data.certificates as Record<string, unknown>[]).map((item, i) =>
        tx.certificate.create({ data: { ...item, userId, order: i } as never }),
      ),
    );
  }

  if (data.awards?.length) {
    await tx.award.deleteMany({ where: { userId } });
    results.awards = await Promise.all(
      (data.awards as Record<string, unknown>[]).map((item, i) =>
        tx.award.create({ data: { ...item, userId, order: i } as never }),
      ),
    );
  }

  if (data.languages?.length) {
    await tx.language.deleteMany({ where: { userId } });
    results.languages = await Promise.all(
      (data.languages as Record<string, unknown>[]).map((item, i) =>
        tx.language.create({ data: { ...item, userId, order: i } as never }),
      ),
    );
  }

  if (data.socialLinks?.length) {
    await tx.socialLink.deleteMany({ where: { userId } });
    results.socialLinks = await Promise.all(
      (data.socialLinks as Record<string, unknown>[]).map((item, i) =>
        tx.socialLink.create({ data: { ...item, userId, order: i } as never }),
      ),
    );
  }

  return results;
}
