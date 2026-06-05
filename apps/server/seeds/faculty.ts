import { faker } from '@faker-js/faker';
import { prisma, encryptField } from './utils';
import { 
  DEPARTMENTS, 
  FacultySeed
} from './data';
import { createUserWithRole } from './users';

export async function seedFaculty(passwordHash: string): Promise<FacultySeed[]> {
  const faculties: FacultySeed[] = [];
  console.log(`Seeding faculty for ${DEPARTMENTS.length} departments...`);

  for (let deptIndex = 0; deptIndex < DEPARTMENTS.length; deptIndex += 1) {
    const department = DEPARTMENTS[deptIndex];

    for (let facultyIndex = 0; facultyIndex < 3; facultyIndex += 1) {
      const isSpecUser = department.code === 'DS' && facultyIndex === 0;
      const prefix = isSpecUser ? 'Dr.' : faker.person.prefix();
      const firstName = isSpecUser ? 'Amit' : faker.person.firstName();
      const lastName = isSpecUser ? 'Kumar' : faker.person.lastName();
      const fullName = `${prefix} ${firstName} ${lastName}`;
      
      const email = isSpecUser 
        ? 'faculty@pec.edu' 
        : faker.internet.email({ firstName, lastName, provider: 'pec.edu' }).toLowerCase();

      const user = await createUserWithRole({
        email,
        name: fullName,
        role: 'faculty',
        passwordHash,
        githubUsername: faker.internet.username({ firstName, lastName }),
        linkedinUsername: `${firstName.toLowerCase()}-${faker.string.alphanumeric(4)}`,
        isPublicProfile: facultyIndex !== 2,
      });

      await prisma.facultyProfile.upsert({
        where: { userId: user.id },
        update: {
          employeeId: `FAC-${department.code}-${String(facultyIndex + 1).padStart(3, '0')}`,
          department: department.name,
          designation:
            facultyIndex === 0
              ? 'Professor & HOD'
              : facultyIndex === 1
                ? 'Associate Professor'
                : 'Assistant Professor',
          phone: encryptField(faker.phone.number({ style: 'international' })),
          specialization: department.specializations[facultyIndex % department.specializations.length],
          qualifications: facultyIndex === 0 ? 'PhD' : 'M.Tech, PhD',
          bio: encryptField(faker.person.bio()),
        },
        create: {
          userId: user.id,
          employeeId: `FAC-${department.code}-${String(facultyIndex + 1).padStart(3, '0')}`,
          department: department.name,
          designation:
            facultyIndex === 0
              ? 'Professor & HOD'
              : facultyIndex === 1
                ? 'Associate Professor'
                : 'Assistant Professor',
          phone: encryptField(faker.phone.number({ style: 'international' })),
          specialization: department.specializations[facultyIndex % department.specializations.length],
          qualifications: facultyIndex === 0 ? 'PhD' : 'M.Tech, PhD',
          bio: encryptField(faker.person.bio()),
        },
      });

      faculties.push({
        id: user.id,
        name: fullName,
        departmentCode: department.code,
        departmentName: department.name,
      });

      if (facultyIndex === 0) {
        await (prisma as any).department.update({
          where: { code: department.code },
          data: { hod: fullName },
        });
      }
    }
  }

  return faculties;
}
