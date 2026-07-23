import { Controller, Get, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { resolveAiConfigPublic } from '@jobos/shared';
import { AiService } from './ai.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';
import { CoachAnswerDto, JobAiDto } from './dto/ai.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('ai')
export class AiController {
  constructor(@Inject(AiService) private service: AiService) {}

  @Get('provider')
  getProvider() {
    return { data: resolveAiConfigPublic() };
  }

  @Post('ats-score')
  async scoreAts(@CurrentUser() user: User, @Body() dto: JobAiDto) {
    const data = await this.service.scoreAts(user.id, dto.jobId);
    return { data };
  }

  @Post('analyze-job')
  async analyzeJob(@CurrentUser() user: User, @Body() dto: JobAiDto) {
    const data = await this.service.analyzeJob(user.id, dto.jobId);
    return { data };
  }

  @Post('cover-letter')
  async coverLetter(@CurrentUser() user: User, @Body() dto: JobAiDto) {
    const data = await this.service.generateCoverLetter(user.id, dto.jobId);
    return { data };
  }

  @Post('coach-answer')
  async coachAnswer(@CurrentUser() user: User, @Body() dto: CoachAnswerDto) {
    const data = await this.service.coachAnswer(user.id, dto.questionId);
    return { data };
  }
}
