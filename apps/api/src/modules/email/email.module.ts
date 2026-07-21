import { Module } from '@nestjs/common';
import { EmailModuleController } from './email.controller';

@Module({ controllers: [EmailModuleController] })
export class EmailModule {}
