import { prisma, sample, encryptField, batchForSemester } from './utils';
import { 
  DEPARTMENTS, 
  STUDENT_FIRST_NAMES, 
  STUDENT_LAST_NAMES, 
  SEMESTER_DISTRIBUTION,
  StudentSeed
} from './data';
import { createUserWithRole } from './users';

export async function seedStudents(passwordHash: string): Promise<StudentSeed[]> {
  const students: StudentSeed[] = [];

  for (let deptIndex = 0; deptIndex < DEPARTMENTS.length; deptIndex += 1) {
    const department = DEPARTMENTS[deptIndex];

    for (let studentIndex = 0; studentIndex < 10; studentIndex += 1) {
      const semester = SEMESTER_DISTRIBUTION[studentIndex];
      const fullName =
        department.code === 'CSE' && studentIndex === 0
          ? 'Arjun Patel'
          : `${sample(STUDENT_FIRST_NAMES, deptIndex + studentIndex)} ${sample(STUDENT_LAST_NAMES, studentIndex + deptIndex)}`;
      const email =
        department.code === 'CSE' && studentIndex === 0
          ? 'student@pec.edu'
          : `${department.code.toLowerCase()}.student${studentIndex + 1}@pec.edu`;
      const batch = batchForSemester(semester);
      
      const user = await createUserWithRole({
        email,
        name: fullName,
        role: 'student',
        passwordHash,
        githubUsername:
          studentIndex % 3 === 0
            ? `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}${100 + studentIndex}`
            : null,
        linkedinUsername:
          studentIndex % 2 === 0
            ? `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}-${department.code.toLowerCase()}`
            : null,
        isPublicProfile: studentIndex % 4 !== 0,
      });

      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          enrollmentNumber: `PEC${(batch || '2024').slice(0, 4)}${department.code}${String(studentIndex + 1).padStart(3, '0')}`,
          department: department.name,
          semester,
          phone: encryptField(
            `+91-97${String(deptIndex + 10).padStart(2, '0')}${String(studentIndex + 1).padStart(6, '0')}`,
          ),
          dob: new Date(2004, (studentIndex + deptIndex) % 12, 10 + (studentIndex % 18)),
          address: encryptField(`Hostel Block ${((deptIndex + studentIndex) % 8) + 1}, PEC Campus`),
          bio: encryptField(
            `${department.name} student in semester ${semester} preparing for academics, placements, and campus activities.`,
          ),
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
