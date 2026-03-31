import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { NightCanteenModule } from './night-canteen/night-canteen.module';
import { HostelIssuesModule } from './hostel-issues/hostel-issues.module';
import { CampusMapModule } from './campus-map/campus-map.module';
import { CourseMaterialsModule } from './course-materials/course-materials.module';
import { NoticeboardModule } from './noticeboard/noticeboard.module';
import { AiModule } from './ai/ai.module';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { InputSanitizationMiddleware } from './common/middleware/input-sanitization.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { CanteenModule } from './canteen/canteen.module';
import { AdminModule } from './admin/admin.module';

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
    CanteenModule,
    NightCanteenModule,
    HostelIssuesModule,
    CampusMapModule,
    CourseMaterialsModule,
    NoticeboardModule,
    AdminModule,
    AiModule,
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 60000,
      limit: 100,
    }, {
      name: 'long',
      ttl: 600000,
      limit: 1000,
    }]),
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
      useClass: ThrottlerGuard,
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
