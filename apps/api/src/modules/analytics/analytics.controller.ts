import { Controller, Get, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(@Inject(AnalyticsService) private service: AnalyticsService) {}

  @Get('overview')
  overview(@CurrentUser() user: User) {
    return this.service.getOverview(user.id).then((data) => ({ data }));
  }
}
