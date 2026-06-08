import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { CqrsModule } from '@nestjs/cqrs';
import { LoggerModule } from 'nestjs-pino';
import Redis from 'ioredis';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
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
import { RoomsModule } from './rooms/rooms.module';
import { SocialSyncModule } from './social-sync/social-sync.module';
import { StudentPortfolioModule } from './student-portfolio/student-portfolio.module';
import { AttendanceSessionModule } from './attendance-session/attendance-session.module';
import { FacultyBioSystemModule } from './faculty-bio-system/faculty-bio-system.module';
import { CgpaEntriesModule } from './cgpa-entries/cgpa-entries.module';
import { AcademicCalendarModule } from './academic-calendar/academic-calendar.module';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { InputSanitizationMiddleware } from './common/middleware/input-sanitization.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { CanteenModule } from './canteen/canteen.module';
import { AdminModule } from './admin/admin.module';
import { CollegeSettingsModule } from './college-settings/college-settings.module';
import { ClubsModule } from './clubs/clubs.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { FinanceModule } from './finance/finance.module';
import { RolesMgmtModule } from './roles/roles-mgmt.module';
import { PermissionsModule } from './permissions/permissions.module';
import { CaslModule } from './casl/casl.module';
import { GlobalCacheModule } from './cache/global-cache.module';
import { MaintenanceModule } from './maintenance/maintenance.module';

import { CommonServicesModule } from './common/common.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    CommonServicesModule,
    GlobalCacheModule,
    MaintenanceModule,
    PrometheusModule.register(),
    CaslModule,
    PermissionsModule,
    RolesMgmtModule,
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
    CgpaEntriesModule,
    AdminModule,
    AiModule,
    AttendanceSessionModule,
    RoomsModule,
    SocialSyncModule,
    StudentPortfolioModule,
    FacultyBioSystemModule,
    CollegeSettingsModule,
    ClubsModule,
    AcademicCalendarModule,
    MarketplaceModule,
    FinanceModule,
    SettingsModule,
    CqrsModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        storage: new ThrottlerStorageRedisService(new Redis(process.env.REDIS_URL || 'redis://localhost:6379')),
        throttlers: [
          { name: 'short', ttl: 60000, limit: 100 },
          { name: 'long', ttl: 600000, limit: 1000 },
        ],
      }),
    }),
    ScheduleModule.forRoot(),
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
