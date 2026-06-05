import { IsString, IsOptional, IsEnum, IsDateString, IsBoolean } from 'class-validator';

export enum EventType {
  HOLIDAY = 'holiday',
  EXAM = 'exam',
  EVENT = 'event',
  DEADLINE = 'deadline',
  WORKING_DAY = 'working-day',
  ORIENTATION = 'orientation',
  REGISTRATION = 'registration',
  RESULT = 'result',
  RECESS = 'recess',
}

export enum EventCategory {
  ACADEMIC = 'academic',
  EXAMINATION = 'examination',
  HOLIDAY = 'holiday',
  ADMINISTRATIVE = 'administrative',
  CULTURAL = 'cultural',
  SPORTS = 'sports',
  TECHNICAL = 'technical',
}

export enum EventImportance {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export class CreateAcademicCalendarEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsEnum(EventType)
  eventType: EventType;

  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(EventImportance)
  @IsOptional()
  importance?: EventImportance;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsBoolean()
  @IsOptional()
  isEditable?: boolean;
}

export class UpdateAcademicCalendarEventDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsEnum(EventType)
  @IsOptional()
  eventType?: EventType;

  @IsEnum(EventCategory)
  @IsOptional()
  category?: EventCategory;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(EventImportance)
  @IsOptional()
  importance?: EventImportance;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsBoolean()
  @IsOptional()
  isEditable?: boolean;
}
