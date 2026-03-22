import { IsDateString, IsString } from 'class-validator';

export class CreateExamScheduleDto {
  @IsString()
  courseId: string;

  @IsString()
  examType: string;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  room: string;
}
