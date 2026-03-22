import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';

@Module({
  providers: [LibraryService],
  controllers: [LibraryController]
})
export class LibraryModule {}
