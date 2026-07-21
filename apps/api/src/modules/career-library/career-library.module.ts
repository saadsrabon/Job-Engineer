import { Module } from '@nestjs/common';
import { CareerLibraryController } from './career-library.controller';
import { CareerLibraryService } from './career-library.service';
import { CareerLibraryRepository } from './career-library.repository';

@Module({
  controllers: [CareerLibraryController],
  providers: [CareerLibraryService, CareerLibraryRepository],
  exports: [CareerLibraryService, CareerLibraryRepository],
})
export class CareerLibraryModule {}
