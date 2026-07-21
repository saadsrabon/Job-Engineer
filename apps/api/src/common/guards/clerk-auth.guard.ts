import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { Inject } from '@nestjs/common';
import { PRISMA } from '../../database/prisma.module';
import { PrismaClient } from '@jobos/database';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(@Inject(PRISMA) private prisma: PrismaClient) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const clerkId = payload.sub;
      let user = await this.prisma.user.findUnique({ where: { clerkId } });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            clerkId,
            email: (payload.email as string) || `${clerkId}@clerk.user`,
            name: [payload.first_name, payload.last_name].filter(Boolean).join(' ') || null,
            avatar: (payload.image_url as string) || null,
          },
        });
      }

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
