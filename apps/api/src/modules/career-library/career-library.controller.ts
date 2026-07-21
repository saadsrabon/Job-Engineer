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
import { CareerLibraryService } from './career-library.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { CreateEducationDto } from './dto/create-education.dto';

@ApiTags('career-library')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('career')
export class CareerLibraryController {
  constructor(private service: CareerLibraryService) {}

  @Get()
  getAll(@CurrentUser() user: User) {
    return this.service.getAll(user.id).then((data) => ({ data }));
  }

  @Post('experiences')
  createExperience(@CurrentUser() user: User, @Body() dto: CreateExperienceDto) {
    return this.service.createExperience(user.id, dto).then((data) => ({ data }));
  }

  @Patch('experiences/:id')
  updateExperience(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateExperienceDto,
  ) {
    return this.service.updateExperience(user.id, id, dto).then((data) => ({ data }));
  }

  @Delete('experiences/:id')
  deleteExperience(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteExperience(user.id, id).then((data) => ({ data }));
  }

  @Post('projects')
  createProject(@CurrentUser() user: User, @Body() dto: CreateProjectDto) {
    return this.service.createProject(user.id, dto).then((data) => ({ data }));
  }

  @Patch('projects/:id')
  updateProject(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.service.updateProject(user.id, id, dto).then((data) => ({ data }));
  }

  @Delete('projects/:id')
  deleteProject(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteProject(user.id, id).then((data) => ({ data }));
  }

  @Post('skills')
  createSkill(@CurrentUser() user: User, @Body() dto: CreateSkillDto) {
    return this.service.createSkill(user.id, dto).then((data) => ({ data }));
  }

  @Patch('skills/:id')
  updateSkill(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateSkillDto,
  ) {
    return this.service.updateSkill(user.id, id, dto).then((data) => ({ data }));
  }

  @Delete('skills/:id')
  deleteSkill(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteSkill(user.id, id).then((data) => ({ data }));
  }

  @Post('education')
  createEducation(@CurrentUser() user: User, @Body() dto: CreateEducationDto) {
    return this.service.createEducation(user.id, dto).then((data) => ({ data }));
  }

  @Patch('education/:id')
  updateEducation(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateEducationDto,
  ) {
    return this.service.updateEducation(user.id, id, dto).then((data) => ({ data }));
  }

  @Delete('education/:id')
  deleteEducation(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteEducation(user.id, id).then((data) => ({ data }));
  }
}
