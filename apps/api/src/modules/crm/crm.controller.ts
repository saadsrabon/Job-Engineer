import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CrmService } from './crm.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreateTagDto } from './dto/create-tag.dto';

@ApiTags('crm')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('crm')
export class CrmController {
  constructor(private service: CrmService) {}

  @Post('jobs/:jobId/notes')
  createNote(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.service.createNote(user.id, jobId, dto.content).then((data) => ({ data }));
  }

  @Delete('jobs/:jobId/notes/:noteId')
  deleteNote(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.service.deleteNote(user.id, jobId, noteId).then((data) => ({ data }));
  }

  @Get('tags')
  listTags(@CurrentUser() user: User) {
    return this.service.listTags(user.id).then((data) => ({ data }));
  }

  @Post('tags')
  createTag(@CurrentUser() user: User, @Body() dto: CreateTagDto) {
    return this.service.createTag(user.id, dto.name, dto.color).then((data) => ({ data }));
  }

  @Post('jobs/:jobId/tags/:tagId')
  addTag(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.service.addTagToJob(user.id, jobId, tagId).then((data) => ({ data }));
  }

  @Delete('jobs/:jobId/tags/:tagId')
  removeTag(
    @CurrentUser() user: User,
    @Param('jobId') jobId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.service.removeTagFromJob(user.id, jobId, tagId).then((data) => ({ data }));
  }
}
