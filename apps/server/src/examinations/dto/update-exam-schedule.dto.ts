import { PartialType } from '@nestjs/swagger';
import { CreateExamScheduleDto } from './create-exam-schedule.dto';
import { examinationSchema } from '@pec/shared';

export class UpdateExamScheduleDto extends PartialType(CreateExamScheduleDto) {
  static validate(data: unknown) {
    return examinationSchema.partial().parse(data);
  }
}
