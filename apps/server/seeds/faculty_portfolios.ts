import { fakerEN_IN as faker } from '@faker-js/faker';
import { prisma } from './utils';

export async function seedFacultyPortfolios() {
  console.log('Seeding Faculty Portfolios...');

  const faculties = await prisma.facultyProfile.findMany({
    include: { user: true },
  });

  if (faculties.length === 0) {
    console.log('No faculty profiles found to seed portfolios.');
    return;
  }

  const publicationsData: any[] = [];
  const awardsData: any[] = [];
  const conferencesData: any[] = [];
  const consultationsData: any[] = [];

  const journals = ['IEEE Transactions', 'ACM Computing Surveys', 'Nature', 'Science', 'Journal of Machine Learning Research'];
  const awardOrgs = ['IEEE', 'ACM', 'National Science Foundation', 'PEC University', 'AICTE'];
  const conferences = ['NeurIPS', 'CVPR', 'ICML', 'ICRA', 'SIGGRAPH'];
  const companies = ['Google', 'Microsoft', 'TCS', 'Infosys', 'DRDO', 'ISRO'];

  for (const faculty of faculties) {
    // Generate 2-5 publications
    const numPubs = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < numPubs; i++) {
      publicationsData.push({
        facultyId: faculty.id,
        title: `${faker.hacker.adjective()} ${faker.hacker.noun()} for ${faker.science.chemicalElement().name}`,
        journal: faker.helpers.arrayElement(journals),
        year: faker.number.int({ min: 2010, max: 2026 }),
        coAuthors: `${faculty.user.name}, ${faker.person.fullName()}`,
        url: faker.internet.url(),
        abstract: faker.lorem.paragraph(),
        citations: faker.number.int({ min: 0, max: 500 }),
      });
    }

    // Generate 0-2 awards
    const numAwards = faker.number.int({ min: 0, max: 2 });
    for (let i = 0; i < numAwards; i++) {
      awardsData.push({
        facultyId: faculty.id,
        title: faker.helpers.arrayElement(['Best Paper Award', 'Excellence in Teaching', 'Outstanding Researcher', 'Young Scientist Award']),
        awardedBy: faker.helpers.arrayElement(awardOrgs),
        year: faker.number.int({ min: 2015, max: 2026 }),
        description: faker.lorem.sentence(),
        category: 'academic',
      });
    }

    // Generate 1-3 conferences
    const numConf = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numConf; i++) {
      conferencesData.push({
        facultyId: faculty.id,
        name: faker.helpers.arrayElement(conferences),
        presentationTitle: `${faker.hacker.verb()} ${faker.hacker.noun()}`,
        location: `${faker.location.city()}, ${faker.location.country()}`,
        startDate: faker.date.past({ years: 5 }),
        role: 'presenter',
      });
    }

    // Generate 0-2 consultations
    const numCons = faker.number.int({ min: 0, max: 2 });
    for (let i = 0; i < numCons; i++) {
      consultationsData.push({
        facultyId: faculty.id,
        organization: faker.helpers.arrayElement(companies),
        description: `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} Optimization`,
        startDate: faker.date.past({ years: 3 }),
        status: 'active',
      });
    }
  }

  console.log(`Inserting ${publicationsData.length} publications...`);
  await prisma.facultyPublication.createMany({ data: publicationsData });
  
  console.log(`Inserting ${awardsData.length} awards...`);
  await prisma.facultyAward.createMany({ data: awardsData });
  
  console.log(`Inserting ${conferencesData.length} conferences...`);
  await prisma.facultyConference.createMany({ data: conferencesData });
  
  console.log(`Inserting ${consultationsData.length} consultations...`);
  await prisma.facultyConsultation.createMany({ data: consultationsData });

  console.log('Faculty Portfolios seeded successfully.');
}
