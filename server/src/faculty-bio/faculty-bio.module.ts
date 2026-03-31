import { Module } from '@nestjs/common';
import { FacultyBioController } from './faculty-bio.controller';
import { FacultyBioService } from './faculty-bio.service';

@Module({
  controllers: [FacultyBioController],
  providers: [FacultyBioService],
})
export class FacultyBioModule {}
