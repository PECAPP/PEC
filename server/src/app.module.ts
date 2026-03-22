import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { TimetableModule } from './timetable/timetable.module';
import { ExaminationsModule } from './examinations/examinations.module';
import { DepartmentsModule } from './departments/departments.module';
import { FeatureFlagsModule } from './feature-flags/feature-flags.module';
import { BackgroundJobsModule } from './background-jobs/background-jobs.module';
import { FeeRecordsModule } from './fee-records/fee-records.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { RateLimitGuard } from './common/guards/rate-limit.guard';
import { InputSanitizationMiddleware } from './common/middleware/input-sanitization.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    ChatModule,
    AttendanceModule,
    CoursesModule,
    EnrollmentsModule,
    TimetableModule,
    ExaminationsModule,
    DepartmentsModule,
    FeatureFlagsModule,
    BackgroundJobsModule,
    FeeRecordsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(InputSanitizationMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
