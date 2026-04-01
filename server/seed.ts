import * as bcrypt from 'bcrypt';
import { prisma, clearDatabase } from './seeds/utils';
import { seedDepartments } from './seeds/departments';
import { seedCoreUsers } from './seeds/users';
import { seedFaculty } from './seeds/faculty';
import { seedStudents } from './seeds/students';
import { seedCourses } from './seeds/courses';
import { seedAcademicRecords } from './seeds/academic_records';
import { seedTimetable } from './seeds/timetable';
import { seedNoticeboard } from './seeds/noticeboard';
import { seedCommunicationAndActivity } from './seeds/communication';
import { seedCampusFacilities } from './seeds/campus_facilities';
import { seedAcademicCalendar } from './seeds/academic_calendar';

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

    console.log('--- Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Critical failure during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
