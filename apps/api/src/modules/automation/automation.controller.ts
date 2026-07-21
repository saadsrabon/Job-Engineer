import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('automation')
@ApiBearerAuth()
@Controller('automation')
export class AutomationController {
  @Get()
  stub() {
    return { data: { message: 'Automation module — Phase 3' } };
  }
}
