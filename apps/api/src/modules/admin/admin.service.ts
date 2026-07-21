import { Injectable, Inject } from '@nestjs/common';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminService {
  constructor(@Inject(AdminRepository) private repository: AdminRepository) {}

  getOverview() {
    return this.repository.getOverview();
  }
}
