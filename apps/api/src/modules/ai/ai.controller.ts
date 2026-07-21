import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  @Get()
  stub() {
    return { data: { message: 'AI module — Phase 2' } };
  }
}
