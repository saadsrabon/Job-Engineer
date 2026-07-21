import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('interviews')
@ApiBearerAuth()
@Controller('interviews')
export class InterviewsController {
  @Get()
  stub() {
    return { data: { message: 'Interview module — Phase 2' } };
  }
}
