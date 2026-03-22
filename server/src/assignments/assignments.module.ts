import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsRepository } from './assignments.repository';

@Module({
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsRepository],
})
export class AssignmentsModule {}
