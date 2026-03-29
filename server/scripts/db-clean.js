#!/usr/bin/env node

/**
 * Database cleaning script
 * Removes all data from tables while preserving the table structure (schema)
 * Order matters to respect foreign key constraints
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleaning...\n');

    // Order matters - delete child records before parent records
    const deletions = [
      { name: 'RefreshToken', operation: () => prisma.refreshToken.deleteMany({}) },
      { name: 'EmailVerificationToken', operation: () => prisma.emailVerificationToken.deleteMany({}) },
      { name: 'PasswordResetToken', operation: () => prisma.passwordResetToken.deleteMany({}) },
      { name: 'Message', operation: () => prisma.message.deleteMany({}) },
      { name: 'UserChatRoom', operation: () => prisma.userChatRoom.deleteMany({}) },
      { name: 'ChatRoom', operation: () => prisma.chatRoom.deleteMany({}) },
      { name: 'Grade', operation: () => prisma.grade.deleteMany({}) },
      { name: 'Attendance', operation: () => prisma.attendance.deleteMany({}) },
      { name: 'Assignment', operation: () => prisma.assignment.deleteMany({}) },
      { name: 'ExamSchedule', operation: () => prisma.examSchedule.deleteMany({}) },
      { name: 'Enrollment', operation: () => prisma.enrollment.deleteMany({}) },
      { name: 'CanteenOrder', operation: () => prisma.canteenOrder.deleteMany({}) },
      { name: 'BookBorrow', operation: () => prisma.bookBorrow.deleteMany({}) },
      { name: 'FeeRecord', operation: () => prisma.feeRecord.deleteMany({}) },
      { name: 'Timetable', operation: () => prisma.timetable.deleteMany({}) },
      { name: 'UserRole', operation: () => prisma.userRole.deleteMany({}) },
      { name: 'StudentProfile', operation: () => prisma.studentProfile.deleteMany({}) },
      { name: 'FacultyProfile', operation: () => prisma.facultyProfile.deleteMany({}) },
      { name: 'User', operation: () => prisma.user.deleteMany({}) },
      { name: 'Role', operation: () => prisma.role.deleteMany({}) },
      { name: 'CanteenItem', operation: () => prisma.canteenItem.deleteMany({}) },
      { name: 'HostelIssue', operation: () => prisma.hostelIssue.deleteMany({}) },
      { name: 'CampusMapRegion', operation: () => prisma.campusMapRegion.deleteMany({}) },
      { name: 'CampusMapRoad', operation: () => prisma.campusMapRoad.deleteMany({}) },
      { name: 'CourseMaterial', operation: () => prisma.courseMaterial.deleteMany({}) },
      { name: 'Course', operation: () => prisma.course.deleteMany({}) },
      { name: 'Department', operation: () => prisma.department.deleteMany({}) },
      { name: 'Book', operation: () => prisma.book.deleteMany({}) },
      { name: 'Room', operation: () => prisma.room.deleteMany({}) },
      { name: 'Job', operation: () => prisma.job.deleteMany({}) },
      { name: 'AuditLog', operation: () => prisma.auditLog.deleteMany({}) },
      { name: 'FeatureFlag', operation: () => prisma.featureFlag.deleteMany({}) },
    ];

    let totalDeleted = 0;

    for (const deletion of deletions) {
      try {
        const result = await deletion.operation();
        console.log(`✓ ${deletion.name}: ${result} records deleted`);
        totalDeleted += result;
      } catch (error) {
        // Some tables might not exist or might be optional
        console.log(`⊘ ${deletion.name}: skipped (table may not exist or is empty)`);
      }
    }

    console.log(`\n✅ Database cleaning complete! Total records deleted: ${totalDeleted}\n`);
  } catch (error) {
    console.error('❌ Error during database cleaning:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run with confirmation
if (process.argv.includes('--force') || process.argv.includes('-f')) {
  cleanDatabase();
} else {
  console.log('⚠️  WARNING: This will DELETE ALL DATA from the database (but keep tables intact).\n');
  console.log('Usage: npm run db:clean -- --force\n');
  console.log('To proceed, run: npm run db:clean -- --force\n');
}
