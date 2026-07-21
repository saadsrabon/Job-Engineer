import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { ResumeService } from './resume.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@jobos/database';

@ApiTags('resume')
@ApiBearerAuth()
@UseGuards(ClerkAuthGuard)
@Controller('resume')
export class ResumeController {
  constructor(private service: ResumeService) {}

  @Post('upload')
  @HttpCode(202)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  upload(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.service.upload(user.id, file).then((data) => ({ data }));
  }

  @Get('parse-jobs')
  listParseJobs(@CurrentUser() user: User) {
    return this.service.listParseJobs(user.id).then((data) => ({ data }));
  }

  @Get('parse-jobs/:id')
  getParseJob(@CurrentUser() user: User, @Param('id') id: string) {
    return this.service.getParseJob(user.id, id).then((data) => ({ data }));
  }

  @Get('versions')
  listVersions(@CurrentUser() user: User) {
    return this.service.listVersions(user.id).then((data) => ({ data }));
  }

  @Post('export')
  exportPdf(@CurrentUser() user: User) {
    return { data: this.service.exportPdf(user.id) };
  }
}
