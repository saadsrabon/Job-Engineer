import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InterviewsService } from './interviews.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';
import { PracticeQuestionDto } from './dto/practice-question.dto';
import { CreateInterviewRoundDto, UpdateInterviewRoundDto } from './dto/interview-round.dto';

@ApiTags('interviews')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('interviews')
export class InterviewsController {
  constructor(@Inject(InterviewsService) private service: InterviewsService) {}

  @Get('companies')
  listCompanies() {
    return this.service.listCompanies().then((data) => ({ data }));
  }

  @Get('companies/:slug')
  async getCompany(@Param('slug') slug: string) {
    const company = await this.service.getCompany(slug);
    if (!company) throw new NotFoundException('Company not found');
    return { data: company };
  }

  @Get('companies/:slug/questions')
  getCompanyQuestions(@Param('slug') slug: string) {
    return this.service.getCompany(slug).then((data) => ({ data: data?.questions ?? [] }));
  }

  @Get('questions/search')
  searchQuestions(@Query('q') q: string) {
    return this.service.searchQuestions(q || '').then((data) => ({ data }));
  }

  @Get('topics/:topic/questions')
  getTopicQuestions(@Param('topic') topic: string) {
    return this.service.getQuestionsByTopic(topic).then((data) => ({ data }));
  }

  @Get('mock/session')
  mockSession(@Query('company') company?: string) {
    return this.service.getMockSession(company).then((data) => ({ data }));
  }

  @Get('topics')
  listTopics() {
    return this.service.listTopics().then((data) => ({ data }));
  }

  @Get('progress')
  getProgress(@CurrentUser() user: User) {
    return this.service.getProgress(user.id).then((data) => ({ data }));
  }

  @Get('sync-meta')
  getSyncMeta() {
    return this.service.getSyncMeta().then((data) => ({ data }));
  }

  @Get('jobs/:jobId/suggested')
  suggestedForJob(@CurrentUser() user: User, @Param('jobId') jobId: string) {
    return this.service.getSuggestedForJob(user.id, jobId).then((data) => ({ data }));
  }

  @Get('jobs/:jobId/rounds')
  listRounds(@CurrentUser() user: User, @Param('jobId') jobId: string) {
    return this.service.listRounds(user.id, jobId).then((data) => ({ data }));
  }

  @Post('jobs/:jobId/rounds')
  createRound(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Body() dto: CreateInterviewRoundDto,
  ) {
    return this.service.createRound(user.id, jobId, dto).then((data) => ({ data }));
  }

  @Patch('jobs/:jobId/rounds/:roundId')
  updateRound(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Param('roundId') roundId: string,
    @Body() dto: UpdateInterviewRoundDto,
  ) {
    return this.service.updateRound(user.id, jobId, roundId, dto).then((data) => ({ data }));
  }

  @Delete('jobs/:jobId/rounds/:roundId')
  deleteRound(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Param('roundId') roundId: string,
  ) {
    return this.service.deleteRound(user.id, jobId, roundId).then((data) => ({ data }));
  }

  @Post('practice/:questionId')
  practice(
    @CurrentUser() user: User,
    @Param('questionId') questionId: string,
    @Body() dto: PracticeQuestionDto,
  ) {
    return this.service
      .practiceQuestion(user.id, questionId, dto.confidence)
      .then((data) => ({ data }));
  }
}
