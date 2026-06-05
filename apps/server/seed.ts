import { PrismaClient } from '@pec/database';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/pec";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create standard roles
  const roles = ['student', 'faculty', 'admin'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log('Roles seeded.');

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const studentRole = await prisma.role.findUnique({ where: { name: 'student' } });
  const facultyRole = await prisma.role.findUnique({ where: { name: 'faculty' } });

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pec.edu' },
    update: { password: hashedPassword, role: 'admin' },
    create: {
      email: 'admin@pec.edu',
      password: hashedPassword,
      name: 'System Admin',
      role: 'admin',
      roles: {
        create: {
          role: { connect: { id: adminRole!.id } },
        },
      },
    },
  });

  console.log('Admin user seeded:', admin.email);

  // Create Department
  const cseDept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
      description: 'Department of Computer Science',
      status: 'active',
    }
  });

  // Create student user
  const student = await prisma.user.upsert({
    where: { email: 'student@pec.edu' },
    update: { password: hashedPassword, role: 'student' },
    create: {
      email: 'student@pec.edu',
      password: hashedPassword,
      name: 'Test Student',
      role: 'student',
      roles: {
        create: {
          role: { connect: { id: studentRole!.id } },
        },
      },
      studentProfile: {
        create: {
          enrollmentNumber: '12345678',
          department: cseDept.code,
          semester: 1,
        }
      }
    },
  });

  console.log('Student user seeded:', student.email);

  // Create faculty user
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@pec.edu' },
    update: { password: hashedPassword, role: 'faculty' },
    create: {
      email: 'faculty@pec.edu',
      password: hashedPassword,
      name: 'Test Faculty',
      role: 'faculty',
      roles: {
        create: {
          role: { connect: { id: facultyRole!.id } },
        },
      },
      facultyProfile: {
        create: {
          employeeId: 'EMP12345',
          department: cseDept.code,
          designation: 'Professor',
        }
      }
    },
  });

  console.log('Faculty user seeded:', faculty.email);

  // --- SEED DUMMY DATA FOR MODULES ---
  
  // Cleanup test data to prevent duplicates on re-run
  await prisma.marketplaceListing.deleteMany({ where: { sellerId: student.id } });
  await prisma.attendance.deleteMany({ where: { studentId: student.id } });
  
  // Create a Course
  const course = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      code: 'CS101',
      name: 'Introduction to Computer Science',
      credits: 4,
      instructor: faculty.name,
      department: cseDept.code,
      semester: 1,
      status: 'active',
      facultyId: faculty.id,
      capacity: 60,
    }
  });
  
  await prisma.enrollment.deleteMany({ where: { studentId: student.id, courseId: course.id } });
  console.log('Course seeded:', course.code);

  // Enroll Student in Course
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      semester: course.semester,
      batch: '2023',
      status: 'active',
    }
  });
  console.log('Enrollment seeded for course:', course.code);

  // Create Attendance record
  const specificDate = new Date();
  specificDate.setHours(10, 0, 0, 0); // Normalize time
  
  await prisma.attendance.upsert({
    where: {
      studentId_date_subject: {
        studentId: student.id,
        date: specificDate,
        subject: course.name,
      }
    },
    update: {},
    create: {
      date: specificDate,
      status: 'present',
      subject: course.name,
      studentId: student.id,
      courseId: course.id,
      facultyId: faculty.id,
      method: 'manual',
    }
  });
  console.log('Attendance seeded for student in course:', course.code);

  // Create Marketplace Listing
  await prisma.marketplaceListing.create({
    data: {
      title: 'Data Structures and Algorithms Book',
      description: 'Used textbook in good condition.',
      price: 450,
      category: 'Books',
      condition: 'Good',
      images: ['https://placehold.co/600x400?text=DSA+Book'],
      status: 'Available',
      sellerId: student.id,
    }
  });
  console.log('Marketplace Listing seeded');

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
