export interface TimeSlot {
  day: string;
  time: string;
  displayTime: string;
}

export interface CourseSchedule {
  courseId: string;
  courseName: string;
  courseCode: string;
  facultyId: string;
  facultyName: string;
  department: string;
  semester: number;
  credits: number;
}

export interface TimetableEntry {
  day: string;
  timeSlot: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  facultyId: string;
  facultyName: string;
  room: string;
  department: string;
  semester: number;
  batch?: string;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const SLOT_TIMES = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "14:00-15:00",
  "15:00-16:00",
] as const;

export const TIME_SLOTS: TimeSlot[] = WEEKDAYS.flatMap((day) =>
  SLOT_TIMES.map((time) => ({
    day,
    time,
    displayTime: time,
  })),
);

export const ROOMS = Array.from({ length: 37 }, (_, index) => `L-${index + 1}`);

type GroupKey = `${string}__${number}`;
type ExpandedSession = {
  course: CourseSchedule;
  ordinal: number;
};

const getGroupKey = (department: string, semester: number): GroupKey =>
  `${department}__${semester}`;

const getBatchForSemester = (semester: number) => {
  switch (semester) {
    case 1:
      return "2026-2030";
    case 3:
      return "2025-2029";
    case 5:
      return "2024-2028";
    case 7:
      return "2023-2027";
    default:
      return `Semester-${semester}`;
  }
};

const getSessionCount = (credits: number) => (credits >= 4 ? 4 : 3);

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const rotate = <T,>(items: readonly T[], offset: number): T[] => {
  if (items.length === 0) return [];
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
};

const buildDailyTargets = (totalSessions: number, seed: string) => {
  const weekdayOrder = rotate(WEEKDAYS, hashString(seed) % WEEKDAYS.length);
  const targets: Record<string, number> = Object.fromEntries(
    WEEKDAYS.map((day) => [day, 0]),
  );

  const guaranteed = Math.min(totalSessions, WEEKDAYS.length * 3);
  let remainingGuaranteed = guaranteed;

  for (const day of weekdayOrder) {
    const allocation = Math.min(3, remainingGuaranteed);
    targets[day] = allocation;
    remainingGuaranteed -= allocation;
  }

  let remaining = totalSessions - guaranteed;
  let pointer = 0;
  while (remaining > 0) {
    const day = weekdayOrder[pointer % weekdayOrder.length];
    if (targets[day] < 5) {
      targets[day] += 1;
      remaining -= 1;
    }
    pointer += 1;
  }

  return targets;
};

const getOrderedSlotsForDay = (day: string, seed: string) =>
  rotate(SLOT_TIMES, hashString(`${seed}:${day}`) % SLOT_TIMES.length);

const getOrderedRooms = (seed: string) =>
  rotate(ROOMS, hashString(seed) % ROOMS.length);

const createExpandedSessions = (courses: CourseSchedule[], seed: string) => {
  const orderedCourses = [...courses].sort((left, right) => {
    const sessionDelta = getSessionCount(right.credits) - getSessionCount(left.credits);
    if (sessionDelta !== 0) return sessionDelta;
    return left.courseCode.localeCompare(right.courseCode);
  });

  const maxSessions = Math.max(...orderedCourses.map((course) => getSessionCount(course.credits)));
  const expanded: ExpandedSession[] = [];

  for (let ordinal = 0; ordinal < maxSessions; ordinal += 1) {
    const courseOrder = rotate(
      orderedCourses,
      hashString(`${seed}:${ordinal}`) % Math.max(orderedCourses.length, 1),
    );

    for (const course of courseOrder) {
      if (ordinal < getSessionCount(course.credits)) {
        expanded.push({ course, ordinal });
      }
    }
  }

  return expanded;
};

const scheduleIntoDay = (
  session: ExpandedSession,
  day: string,
  seed: string,
  roomOccupancy: Map<string, Set<string>>,
  facultyOccupancy: Set<string>,
  departmentSlotUsage: Set<string>,
  courseDayUsage: Map<string, Set<string>>,
  entries: TimetableEntry[],
  allowRepeatCourseDay: boolean,
) => {
  const slots = getOrderedSlotsForDay(day, `${seed}:${session.course.courseCode}:${session.ordinal}`);
  const rooms = getOrderedRooms(`${seed}:${day}:${session.course.courseCode}`);
  const existingCourseDays = courseDayUsage.get(session.course.courseId) ?? new Set<string>();

  for (const timeSlot of slots) {
    const slotKey = `${day}-${timeSlot}`;
    if (departmentSlotUsage.has(slotKey)) continue;
    if (!allowRepeatCourseDay && existingCourseDays.has(day)) continue;

    const facultyKey =
      session.course.facultyId && session.course.facultyId !== "TBA"
        ? `${session.course.facultyId}@@${slotKey}`
        : null;

    if (facultyKey && facultyOccupancy.has(facultyKey)) continue;

    const occupiedRooms = roomOccupancy.get(slotKey) ?? new Set<string>();
    const room = rooms.find((candidate) => !occupiedRooms.has(candidate));
    if (!room) continue;

    occupiedRooms.add(room);
    roomOccupancy.set(slotKey, occupiedRooms);
    if (facultyKey) facultyOccupancy.add(facultyKey);
    departmentSlotUsage.add(slotKey);

    const updatedDays = new Set(existingCourseDays);
    updatedDays.add(day);
    courseDayUsage.set(session.course.courseId, updatedDays);

    entries.push({
      day,
      timeSlot,
      courseId: session.course.courseId,
      courseName: session.course.courseName,
      courseCode: session.course.courseCode,
      facultyId: session.course.facultyId,
      facultyName: session.course.facultyName,
      room,
      department: session.course.department,
      semester: session.course.semester,
      batch: getBatchForSemester(session.course.semester),
    });

    return true;
  }

  return false;
};

export function generateTimetable(
  courses: CourseSchedule[],
  department: string,
  semester: number,
  existingEntries: TimetableEntry[] = [],
): { entries: TimetableEntry[]; conflicts: string[] } {
  const groupCourses = courses.filter(
    (course) => course.department === department && course.semester === semester,
  );

  if (groupCourses.length === 0) {
    return {
      entries: [],
      conflicts: [`No courses found for ${department} semester ${semester}`],
    };
  }

  const seed = getGroupKey(department, semester);
  const totalSessions = groupCourses.reduce(
    (sum, course) => sum + getSessionCount(course.credits),
    0,
  );
  const dailyTargets = buildDailyTargets(totalSessions, seed);
  const entries: TimetableEntry[] = [];
  const conflicts: string[] = [];
  const pending = createExpandedSessions(groupCourses, seed);
  const roomOccupancy = new Map<string, Set<string>>();
  const facultyOccupancy = new Set<string>();
  const departmentSlotUsage = new Set<string>();
  const courseDayUsage = new Map<string, Set<string>>();
  const dayCounts: Record<string, number> = Object.fromEntries(
    WEEKDAYS.map((day) => [day, 0]),
  );

  for (const entry of existingEntries) {
    const slotKey = `${entry.day}-${entry.timeSlot}`;
    const rooms = roomOccupancy.get(slotKey) ?? new Set<string>();
    rooms.add(entry.room);
    roomOccupancy.set(slotKey, rooms);
    if (entry.facultyId) {
      facultyOccupancy.add(`${entry.facultyId}@@${slotKey}`);
    }
  }

  const weekdayOrder = rotate(WEEKDAYS, hashString(seed) % WEEKDAYS.length);

  let madeProgress = true;
  while (pending.length > 0 && madeProgress) {
    madeProgress = false;

    for (const day of weekdayOrder) {
      if (dayCounts[day] >= dailyTargets[day]) continue;

      const candidateIndex = pending.findIndex((session) => {
        const days = courseDayUsage.get(session.course.courseId);
        return !days?.has(day);
      });

      if (candidateIndex === -1) continue;

      const [session] = pending.splice(candidateIndex, 1);
      const scheduled = scheduleIntoDay(
        session,
        day,
        seed,
        roomOccupancy,
        facultyOccupancy,
        departmentSlotUsage,
        courseDayUsage,
        entries,
        false,
      );

      if (scheduled) {
        dayCounts[day] += 1;
        madeProgress = true;
      } else {
        pending.push(session);
      }
    }
  }

  for (let index = pending.length - 1; index >= 0; index -= 1) {
    const session = pending[index];
    const candidateDays = [...weekdayOrder].sort(
      (left, right) => dayCounts[left] - dayCounts[right],
    );

    let scheduled = false;
    for (const day of candidateDays) {
      if (dayCounts[day] >= 5) continue;

      scheduled = scheduleIntoDay(
        session,
        day,
        `${seed}:fallback`,
        roomOccupancy,
        facultyOccupancy,
        departmentSlotUsage,
        courseDayUsage,
        entries,
        true,
      );

      if (scheduled) {
        dayCounts[day] += 1;
        pending.splice(index, 1);
        break;
      }
    }

    if (!scheduled) {
      conflicts.push(`Unable to place ${session.course.courseCode} session ${session.ordinal + 1}`);
    }
  }

  return { entries, conflicts };
}

export function generateFullTimetable(
  allCourses: CourseSchedule[],
  departments: string[],
): { entries: TimetableEntry[]; summary: string } {
  const groups = allCourses
    .reduce<Array<{ dept: string; sem: number }>>((accumulator, course) => {
      const alreadyPresent = accumulator.some(
        (group) => group.dept === course.department && group.sem === course.semester,
      );

      if (departments.includes(course.department) && !alreadyPresent) {
        accumulator.push({ dept: course.department, sem: course.semester });
      }

      return accumulator;
    }, [])
    .sort((left, right) => {
      if (left.sem !== right.sem) return left.sem - right.sem;
      return left.dept.localeCompare(right.dept);
    });

  let entries: TimetableEntry[] = [];
  let conflictCount = 0;

  for (const group of groups) {
    const result = generateTimetable(allCourses, group.dept, group.sem, entries);
    entries = [...entries, ...result.entries];
    conflictCount += result.conflicts.length;
  }

  const summary =
    conflictCount === 0
      ? `${entries.length} sessions generated across ${groups.length} branch-year timetables using Monday-Friday slots and rooms L-1 to L-37.`
      : `${entries.length} sessions generated across ${groups.length} branch-year timetables with ${conflictCount} unplaced sessions.`;

  return { entries, summary };
}
