import { Module } from '@nestjs/common';
import { FacultyBioSystemController } from './faculty-bio-system.controller';
import { FacultyBioSystemService } from './faculty-bio-system.service';

@Module({
  controllers: [FacultyBioSystemController],
  providers: [FacultyBioSystemService],
})
export class FacultyBioSystemModule {}
