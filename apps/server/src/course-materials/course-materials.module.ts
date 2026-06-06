import { Module } from '@nestjs/common';
import { CourseMaterialsController } from './course-materials.controller';
import { CourseMaterialsService } from './course-materials.service';
import { CourseMaterialsRepository } from './course-materials.repository';

@Module({
  controllers: [CourseMaterialsController],
  providers: [CourseMaterialsService, CourseMaterialsRepository],
})
export class CourseMaterialsModule {}
