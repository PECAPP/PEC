import { fakerEN_IN as faker } from '@faker-js/faker';
import { prisma, daysAgo, daysFromNow } from './utils';
import { StudentSeed, CourseSeed } from './data';

// Grade point from percentage
function percentageToGradePoint(pct: number): number {
  if (pct >= 90) return 10;
  if (pct >= 80) return 9;
  if (pct >= 70) return 8;
  if (pct >= 60) return 7;
  if (pct >= 50) return 6;
  if (pct >= 40) return 5;
  return 4; // Backlog / Reappear
}

function percentageToGrade(pct: number): string {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 40) return 'C';
  return 'F';
}

// Full course catalog per department per semester (from data.ts semesterCatalog)
// We rebuild it on the fly from the DEPARTMENTS constant by re-loading courses
export async function seedAcademicRecords(
  students: StudentSeed[],
  courses: CourseSeed[],
) {
  const existingStudents = await prisma.user.findMany({
    where: { id: { in: students.map((s) => s.id) } },
    select: { id: true },
  });
  const validStudentIds = new Set(existingStudents.map((s) => s.id));

  // --- Attendance Sessions: 20 sessions per course (enough history) ---
  console.log(`Seeding attendance sessions for ${courses.length} courses...`);
  const courseSessions: Record<string, { id: string; date: Date }[]> = {};
  const courseExamScheduleIds: Record<string, { midId?: string; finalId?: string }> = {};

  for (const course of courses) {
    const sessions: { id: string; date: Date }[] = [];
    for (let sessionIdx = 0; sessionIdx < 20; sessionIdx++) {
      const sessionDate = daysAgo(sessionIdx * 2 + 1);
      const session = await prisma.attendanceSession.create({
        data: {
          facultyId: course.facultyId,
          courseId: course.id,
          courseName: course.name,
          date: sessionDate.toISOString().split('T')[0],
          startTime: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'][sessionIdx % 6],
          qrCode: faker.string.uuid(),
          active: false,
          expiresAt: new Date(sessionDate.getTime() + 60 * 60 * 1000).toISOString(),
          createdAt: sessionDate,
        },
      });
      sessions.push({ id: session.id, date: sessionDate });
    }
    courseSessions[course.id] = sessions;

    // Midterm and Final exam schedules
    const midterm = await prisma.examSchedule.create({
      data: {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        examType: 'Midterm',
        date: daysAgo(30 + (course.semester % 4) * 5),
        startTime: '10:00',
        endTime: '12:00',
        room: `${course.departmentCode}-EX-${(course.semester % 8) + 1}`,
      },
    });
    const final = await prisma.examSchedule.create({
      data: {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        examType: 'Final',
        date: daysAgo(5 + (course.semester % 5) * 2),
        startTime: '14:00',
        endTime: '17:00',
        room: `${course.departmentCode}-FN-${(course.semester % 8) + 2}`,
      },
    });
    courseExamScheduleIds[course.id] = { midId: midterm.id, finalId: final.id };
  }

  // --- Build a lookup: dept+semester -> courses ---
  const courseMap: Record<string, CourseSeed[]> = {};
  for (const c of courses) {
    const key = `${c.departmentCode}:${c.semester}`;
    if (!courseMap[key]) courseMap[key] = [];
    courseMap[key].push(c);
  }

  // --- Historical course catalog for past semesters (from DEPARTMENTS data) ---
  // We use the existing courses for current semester and build simple placeholders for past
  const { DEPARTMENTS } = await import('./data');
  const deptSemesterCourses: Record<string, { name: string; code: string; credits: number }[]> = {};
  for (const dept of DEPARTMENTS) {
    for (const [semStr, deptCourses] of Object.entries(dept.semesterCatalog)) {
      deptSemesterCourses[`${dept.code}:${semStr}`] = deptCourses as any;
    }
  }

  console.log(`Seeding academic records for ${students.length} students...`);

  const attendanceData: any[] = [];
  const scoreData: any[] = [];
  const cgpaData: any[] = [];
  const enrollmentData: any[] = [];

  let processed = 0;

  for (const student of students) {
    if (!validStudentIds.has(student.id)) {
      console.warn(`Skipping missing student: ${student.id}`);
      continue;
    }

    const currentSemester = student.semester;
    const dept = student.departmentCode;

    // --- CURRENT SEMESTER: Real enrollments in seeded courses ---
    const currentCourses = courseMap[`${dept}:${currentSemester}`] ?? [];
    for (const course of currentCourses) {
      enrollmentData.push({
        studentId: student.id,
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        semester: currentSemester,
        batch: student.batch,
        status: 'active',
        enrolledAt: daysAgo(60),
      });

      // Attendance for current semester — realistic mix
      const sessions = courseSessions[course.id] ?? [];
      const attendancePattern = Math.random(); // 0-1: higher = better student
      for (let i = 0; i < sessions.length; i++) {
        const rand = Math.random();
        let status = 'present';
        if (attendancePattern < 0.15) {
          // Struggling student: 60-74% attendance
          status = rand < 0.35 ? 'absent' : rand < 0.45 ? 'late' : 'present';
        } else if (attendancePattern < 0.4) {
          // Average student: 75-85%
          status = rand < 0.18 ? 'absent' : rand < 0.25 ? 'late' : 'present';
        } else {
          // Good student: 85-100%
          status = rand < 0.08 ? 'absent' : rand < 0.12 ? 'late' : 'present';
        }
        attendanceData.push({
          date: sessions[i].date,
          status,
          subject: course.id,
          studentId: student.id,
          sessionId: sessions[i].id,
        });
      }

      // Current semester midterm + final scores
      const examIds = courseExamScheduleIds[course.id];
      const academicLevel = 40 + Math.random() * 55; // base score 40-95
      const midtermScore = Math.round(faker.number.float({ min: Math.max(30, academicLevel - 15), max: Math.min(100, academicLevel + 10) }));
      const finalScore = Math.round(faker.number.float({ min: Math.max(30, academicLevel - 10), max: Math.min(100, academicLevel + 15) }));

      if (examIds?.midId) {
        scoreData.push({
          studentId: student.id,
          courseName: course.name,
          courseCode: course.code,
          term: 'Midterm',
          maxMarks: 100,
          score: midtermScore,
          grade: percentageToGrade(midtermScore),
          examDate: daysAgo(30),
        });
      }
      if (examIds?.finalId) {
        scoreData.push({
          studentId: student.id,
          courseName: course.name,
          courseCode: course.code,
          term: 'Final',
          maxMarks: 100,
          score: finalScore,
          grade: percentageToGrade(finalScore),
          examDate: daysAgo(5),
        });
      }
    }

    // --- PAST SEMESTERS: CGPA history (semesters 1 → currentSemester-2, step 2) ---
    const activeSems = [1, 3, 5, 7];
    for (const pastSem of activeSems) {
      if (pastSem >= currentSemester) break; // Only seed truly past semesters

      // Get the real course catalog for this dept+semester
      const pastCourses = deptSemesterCourses[`${dept}:${pastSem}`] ?? [];
      // Fallback generic courses if nothing in catalog
      const effectiveCourses = pastCourses.length > 0
        ? pastCourses
        : Array.from({ length: 5 }, (_, i) => ({
            name: `${dept} Subject ${pastSem}0${i + 1}`,
            code: `${dept}${pastSem}0${i + 1}`,
            credits: i === 4 ? 2 : 3,
          }));

      // Student performance profile (consistent across semesters)
      const perfBase = 45 + (parseInt(student.id.slice(0, 4), 16) % 50); // 45-95 based on id

      for (const pastCourse of effectiveCourses) {
        const isHonors = (pastCourse as any).credits === 4;
        const isElective = pastSem >= 5 && Math.random() > 0.6;
        // Some variance semester to semester, but consistent with base performance
        const variance = (Math.random() - 0.5) * 20;
        const pct = Math.min(100, Math.max(35, perfBase + variance));
        const gradePoint = percentageToGradePoint(pct);

        // Historical exam dates: ~6 months per 2 semesters
        const semDaysBack = (currentSemester - pastSem) * 90 + 30;

        cgpaData.push({
          userId: student.id,
          subjectName: pastCourse.name,
          courseCode: pastCourse.code,
          semester: pastSem,
          credits: isHonors ? 4 : isElective ? 2 : 3,
          gradePoint,
          courseType: isHonors ? 'honors' : isElective ? 'elective' : 'core',
          examDate: daysAgo(semDaysBack + faker.number.int({ min: 0, max: 20 })),
        });

        // Also add a ScoreEntry for past semester historical record
        const histScore = Math.round(pct);
        scoreData.push({
          studentId: student.id,
          courseName: pastCourse.name,
          courseCode: pastCourse.code,
          term: 'Final',
          maxMarks: 100,
          score: histScore,
          grade: percentageToGrade(histScore),
          examDate: daysAgo(semDaysBack),
        });
      }
    }

    processed++;
    if (processed % 50 === 0) {
      console.log(`  Processed ${processed}/${students.length} students...`);
    }
  }

  // Batch insert enrollments
  console.log(`  Inserting ${enrollmentData.length} enrollment records...`);
  const enrollChunkSize = 1000;
  for (let i = 0; i < enrollmentData.length; i += enrollChunkSize) {
    await prisma.enrollment.createMany({ data: enrollmentData.slice(i, i + enrollChunkSize), skipDuplicates: true });
  }

  // Batch insert attendance
  console.log(`  Inserting ${attendanceData.length} attendance records...`);
  const chunkSize = 5000;
  for (let i = 0; i < attendanceData.length; i += chunkSize) {
    await prisma.attendance.createMany({ data: attendanceData.slice(i, i + chunkSize) });
  }

  // Batch insert scores
  console.log(`  Inserting ${scoreData.length} score entries...`);
  for (let i = 0; i < scoreData.length; i += chunkSize) {
    await prisma.scoreEntry.createMany({ data: scoreData.slice(i, i + chunkSize), skipDuplicates: true });
  }

  // Batch insert CGPA entries
  console.log(`  Inserting ${cgpaData.length} CGPA/grade history entries...`);
  for (let i = 0; i < cgpaData.length; i += chunkSize) {
    await prisma.cgpaEntry.createMany({ data: cgpaData.slice(i, i + chunkSize) });
  }

  console.log(`Academic records seeded: ${enrollmentData.length} enrollments, ${attendanceData.length} attendance, ${scoreData.length} scores, ${cgpaData.length} grade history`);
}
