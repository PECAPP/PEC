import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { db } from '@pec/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly extended = db;

  // Delegate strictly defined PrismaClient models to db
  public get user() { return db.user; }
  public get cgpaEntry() { return db.cgpaEntry; }
  public get hostelIssue() { return db.hostelIssue; }
  public get campusMapRegion() { return db.campusMapRegion; }
  public get collegeSettings() { return db.collegeSettings; }
  public get campusMapRoad() { return db.campusMapRoad; }
  public get courseMaterial() { return db.courseMaterial; }
  public get role() { return db.role; }
  public get permission() { return db.permission; }
  public get rolePermission() { return db.rolePermission; }
  public get userRole() { return db.userRole; }
  public get refreshToken() { return db.refreshToken; }
  public get emailVerificationToken() { return db.emailVerificationToken; }
  public get passwordResetToken() { return db.passwordResetToken; }
  public get studentProfile() { return db.studentProfile; }
  public get facultyProfile() { return db.facultyProfile; }
  public get department() { return db.department; }
  public get course() { return db.course; }
  public get enrollment() { return db.enrollment; }
  public get feeRecord() { return db.feeRecord; }
  public get financeTransaction() { return db.financeTransaction; }
  public get timetable() { return db.timetable; }
  public get room() { return db.room; }
  public get chatRoom() { return db.chatRoom; }
  public get notice() { return db.notice; }
  public get club() { return db.club; }
  public get clubJoinRequest() { return db.clubJoinRequest; }
  public get notification() { return db.notification; }
  public get message() { return db.message; }
  public get userChatRoom() { return db.userChatRoom; }
  public get attendance() { return db.attendance; }
  public get attendanceSession() { return db.attendanceSession; }
  public get examSchedule() { return db.examSchedule; }
  public get job() { return db.job; }
  public get auditLog() { return db.auditLog; }
  public get featureFlag() { return db.featureFlag; }
  public get backgroundJob() { return db.backgroundJob; }
  public get canteenItem() { return db.canteenItem; }
  public get canteenOrder() { return db.canteenOrder; }
  public get canteenOrderItem() { return db.canteenOrderItem; }
  public get scoreEntry() { return db.scoreEntry; }
  public get resumeProfile() { return db.resumeProfile; }
  public get studentProject() { return db.studentProject; }
  public get studentSkill() { return db.studentSkill; }
  public get facultyPublication() { return db.facultyPublication; }
  public get facultyAward() { return db.facultyAward; }
  public get facultyConference() { return db.facultyConference; }
  public get facultyConsultation() { return db.facultyConsultation; }
  public get academicCalendarEvent() { return db.academicCalendarEvent; }
  public get marketplaceListing() { return db.marketplaceListing; }
  public get marketplaceBookmark() { return db.marketplaceBookmark; }
  public get marketplaceChat() { return db.marketplaceChat; }
  public get marketplaceMessage() { return db.marketplaceMessage; }

  // Database raw operations
  public $transaction = db.$transaction.bind(db);
  public $executeRawUnsafe = db.$executeRawUnsafe.bind(db);
  public $executeRaw = db.$executeRaw.bind(db);
  public $queryRaw = db.$queryRaw.bind(db);
  public $queryRawUnsafe = db.$queryRawUnsafe.bind(db);

  async onModuleInit() {
    // db connects automatically
  }

  async onModuleDestroy() {
    // let db handle disconnect
  }
}
