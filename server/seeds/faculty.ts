import { prisma, sample, encryptField } from './utils';
import { 
  DEPARTMENTS, 
  FACULTY_PREFIXES, 
  FACULTY_FIRST_NAMES, 
  FACULTY_LAST_NAMES, 
  SOCIAL_SUFFIXES,
  FacultySeed
} from './data';
import { createUserWithRole } from './users';

export async function seedFaculty(passwordHash: string): Promise<FacultySeed[]> {
  const faculties: FacultySeed[] = [];

  for (let deptIndex = 0; deptIndex < DEPARTMENTS.length; deptIndex += 1) {
    const department = DEPARTMENTS[deptIndex];

    for (let facultyIndex = 0; facultyIndex < 3; facultyIndex += 1) {
      const fullName = `${FACULTY_PREFIXES[facultyIndex]} ${sample(FACULTY_FIRST_NAMES, deptIndex + facultyIndex)} ${sample(FACULTY_LAST_NAMES, facultyIndex + deptIndex * 2)}`;
      const email =
        department.code === 'DS' && facultyIndex === 0
          ? 'faculty@pec.edu'
          : `${department.code.toLowerCase()}.faculty${facultyIndex + 1}@pec.edu`;

      const user = await createUserWithRole({
        email,
        name: fullName,
        role: 'faculty',
        passwordHash,
        githubUsername:
          facultyIndex % 2 === 0
            ? `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${sample(SOCIAL_SUFFIXES, facultyIndex + deptIndex)}`
            : null,
        linkedinUsername: `${department.code.toLowerCase()}-${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        isPublicProfile: facultyIndex !== 2,
      });

      await prisma.facultyProfile.create({
        data: {
          userId: user.id,
          employeeId: `FAC-${department.code}-${String(facultyIndex + 1).padStart(3, '0')}`,
          department: department.name,
          designation:
            facultyIndex === 0
              ? 'Professor & HOD'
              : facultyIndex === 1
                ? 'Associate Professor'
                : 'Assistant Professor',
          phone: encryptField(
            `+91-98${String(deptIndex + 11).padStart(2, '0')}${String(facultyIndex + 1).padStart(6, '0')}`,
          ),
          specialization: department.specializations[facultyIndex],
          qualifications: facultyIndex === 0 ? 'PhD' : 'M.Tech, PhD',
          bio: encryptField(
            `${department.timetableLabel} coordinator focused on ${department.specializations[facultyIndex]}.`,
          ),
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
