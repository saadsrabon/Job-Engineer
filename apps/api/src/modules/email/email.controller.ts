import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('email')
@ApiBearerAuth()
@Controller('email')
export class EmailModuleController {
  @Get()
  stub() {
    return { data: { message: 'Email module — Phase 2' } };
  }
}
