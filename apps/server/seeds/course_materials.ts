import { fakerEN_IN as faker } from '@faker-js/faker';
import { prisma, daysAgo } from './utils';
import { CourseSeed } from './data';

export async function seedCourseMaterials(courses: CourseSeed[]) {
  console.log(`Seeding course materials for ${courses.length} courses...`);

  // First fetch faculty to assign materials to
  const faculties = await prisma.user.findMany({
    where: { role: 'faculty' },
    select: { id: true, name: true }
  });

  if (faculties.length === 0) {
    console.warn('No faculty found to assign course materials.');
    return;
  }

  const materialsData: any[] = [];
  const materialTypes = ['pdf', 'video', 'document', 'link', 'other'];

  for (const course of courses) {
    // Randomly select a faculty for this course
    const assignedFaculty = faculties[Math.floor(Math.random() * faculties.length)];
    
    // Generate 3-5 materials per course
    const materialCount = faker.number.int({ min: 3, max: 5 });
    
    for (let i = 0; i < materialCount; i++) {
      const type = materialTypes[faker.number.int({ min: 0, max: materialTypes.length - 1 })];
      const title = type === 'pdf' 
        ? `Lecture ${i + 1}: ${faker.hacker.noun()} slides`
        : type === 'video'
        ? `Video Recording: ${faker.hacker.adjective()} Concepts`
        : type === 'document'
        ? `Assignment ${i + 1} Guidelines`
        : `Useful Resource Link`;

      materialsData.push({
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        title,
        description: faker.lorem.sentence(),
        fileURL: type === 'link' || type === 'video' ? faker.internet.url() : `https://storage.example.com/materials/${faker.string.alphanumeric(10)}.${type}`,
        type,
        uploadedBy: assignedFaculty.id,
        uploadedAt: daysAgo(faker.number.int({ min: 1, max: 60 })),
      });
    }
  }

  if (materialsData.length > 0) {
    const chunkSize = 5000;
    for (let i = 0; i < materialsData.length; i += chunkSize) {
      await prisma.courseMaterial.createMany({ data: materialsData.slice(i, i + chunkSize) });
    }
  }
}
