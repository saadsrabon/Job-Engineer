import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStageDto } from './dto/update-job-stage.dto';

@ApiTags('jobs')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private service: JobsService) {}

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.service.findAll(user.id).then((data) => ({ data }));
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: User) {
    return this.service.getDashboard(user.id).then((data) => ({ data }));
  }

  @Get(':id')
  findById(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.findById(user.id, id).then((data) => ({ data }));
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateJobDto) {
    return this.service.create(user.id, dto).then((data) => ({ data }));
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreateJobDto) {
    return this.service.update(user.id, id, dto).then((data) => ({ data }));
  }

  @Patch(':id/stage')
  updateStage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateJobStageDto,
  ) {
    return this.service.updateStage(user.id, id, dto.stage).then((data) => ({ data }));
  }

  @Delete(':id')
  delete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.delete(user.id, id).then((data) => ({ data }));
  }
}
