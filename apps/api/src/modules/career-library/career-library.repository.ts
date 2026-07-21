import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';

@Injectable()
export class CareerLibraryRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  getAll(userId: string) {
    return Promise.all([
      this.prisma.experience.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      this.prisma.project.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      this.prisma.education.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      this.prisma.skill.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      this.prisma.certificate.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      this.prisma.award.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      this.prisma.language.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
      this.prisma.socialLink.findMany({ where: { userId }, orderBy: { order: 'asc' } }),
    ]).then(([experiences, projects, education, skills, certificates, awards, languages, socialLinks]) => ({
      experiences,
      projects,
      education,
      skills,
      certificates,
      awards,
      languages,
      socialLinks,
    }));
  }

  importParsedData(userId: string, data: Record<string, unknown[]>) {
    return this.prisma.$transaction(async (tx) => {
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
    });
  }

  // Experience CRUD
  createExperience(userId: string, data: Record<string, unknown>) {
    return this.prisma.experience.create({ data: { ...data, userId } as never });
  }

  updateExperience(userId: string, id: string, data: Record<string, unknown>) {
    return this.prisma.experience.update({ where: { id, userId }, data: data as never });
  }

  deleteExperience(userId: string, id: string) {
    return this.prisma.experience.delete({ where: { id, userId } });
  }

  createProject(userId: string, data: Record<string, unknown>) {
    return this.prisma.project.create({ data: { ...data, userId } as never });
  }

  updateProject(userId: string, id: string, data: Record<string, unknown>) {
    return this.prisma.project.update({ where: { id, userId }, data: data as never });
  }

  deleteProject(userId: string, id: string) {
    return this.prisma.project.delete({ where: { id, userId } });
  }

  createSkill(userId: string, data: Record<string, unknown>) {
    return this.prisma.skill.create({ data: { ...data, userId } as never });
  }

  updateSkill(userId: string, id: string, data: Record<string, unknown>) {
    return this.prisma.skill.update({ where: { id, userId }, data: data as never });
  }

  deleteSkill(userId: string, id: string) {
    return this.prisma.skill.delete({ where: { id, userId } });
  }

  createEducation(userId: string, data: Record<string, unknown>) {
    return this.prisma.education.create({ data: { ...data, userId } as never });
  }

  updateEducation(userId: string, id: string, data: Record<string, unknown>) {
    return this.prisma.education.update({ where: { id, userId }, data: data as never });
  }

  deleteEducation(userId: string, id: string) {
    return this.prisma.education.delete({ where: { id, userId } });
  }

  createCertificate(userId: string, data: Record<string, unknown>) {
    return this.prisma.certificate.create({ data: { ...data, userId } as never });
  }

  updateCertificate(userId: string, id: string, data: Record<string, unknown>) {
    return this.prisma.certificate.update({ where: { id, userId }, data: data as never });
  }

  deleteCertificate(userId: string, id: string) {
    return this.prisma.certificate.delete({ where: { id, userId } });
  }

  createAward(userId: string, data: Record<string, unknown>) {
    return this.prisma.award.create({ data: { ...data, userId } as never });
  }

  updateAward(userId: string, id: string, data: Record<string, unknown>) {
    return this.prisma.award.update({ where: { id, userId }, data: data as never });
  }

  deleteAward(userId: string, id: string) {
    return this.prisma.award.delete({ where: { id, userId } });
  }

  createLanguage(userId: string, data: Record<string, unknown>) {
    return this.prisma.language.create({ data: { ...data, userId } as never });
  }

  updateLanguage(userId: string, id: string, data: Record<string, unknown>) {
    return this.prisma.language.update({ where: { id, userId }, data: data as never });
  }

  deleteLanguage(userId: string, id: string) {
    return this.prisma.language.delete({ where: { id, userId } });
  }

  createSocialLink(userId: string, data: Record<string, unknown>) {
    return this.prisma.socialLink.create({ data: { ...data, userId } as never });
  }

  updateSocialLink(userId: string, id: string, data: Record<string, unknown>) {
    return this.prisma.socialLink.update({ where: { id, userId }, data: data as never });
  }

  deleteSocialLink(userId: string, id: string) {
    return this.prisma.socialLink.delete({ where: { id, userId } });
  }
}
