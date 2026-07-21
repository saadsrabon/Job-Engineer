import { Injectable, Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';

@Injectable()
export class UsersRepository {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({ where: { clerkId } });
  }

  updateProfile(id: string, data: { name?: string; onboardingComplete?: boolean }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  upsertFromClerk(data: {
    clerkId: string;
    email: string;
    name?: string | null;
    avatar?: string | null;
  }) {
    return this.prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: { email: data.email, name: data.name, avatar: data.avatar },
      create: data,
    });
  }

  async deleteByClerkId(clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return null;

    await this.prisma.activityLog.deleteMany({ where: { userId: user.id } });
    return this.prisma.user.delete({ where: { id: user.id } });
  }
}
