import { fakerEN_IN as faker } from '@faker-js/faker';
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

    for (let facultyIndex = 0; facultyIndex < 6; facultyIndex += 1) {
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
        isPublicProfile: facultyIndex !== 5,
      });

      const designation =
        facultyIndex === 0 ? 'Professor & HOD'
        : facultyIndex === 1 ? 'Professor'
        : facultyIndex === 2 ? 'Associate Professor'
        : facultyIndex === 3 ? 'Associate Professor'
        : 'Assistant Professor';

      const facultyProfile = await prisma.facultyProfile.upsert({
        where: { userId: user.id },
        update: {
          employeeId: `FAC-${department.code}-${String(facultyIndex + 1).padStart(3, '0')}`,
          department: department.name,
          designation,
          phone: encryptField(faker.phone.number({ style: 'national' })),
          specialization: department.specializations[facultyIndex % department.specializations.length],
          qualifications: facultyIndex <= 1 ? 'PhD' : 'M.Tech, PhD',
          bio: encryptField(faker.person.bio()),
        },
        create: {
          userId: user.id,
          employeeId: `FAC-${department.code}-${String(facultyIndex + 1).padStart(3, '0')}`,
          department: department.name,
          designation,
          phone: encryptField(faker.phone.number({ style: 'national' })),
          specialization: department.specializations[facultyIndex % department.specializations.length],
          qualifications: facultyIndex <= 1 ? 'PhD' : 'M.Tech, PhD',
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
        await prisma.department.update({
          where: { code: department.code },
          data: { hod: fullName },
        });
      }

      // Seed Deep Faculty Portfolios - 7 publications, 4 awards, 5 conferences, 3 consultations per faculty
      const numPubs = faker.number.int({ min: 5, max: 10 });
      await prisma.facultyPublication.createMany({
        data: Array.from({ length: numPubs }).map(() => ({
          facultyId: facultyProfile.id,
          title: `${faker.hacker.adjective()} ${faker.hacker.noun()} for ${faker.science.chemicalElement().name} in ${department.name}`,
          journal: faker.helpers.arrayElement([
            `International Journal of ${department.name}`,
            `IEEE Transactions on ${department.specializations[0]}`,
            `ACM Computing in ${department.code}`,
            `Journal of Advanced ${department.name} Research`,
            `Springer: ${department.specializations[1]}`,
          ]),
          conference: Math.random() > 0.4 ? `IEEE/ACM Conference on ${department.code} ${faker.number.int({ min: 2018, max: 2024 })}` : null,
          year: faker.number.int({ min: 2015, max: 2025 }),
          doi: `10.1109/${faker.string.alphanumeric(8).toUpperCase()}`,
          url: faker.internet.url(),
          abstract: faker.lorem.paragraph(3),
          citations: faker.number.int({ min: 0, max: 800 }),
          coAuthors: `${faker.person.firstName()} ${faker.person.lastName()}, ${faker.person.firstName()} ${faker.person.lastName()}, ${faker.person.firstName()} ${faker.person.lastName()}`,
        })),
      });

      const numAwards = faker.number.int({ min: 2, max: 5 });
      await prisma.facultyAward.createMany({
        data: Array.from({ length: numAwards }).map(() => ({
          facultyId: facultyProfile.id,
          title: faker.helpers.arrayElement([
            'Best Researcher Award',
            'Excellence in Teaching Award',
            'Outstanding Faculty Award',
            'Young Scientist Award',
            'Best Paper Award',
            'Distinguished Alumnus Award',
            'Innovation in Education Award',
          ]),
          description: faker.lorem.sentence(),
          awardedBy: faker.helpers.arrayElement([
            'Institution of Engineers India',
            'AICTE',
            'IEEE India',
            'ACM India',
            `PEC University of Technology`,
            'National Science Academy',
            'DST Government of India',
          ]),
          year: faker.number.int({ min: 2015, max: 2025 }),
          category: faker.helpers.arrayElement(['academic', 'research', 'industry', 'service']),
        })),
      });

      const numConf = faker.number.int({ min: 3, max: 6 });
      await prisma.facultyConference.createMany({
        data: Array.from({ length: numConf }).map(() => ({
          facultyId: facultyProfile.id,
          name: faker.helpers.arrayElement([
            `National Symposium on ${department.specializations[0]}`,
            `International Conference on ${department.specializations[1]}`,
            `IEEE Conference on ${department.code} Technologies`,
            `AICTE Workshop on ${department.name}`,
            `Indo-German Symposium on ${department.specializations[2]}`,
          ]),
          location: `${faker.location.city()}, ${faker.helpers.arrayElement(['India', 'USA', 'Germany', 'Japan', 'UK'])}`,
          startDate: faker.date.past({ years: 5 }),
          endDate: faker.date.recent({ days: 365 }),
          role: faker.helpers.arrayElement(['keynote', 'presenter', 'session_chair', 'panelist']),
          presentationTitle: `${faker.hacker.verb()} ${faker.hacker.adjective()} ${faker.hacker.noun()} in ${department.code}`,
          description: faker.lorem.sentence(),
        })),
      });

      const numCons = faker.number.int({ min: 1, max: 4 });
      await prisma.facultyConsultation.createMany({
        data: Array.from({ length: numCons }).map(() => ({
          facultyId: facultyProfile.id,
          organization: `${faker.company.name()} ${faker.helpers.arrayElement(['Pvt Ltd', 'Ltd', 'Corp', 'Industries', 'Solutions'])}`,
          description: `Consultancy for ${faker.company.buzzVerb()} ${faker.company.buzzNoun()} systems in ${department.specializations[0]}.`,
          startDate: faker.date.past({ years: 3 }),
          endDate: faker.date.future({ years: 2 }),
          status: faker.helpers.arrayElement(['active', 'active', 'completed', 'completed', 'ongoing']),
        })),
      });
    }
  }

  return faculties;
}
