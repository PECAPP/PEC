import { prisma, hashString, rotate, batchForSemester } from './utils';
import { 
  DEPARTMENTS, 
  ACTIVE_SEMESTERS, 
  TIMETABLE_DAYS, 
  TIMETABLE_TIME_SLOTS, 
  TIMETABLE_ROOMS,
  CourseSeed
} from './data';

function sessionsForCredits(credits: number) {
  return credits >= 4 ? 4 : 3;
}

function buildDailyTargets(totalSessions: number, seed: string) {
  const orderedDays = rotate(TIMETABLE_DAYS, hashString(seed) % TIMETABLE_DAYS.length);
  const targets: Record<string, number> = Object.fromEntries(TIMETABLE_DAYS.map((day) => [day, 0]));
  const guaranteed = Math.min(totalSessions, TIMETABLE_DAYS.length * 3);
  let remainingGuaranteed = guaranteed;
  for (const day of orderedDays) {
    const allocation = Math.min(3, remainingGuaranteed);
    targets[day] = allocation;
    remainingGuaranteed -= allocation;
  }
  let remaining = totalSessions - guaranteed;
  let pointer = 0;
  while (remaining > 0) {
    const day = orderedDays[pointer % orderedDays.length];
    if (targets[day] < 5) {
      targets[day] += 1;
      remaining -= 1;
    }
    pointer += 1;
    if (pointer > 100) break;
  }
  return targets;
}

function createExpandedCourseSessions(courses: CourseSeed[], seed: string) {
  const orderedCourses = [...courses].sort((l, r) => sessionsForCredits(r.credits) - sessionsForCredits(l.credits) || l.code.localeCompare(r.code));
  const maxSessions = Math.max(...orderedCourses.map((c) => sessionsForCredits(c.credits)));
  const expanded: Array<{ course: CourseSeed; ordinal: number }> = [];
  for (let ordinal = 0; ordinal < maxSessions; ordinal += 1) {
    const courseOrder = rotate(orderedCourses, hashString(`${seed}:${ordinal}`) % Math.max(orderedCourses.length, 1));
    for (const course of courseOrder) {
      if (ordinal < sessionsForCredits(course.credits)) expanded.push({ course, ordinal });
    }
  }
  return expanded;
}

export async function seedTimetable(courses: CourseSeed[]) {
  const occupiedRooms = new Map<string, Set<string>>();
  const occupiedFaculty = new Set<string>();

  for (const department of DEPARTMENTS) {
    for (const semester of ACTIVE_SEMESTERS) {
      const semesterCourses = courses.filter((c) => c.departmentCode === department.code && c.semester === semester);
      const seed = `${department.code}-${semester}`;
      const dayTargets = buildDailyTargets(semesterCourses.reduce((sum, c) => sum + sessionsForCredits(c.credits), 0), seed);
      const dayCounts: Record<string, number> = Object.fromEntries(TIMETABLE_DAYS.map((day) => [day, 0]));
      const groupSlotUsage = new Set<string>();
      const courseDayUsage = new Map<string, Set<string>>();
      const pending = createExpandedCourseSessions(semesterCourses, seed);
      const orderedDays = rotate(TIMETABLE_DAYS, hashString(seed) % TIMETABLE_DAYS.length);

      const timetableData: any[] = [];
      const trySchedule = (session: { course: CourseSeed; ordinal: number }, allowRepeat: boolean) => {
        for (const day of orderedDays) {
          if (dayCounts[day] >= 5) continue;
          if (!allowRepeat && dayCounts[day] >= dayTargets[day]) continue;
          const courseDays = courseDayUsage.get(session.course.id) ?? new Set<string>();
          if (!allowRepeat && courseDays.has(day)) continue;
          const slots = rotate(TIMETABLE_TIME_SLOTS, hashString(`${seed}:${day}:${session.course.code}:${session.ordinal}`) % TIMETABLE_TIME_SLOTS.length);
          const rooms = rotate(TIMETABLE_ROOMS, hashString(`${seed}:${day}:${session.course.code}`) % TIMETABLE_ROOMS.length);
          for (const [start, end] of slots) {
            const slotKey = `${day}-${start}-${end}`;
            if (groupSlotUsage.has(slotKey)) continue;
            const facultyKey = `${session.course.facultyId}@@${slotKey}`;
            if (occupiedFaculty.has(facultyKey)) continue;
            const roomsBusy = occupiedRooms.get(slotKey) ?? new Set<string>();
            const room = rooms.find((r) => !roomsBusy.has(r));
            if (!room) continue;
            timetableData.push({
              courseId: session.course.id, courseName: session.course.name, courseCode: session.course.code,
              facultyId: session.course.facultyId, facultyName: session.course.facultyName,
              day, startTime: start, endTime: end, room, department: department.name,
              semester, batch: batchForSemester(semester),
            });
            roomsBusy.add(room);
            occupiedRooms.set(slotKey, roomsBusy);
            occupiedFaculty.add(facultyKey);
            groupSlotUsage.add(slotKey);
            courseDays.add(day);
            courseDayUsage.set(session.course.id, courseDays);
            dayCounts[day] += 1;
            return true;
          }
        }
        return false;
      };

      for (let i = 0; i < pending.length; ) {
        if (trySchedule(pending[i], false)) pending.splice(i, 1); else i++;
      }
      for (const session of pending) trySchedule(session, true);
      if (timetableData.length > 0) await prisma.timetable.createMany({ data: timetableData });
    }
  }
}
