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

      for (let sessionIndex = 0; sessionIndex < 10; sessionIndex += 1) {
        attendanceData.push({
          date: daysAgo(sessionIndex + 1),
          status: sessionIndex % 7 === 0 ? 'late' : sessionIndex % 9 === 0 ? 'absent' : 'present',
          subject: course.code,
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


}
