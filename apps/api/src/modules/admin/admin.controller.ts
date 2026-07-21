import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  @Get()
  stub() {
    return { data: { message: 'Admin module — Phase 2' } };
  }
}
