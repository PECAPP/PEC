import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';
import { LibraryRepository } from './library.repository';

@Module({
  providers: [LibraryService, LibraryRepository],
  controllers: [LibraryController],
})
export class LibraryModule {}
