import { prisma, daysAgo, daysFromNow } from './utils';
import { 
  StudentSeed,
  CourseSeed
} from './data';

export async function seedAcademicRecords(
  students: StudentSeed[],
  courses: CourseSeed[],
) {
  const attendanceData: any[] = [];
  for (const student of students) {
    const semesterCourses = courses.filter(
      (course) =>
        course.departmentCode === student.departmentCode &&
        course.semester === student.semester,
    );

    for (const course of semesterCourses) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          semester: student.semester,
          batch: student.batch,
          status: 'active',
          enrolledAt: daysAgo(45),
        },
      });

      for (let sessionIndex = 0; sessionIndex < 15; sessionIndex += 1) {
        attendanceData.push({
          date: daysAgo(sessionIndex * 2 + 1), 
          status: sessionIndex % 8 === 0 ? 'absent' : sessionIndex % 12 === 0 ? 'late' : 'present',
          subject: course.id,
          studentId: student.id,
        });
      }
    }
  }

  if (attendanceData.length > 0) {
    await prisma.attendance.createMany({ data: attendanceData });
  }



  for (const course of courses) {
    await prisma.examSchedule.createMany({
      data: [
        {
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          examType: 'Midterm',
          date: daysFromNow(10 + (course.semester % 4) * 3),
          startTime: '10:00',
          endTime: '12:00',
          room: `${course.departmentCode}-EX-${(course.semester % 8) + 1}`,
        },
        {
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          examType: 'Final',
          date: daysFromNow(25 + (course.semester % 5) * 2),
          startTime: '14:00',
          endTime: '17:00',
          room: `${course.departmentCode}-FN-${(course.semester % 8) + 2}`,
        },
      ],
    });
  }

  // --- Seeding Grade / CGPA History ---
  console.log(`Seeding grade records for ${students.length} students...`);
  const cgpaData: any[] = [];
  const subjects = ['Mathematics', 'Physics', 'Programming', 'Ethics', 'Mechanics', 'Digital Logic', 'Database', 'Operating Systems', 'Networking', 'AI'];

  for (const student of students) {
    // Seed grades for previous semesters
    const currentSemester = student.semester || 1;
    for (let sem = 1; sem < currentSemester; sem++) {
      for (let subIdx = 0; subIdx < 5; subIdx++) {
        const isHonors = Math.random() > 0.8;
        const isElective = Math.random() > 0.6;
        const gradePoint = Math.random() > 0.05 ? (6 + Math.random() * 4) : 3.0; // 5% chance of backlog

        cgpaData.push({
          userId: student.id,
          subjectName: subjects[subIdx % subjects.length] + ' ' + (subIdx + 1),
          courseCode: `${student.departmentCode}-${sem}0${subIdx + 1}`,
          semester: sem,
          credits: isHonors ? 4 : 3,
          gradePoint: Number(gradePoint.toFixed(1)),
          courseType: isHonors ? 'honors' : isElective ? 'elective' : 'core',
          examDate: daysAgo(180 * (currentSemester - sem) + 30),
        });
      }
    }
  }

  if (cgpaData.length > 0) {
    await prisma.cgpaEntry.createMany({ data: cgpaData });
  }
}
