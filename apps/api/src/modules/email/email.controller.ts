import { Controller, Get, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';
import { GenerateEmailDto } from './dto/generate-email.dto';

@ApiTags('email')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('email')
export class EmailModuleController {
  constructor(@Inject(EmailService) private service: EmailService) {}

  @Get('templates')
  listTemplates() {
    return { data: this.service.listTemplates() };
  }

  @Post('generate')
  async generate(@CurrentUser() user: User, @Body() dto: GenerateEmailDto) {
    const data = await this.service.generate(user.id, dto.jobId, dto.templateId);
    return { data };
  }
}
