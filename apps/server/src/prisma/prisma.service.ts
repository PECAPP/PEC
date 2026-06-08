import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { db } from '@pec/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly extended = db;

  // Delegate all PrismaClient properties to db
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

  public readonly extended = db;

  // Delegate all PrismaClient properties to db
  public get user() { return db.user; }
  public get academicSession() { return db.academicSession; }
  public get student() { return db.student; }
  public get userRole() { return db.userRole; }
  public get permission() { return db.permission; }
  public get systemLog() { return db.systemLog; }
  public get errorLog() { return db.errorLog; }
  public get rateLimit() { return db.rateLimit; }
  public get department() { return db.department; }
  public get program() { return db.program; }
  public get course() { return db.course; }
  public get courseOffering() { return db.courseOffering; }
  public get courseRegistration() { return db.courseRegistration; }
  public get cgpaEntry() { return db.cgpaEntry; }
  public get gradeLog() { return db.gradeLog; }
  public get timetable() { return db.timetable; }
  public get attendanceSession() { return db.attendanceSession; }
  public get attendanceRecord() { return db.attendanceRecord; }
  public get attendanceAppeal() { return db.attendanceAppeal; }
  public get attendance() { return db.attendance; }
  public get academicCalendarEvent() { return db.academicCalendarEvent; }
  public get studentProfile() { return db.studentProfile; }
  public get facultyProfile() { return db.facultyProfile; }
  public get enrollment() { return db.enrollment; }
  public get hostelIssue() { return db.hostelIssue; }
  public get canteenItem() { return db.canteenItem; }
  public get emailVerificationToken() { return db.emailVerificationToken; }
  public get refreshToken() { return db.refreshToken; }
  public get room() { return db.room; }
  public get booking() { return db.booking; }
  public get examSchedule() { return db.examSchedule; }
  public get result() { return db.result; }
  public get feeCategory() { return db.feeCategory; }
  public get feeRecord() { return db.feeRecord; }
  public get feeTransaction() { return db.feeTransaction; }
  public get financialAid() { return db.financialAid; }
  public get scholarship() { return db.scholarship; }
  public get notice() { return db.notice; }
  public get circular() { return db.circular; }
  public get chatRoom() { return db.chatRoom; }
  public get userChatRoom() { return db.userChatRoom; }
  public get message() { return db.message; }
  public get chatParticipant() { return db.chatParticipant; }
  public get chatMessage() { return db.chatMessage; }
  public get chatAttachment() { return db.chatAttachment; }
  public get messageReaction() { return db.messageReaction; }
  public get clubJoinRequest() { return db.clubJoinRequest; }
  public get groupSetting() { return db.groupSetting; }
  public get hostel() { return db.hostel; }
  public get roomAllocation() { return db.roomAllocation; }
  public get gatePass() { return db.gatePass; }
  public get messMenu() { return db.messMenu; }
  public get complaint() { return db.complaint; }
  public get staffBio() { return db.staffBio; }
  public get libraryBook() { return db.libraryBook; }
  public get libraryTransaction() { return db.libraryTransaction; }
  public get mapRegion() { return db.mapRegion; }
  public get mapRoad() { return db.mapRoad; }
  public get menuCategory() { return db.menuCategory; }
  public get menuItem() { return db.menuItem; }
  public get order() { return db.order; }
  public get orderItem() { return db.orderItem; }
  public get nightCanteenVendor() { return db.nightCanteenVendor; }
  public get marketplaceCategory() { return db.marketplaceCategory; }
  public get marketplaceListing() { return db.marketplaceListing; }
  public get marketplaceOffer() { return db.marketplaceOffer; }
  public get bookmark() { return db.bookmark; }
  public get company() { return db.company; }
  public get job() { return db.job; }
  public get jobApplication() { return db.jobApplication; }
  public get interview() { return db.interview; }
  public get placementStats() { return db.placementStats; }
  public get studentPortfolio() { return db.studentPortfolio; }
  public get project() { return db.project; }
  public get skill() { return db.skill; }
  public get certification() { return db.certification; }
  public get club() { return db.club; }
  public get clubMember() { return db.clubMember; }
  public get event() { return db.event; }
  public get notification() { return db.notification; }
  public get auditLog() { return db.auditLog; }
  public get sysConfig() { return db.sysConfig; }

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
