import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with mock data...');

  // Create Departments
  const departments = [];
  for (let i = 0; i < 5; i++) {
    departments.push(await prisma.department.upsert({
      where: { code: `DEPT-${i}` },
      update: {},
      create: {
        code: `DEPT-${i}`,
        name: faker.commerce.department() + ' ' + faker.string.alphanumeric(4),
        description: faker.lorem.sentence(),
      }
    }));
  }
  console.log(`Created ${departments.length} departments.`);

  // Create Courses
  const courses = [];
  for (let i = 0; i < 20; i++) {
    courses.push(await prisma.course.upsert({
      where: { code: `CS${100 + i}` },
      update: {},
      create: {
        code: `CS${100 + i}`,
        name: faker.company.catchPhrase(),
        credits: faker.number.int({ min: 1, max: 4 }),
        instructor: faker.person.fullName(),
        department: departments[i % departments.length].name,
        semester: faker.number.int({ min: 1, max: 8 }),
        status: 'active',
        capacity: faker.number.int({ min: 30, max: 100 })
      }
    }));
  }
  console.log(`Created ${courses.length} courses.`);

  // Create Students
  console.log('Creating 100 fake students (this might take a few seconds)...');
  for (let i = 0; i < 100; i++) {
    const student = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        profileComplete: true,
        studentProfile: {
          create: {
            enrollmentNumber: `ENR-${faker.string.numeric(6)}`,
            department: departments[i % departments.length].name,
            semester: faker.number.int({ min: 1, max: 8 }),
            phone: faker.phone.number({ style: 'international' }),
          }
        }
      }
    });

    // Enroll in random courses
    for (let j = 0; j < 3; j++) {
      const course = courses[faker.number.int({ min: 0, max: courses.length - 1 })];
      
      // Prevent duplicate enrollments
      const existing = await prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: student.id, courseId: course.id } }
      });

      if (!existing) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            courseName: course.name,
            courseCode: course.code,
            semester: course.semester
          }
        });
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
