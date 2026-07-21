import { Controller, Post, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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

  @Post('ats-score')
  scoreAts(@CurrentUser() user: User, @Body() dto: JobAiDto) {
    return this.service.scoreAts(user.id, dto.jobId).then((data) => ({ data }));
  }

  @Post('analyze-job')
  analyzeJob(@CurrentUser() user: User, @Body() dto: JobAiDto) {
    return this.service.analyzeJob(user.id, dto.jobId).then((data) => ({ data }));
  }

  @Post('cover-letter')
  coverLetter(@CurrentUser() user: User, @Body() dto: JobAiDto) {
    return this.service.generateCoverLetter(user.id, dto.jobId).then((data) => ({ data }));
  }

  @Post('coach-answer')
  coachAnswer(@CurrentUser() user: User, @Body() dto: CoachAnswerDto) {
    return this.service.coachAnswer(user.id, dto.questionId).then((data) => ({ data }));
  }
}
