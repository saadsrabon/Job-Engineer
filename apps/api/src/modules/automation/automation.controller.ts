import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';
import { CreateReminderDto } from './dto/create-reminder.dto';

@ApiTags('automation')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('automation')
export class AutomationController {
  constructor(@Inject(AutomationService) private service: AutomationService) {}

  @Get('reminders')
  listReminders(@CurrentUser() user: User) {
    return this.service.listReminders(user.id).then((data) => ({ data }));
  }

  @Post('reminders')
  createReminder(@CurrentUser() user: User, @Body() dto: CreateReminderDto) {
    return this.service.createReminder(user.id, dto.jobId, dto).then((data) => ({ data }));
  }

  @Patch('reminders/:id/complete')
  completeReminder(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: { completed: boolean },
  ) {
    return this.service.completeReminder(user.id, id, body.completed ?? true).then((data) => ({
      data,
    }));
  }

  @Delete('reminders/:id')
  deleteReminder(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteReminder(user.id, id).then((data) => ({ data }));
  }
}
