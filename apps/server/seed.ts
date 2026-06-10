import * as bcrypt from 'bcrypt';
import { prisma, clearDatabase } from './seeds/utils';
import { seedDepartments } from './seeds/departments';
import { seedCoreUsers } from './seeds/users';
import { seedFaculty } from './seeds/faculty';
import { seedFacultyPortfolios } from './seeds/faculty_portfolios';
import { seedStudents } from './seeds/students';
import { seedCourses } from './seeds/courses';
import { seedAcademicRecords } from './seeds/academic_records';
import { seedTimetable } from './seeds/timetable';
import { seedNoticeboard } from './seeds/noticeboard';
import { seedCommunicationAndActivity } from './seeds/communication';
import { seedCampusFacilities } from './seeds/campus_facilities';
import { seedAcademicCalendar } from './seeds/academic_calendar';
import { seedMarketplace } from './seeds/marketplace';
import { seedFinance } from './seeds/finance';
import { seedPermissions } from './seed-permissions';
import { seedInfrastructure } from './seeds/infrastructure';
import { seedCourseMaterials } from './seeds/course_materials';
import { seedClubs } from './seeds/clubs';
import { seedUserContent } from './seeds/user_content';

async function main() {
  console.log('--- Starting Modular PEC Campus Seed ---');

  try {
    console.log('1. Clearing existing database...');
    await clearDatabase();

    console.log('2. Seeding departments...');
    await seedDepartments();

    const passwordHash = await bcrypt.hash('password123', 12);

    console.log('3. Seeding core users (College Admins)...');
    const admin = await seedCoreUsers(passwordHash);

    console.log('4. Seeding faculty and profiles...');
    const faculties = await seedFaculty(passwordHash);

    console.log('4.5. Seeding faculty portfolios...');
    await seedFacultyPortfolios();

    console.log('5. Seeding students and profiles...');
    const students = await seedStudents(passwordHash);

    console.log('6. Seeding courses...');
    const courses = await seedCourses(faculties);

    console.log('7. Seeding academic records (Enrollments, Attendance, Exams)...');
    await seedAcademicRecords(students, courses);

    console.log('8. Generating complex timetable...');
    await seedTimetable(courses);

    console.log('9. Seeding campus facilities (Canteen & Hostel)...');
    await seedCampusFacilities(students);

    console.log('10. Seeding noticeboard...');
    await seedNoticeboard(admin.id, faculties);

    console.log('11. Seeding communication systems (Chat, Audit, Flags)...');
    await seedCommunicationAndActivity(admin.id, faculties, students, courses);

    console.log('12. Seeding academic calendar...');
    await seedAcademicCalendar(admin.id);

    console.log('13. Seeding marketplace listings...');
    await seedMarketplace(students);

    console.log('14. Seeding finance (fees & transactions)...');
    await seedFinance(students);

    console.log('15. Seeding infrastructure (Rooms)...');
    await seedInfrastructure();

    console.log('16. Seeding course materials...');
    await seedCourseMaterials(courses);

    console.log('17. Seeding clubs...');
    await seedClubs(prisma);

    console.log('18. Seeding roles and permissions...');
    await seedPermissions();

    console.log('19. Seeding user generated content (Projects, Settings, Issues, etc.)...');
    await seedUserContent([admin], students, faculties, courses);

    console.log('20. Seeding CollegeSettings...');
    await prisma.collegeSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: {
        id: 'main',
        name: 'Punjab Engineering College (Deemed to be University)',
        shortName: 'PEC',
        primaryColor: '#1a1a2e',
        secondaryColor: '#ffffff',
        accentColor: '#c9a227',
        attendanceRequiredPercentage: 75,
        academicSession: '2025-26',
        semester: 5,
        allowRegistration: true,
        allowLogin: true,
        lastUpdatedBy: admin.id,
      },
    });

    console.log('21. Seeding Notifications...');
    const allUsers = [admin, ...students.slice(0, 50), ...faculties.slice(0, 20)];
    const notifData: any[] = [];
    const notifTemplates = [
      { title: 'Fee Due Reminder', message: 'Your semester fee payment is due by 30th June. Please pay via the Finance module.', type: 'warning', link: '/finance' },
      { title: 'Attendance Warning', message: 'Your attendance has fallen below 75% in one or more subjects. Please regularize attendance.', type: 'alert', link: '/attendance' },
      { title: 'Exam Schedule Released', message: 'Mid-semester exam schedule is now available. Check your timetable.', type: 'info', link: '/timetable' },
      { title: 'Notice Posted', message: 'A new important notice has been posted by the Administration.', type: 'info', link: '/noticeboard' },
      { title: 'Club Request Update', message: 'Your request to join the Robotics Society has been reviewed.', type: 'success', link: '/clubs' },
      { title: 'Course Material Added', message: 'New study material has been uploaded for your enrolled course.', type: 'info', link: '/courses' },
      { title: 'Marketplace Offer', message: 'Someone made an offer on your marketplace listing.', type: 'success', link: '/marketplace' },
      { title: 'Hostel Issue Resolved', message: 'Your hostel complaint has been marked as resolved.', type: 'success', link: '/hostel' },
    ];
    for (const user of allUsers) {
      const numNotifs = Math.floor(Math.random() * 5) + 1;
      for (let n = 0; n < numNotifs; n++) {
        const tmpl = notifTemplates[Math.floor(Math.random() * notifTemplates.length)];
        notifData.push({
          userId: user.id,
          title: tmpl.title,
          message: tmpl.message,
          type: tmpl.type,
          link: tmpl.link,
          read: Math.random() > 0.4,
        });
      }
    }
    await (prisma as any).notification.createMany({ data: notifData });

    console.log('--- Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Critical failure during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
