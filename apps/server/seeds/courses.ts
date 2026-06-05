import { prisma } from './utils';
import { 
  DEPARTMENTS, 
  ACTIVE_SEMESTERS,
  FacultySeed,
  CourseSeed
} from './data';

export async function seedCourses(faculties: FacultySeed[]): Promise<CourseSeed[]> {
  const courses: CourseSeed[] = [];

  for (const department of DEPARTMENTS) {
    const facultyPool = faculties.filter(
      (faculty) => faculty.departmentCode === department.code,
    );

    if (facultyPool.length === 0) continue;

    for (const semester of ACTIVE_SEMESTERS) {
      const catalog = department.semesterCatalog[semester] || [];

      for (let courseIndex = 0; courseIndex < catalog.length; courseIndex += 1) {
        const faculty = facultyPool[courseIndex % facultyPool.length];
        const courseData = catalog[courseIndex];
        const created = await prisma.course.create({
          data: {
            code: courseData.code,
            name: courseData.name,
            credits: courseData.credits,
            instructor: faculty.name,
            facultyId: faculty.id,
            department: department.name,
            semester,
            status: 'active',
          },
        });

        courses.push({
          id: created.id,
          code: created.code,
          name: created.name,
          credits: created.credits,
          departmentCode: department.code,
          departmentName: department.name,
          semester,
          facultyId: faculty.id,
          facultyName: faculty.name,
        });
      }

      const baseCount = Math.max(catalog.length, 1);
      const targetCount = 8;
      const additionalNeeded = Math.max(0, targetCount - baseCount);

      for (let extra = 0; extra < additionalNeeded; extra++) {
        const faculty = facultyPool[extra % facultyPool.length];
        const baseData = catalog[extra % Math.max(catalog.length, 1)] || { code: 'ELEC', name: 'Elective', credits: 3 };
        const courseCode = `${baseData.code}-${extra + 1}`;
        const courseName = `${baseData.name} (Section ${extra + 1})`;
        const created = await prisma.course.create({
          data: {
            code: courseCode,
            name: courseName,
            credits: baseData.credits,
            instructor: faculty.name,
            facultyId: faculty.id,
            department: department.name,
            semester,
            status: 'active',
          },
        });

        courses.push({
          id: created.id,
          code: created.code,
          name: created.name,
          credits: created.credits,
          departmentCode: department.code,
          departmentName: department.name,
          semester,
          facultyId: faculty.id,
          facultyName: faculty.name,
        });
      }
    }
  }

  return courses;
}
