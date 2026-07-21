import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService, CrmRepository } from './crm.service';

@Module({
  controllers: [CrmController],
  providers: [CrmService, CrmRepository],
})
export class CrmModule {}
