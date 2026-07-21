import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { User } from '@jobos/database';

function adminEmails(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  if (fromEnv.length > 0) return fromEnv;
  return ['demo@jobos.app'];
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const user = request.user;
    if (!user?.email) throw new ForbiddenException('Admin access required');
    if (!adminEmails().includes(user.email.toLowerCase())) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
