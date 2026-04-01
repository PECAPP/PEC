import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 PEC Campus Database Explorer\n');

  try {
    // Get all tables
    console.log('📊 Available Models:\n');
    
    const modelCount = {
      'Users': await prisma.user.count(),
      'Student Profiles': await prisma.studentProfile.count(),
      'Faculty Profiles': await prisma.facultyProfile.count(),
      'Departments': await prisma.department.count(),
      'Courses': await prisma.course.count(),
      'Enrollments': await prisma.enrollment.count(),
      'Timetable Entries': await prisma.timetable.count(),
      'Exam Schedules': await prisma.examSchedule.count(),
      'Attendance Records': await prisma.attendance.count(),
      'Academic Calendar Events': await prisma.academicCalendarEvent.count(),
      'Notices': await prisma.notice.count(),
      'Chat Rooms': await prisma.chatRoom.count(),
      'Messages': await prisma.message.count(),
      'Clubs': await prisma.club.count(),
      'Hostel Issues': await prisma.hostelIssue.count(),
      'Canteen Items': await prisma.canteenItem.count(),
      'Canteen Orders': await prisma.canteenOrder.count(),
      'Notifications': await prisma.notification.count(),
    };

    Object.entries(modelCount).forEach(([name, count]) => {
      console.log(`  • ${name}: ${count} records`);
    });

    console.log('\n✅ Database connection successful!');
    console.log('\n💡 To view/edit data visually, use:');
    console.log('   1. pgAdmin (https://www.pgadmin.org/)');
    console.log('   2. DBeaver (https://dbeaver.io/)');
    console.log('   3. TablePlus (https://tableplus.com/)');
    console.log('   4. VS Code PostgreSQL extension');
    console.log('\n📝 Connection string:');
    console.log('   postgresql://postgres:postgres@localhost:5432/pec\n');

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
