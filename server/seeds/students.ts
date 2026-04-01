import { faker } from '@faker-js/faker';
import { prisma, encryptField, batchForSemester } from './utils';
import { 
  DEPARTMENTS, 
  SEMESTER_DISTRIBUTION,
  StudentSeed
} from './data';
import { createUserWithRole } from './users';

export async function seedStudents(passwordHash: string): Promise<StudentSeed[]> {
  const students: StudentSeed[] = [];
  console.log(`Seeding students for ${DEPARTMENTS.length} departments...`);

  for (let deptIndex = 0; deptIndex < DEPARTMENTS.length; deptIndex += 1) {
    const department = DEPARTMENTS[deptIndex];

    for (let studentIndex = 0; studentIndex < 15; studentIndex += 1) {
      const semester = SEMESTER_DISTRIBUTION[studentIndex % SEMESTER_DISTRIBUTION.length];
      
      const isArjun = deptIndex === 0 && studentIndex === 0;
      const firstName = isArjun ? 'Arjun' : faker.person.firstName();
      const lastName = isArjun ? 'Sharma' : faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      
      const email = isArjun ? 'arjun@pec.edu' : faker.internet.email({ firstName, lastName, provider: 'pec.edu' }).toLowerCase();

      const batch = batchForSemester(semester);
      
      const user = await createUserWithRole({
        email,
        name: fullName,
        role: 'student',
        passwordHash,
        githubUsername: faker.internet.username({ firstName, lastName }),
        linkedinUsername: `${firstName.toLowerCase()}-${lastName.toLowerCase()}-${faker.string.alphanumeric(4)}`,
        isPublicProfile: Math.random() > 0.1,
      });

      // Seeding profile with upsert logic
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          enrollmentNumber: `PEC${(batch || '2024').slice(0, 4)}${department.code}${String(studentIndex + 1).padStart(3, '0')}`,
          department: department.name,
          semester,
          phone: encryptField(faker.phone.number({ style: 'international' })),
          dob: faker.date.birthdate({ min: 18, max: 22, mode: 'age' }),
          address: encryptField(faker.location.streetAddress(true)),
          bio: encryptField(faker.person.bio()),
        },
        create: {
          userId: user.id,
          enrollmentNumber: `PEC${(batch || '2024').slice(0, 4)}${department.code}${String(studentIndex + 1).padStart(3, '0')}`,
          department: department.name,
          semester,
          phone: encryptField(faker.phone.number({ style: 'international' })),
          dob: faker.date.birthdate({ min: 18, max: 22, mode: 'age' }),
          address: encryptField(faker.location.streetAddress(true)),
          bio: encryptField(faker.person.bio()),
        },
      });

      students.push({
        id: user.id,
        name: fullName,
        departmentCode: department.code,
        departmentName: department.name,
        semester,
        batch,
      });
    }
  }

  return students;
}
