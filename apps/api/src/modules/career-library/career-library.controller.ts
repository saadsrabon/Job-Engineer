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
import {
  CreateAwardDto,
  CreateCertificateDto,
  CreateLanguageDto,
  CreateSocialLinkDto,
} from './dto/create-extra.dto';

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

  @Post('certificates')
  createCertificate(@CurrentUser() user: User, @Body() dto: CreateCertificateDto) {
    return this.service.createCertificate(user.id, dto).then((data) => ({ data }));
  }

  @Patch('certificates/:id')
  updateCertificate(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateCertificateDto,
  ) {
    return this.service.updateCertificate(user.id, id, dto).then((data) => ({ data }));
  }

  @Delete('certificates/:id')
  deleteCertificate(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteCertificate(user.id, id).then((data) => ({ data }));
  }

  @Post('awards')
  createAward(@CurrentUser() user: User, @Body() dto: CreateAwardDto) {
    return this.service.createAward(user.id, dto).then((data) => ({ data }));
  }

  @Patch('awards/:id')
  updateAward(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: CreateAwardDto) {
    return this.service.updateAward(user.id, id, dto).then((data) => ({ data }));
  }

  @Delete('awards/:id')
  deleteAward(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteAward(user.id, id).then((data) => ({ data }));
  }

  @Post('languages')
  createLanguage(@CurrentUser() user: User, @Body() dto: CreateLanguageDto) {
    return this.service.createLanguage(user.id, dto).then((data) => ({ data }));
  }

  @Patch('languages/:id')
  updateLanguage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateLanguageDto,
  ) {
    return this.service.updateLanguage(user.id, id, dto).then((data) => ({ data }));
  }

  @Delete('languages/:id')
  deleteLanguage(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteLanguage(user.id, id).then((data) => ({ data }));
  }

  @Post('social-links')
  createSocialLink(@CurrentUser() user: User, @Body() dto: CreateSocialLinkDto) {
    return this.service.createSocialLink(user.id, dto).then((data) => ({ data }));
  }

  @Patch('social-links/:id')
  updateSocialLink(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: CreateSocialLinkDto,
  ) {
    return this.service.updateSocialLink(user.id, id, dto).then((data) => ({ data }));
  }

  @Delete('social-links/:id')
  deleteSocialLink(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.deleteSocialLink(user.id, id).then((data) => ({ data }));
  }
}
