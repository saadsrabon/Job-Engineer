import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(@Inject(AdminService) private service: AdminService) {}

  @Get('overview')
  overview() {
    return this.service.getOverview().then((data) => ({ data }));
  }
}
