import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AutomationRepository } from './automation.repository';

@Injectable()
export class AutomationService {
  constructor(@Inject(AutomationRepository) private repository: AutomationRepository) {}

  listReminders(userId: string) {
    return this.repository.listReminders(userId);
  }

  async createReminder(
    userId: string,
    jobId: string,
    data: { title: string; dueAt: string },
  ) {
    const job = await this.repository.findJob(userId, jobId);
    if (!job) throw new NotFoundException('Job not found');
    return this.repository.createReminder(userId, jobId, {
      title: data.title,
      dueAt: new Date(data.dueAt),
    });
  }

  async completeReminder(userId: string, id: string, completed: boolean) {
    const result = await this.repository.updateReminder(userId, id, { completed });
    if (result.count === 0) throw new NotFoundException('Reminder not found');
    return { id, completed };
  }

  async deleteReminder(userId: string, id: string) {
    const result = await this.repository.deleteReminder(userId, id);
    if (result.count === 0) throw new NotFoundException('Reminder not found');
    return { id, deleted: true };
  }
}
