import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private repository: UsersRepository) {}

  getProfile(userId: string) {
    return this.repository.findById(userId);
  }

  completeOnboarding(userId: string) {
    return this.repository.updateProfile(userId, { onboardingComplete: true });
  }

  updateProfile(userId: string, data: { name?: string }) {
    return this.repository.updateProfile(userId, data);
  }
}
