/**
 * AUTO TIMETABLE GENERATOR
 * Conflict-free scheduling algorithm for PEC Chandigarh ERP
 * 
 * Features:
 * - Faculty conflict detection (same faculty, different classes)
 * - Room conflict detection (same room, different courses)
 * - Balanced session distribution (courses spread across week)
 * - Department-wise generation
 */

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
}

// Available time slots (5 days, 5 slots per day = 25 total slots)
// Available time slots (5 days, 8 slots per day - lunch at 13:00-14:00)
export const TIME_SLOTS: TimeSlot[] = [
  // Monday
  { day: 'Monday', time: '08:00-09:00', displayTime: '8:00 AM - 9:00 AM' },
  { day: 'Monday', time: '09:00-10:00', displayTime: '9:00 AM - 10:00 AM' },
  { day: 'Monday', time: '10:00-11:00', displayTime: '10:00 AM - 11:00 AM' },
  { day: 'Monday', time: '11:00-12:00', displayTime: '11:00 AM - 12:00 PM' },
  { day: 'Monday', time: '12:00-13:00', displayTime: '12:00 PM - 1:00 PM' },
  // Lunch 13:00-14:00 (Omitted from generation)
  { day: 'Monday', time: '14:00-15:00', displayTime: '2:00 PM - 3:00 PM' },
  { day: 'Monday', time: '15:00-16:00', displayTime: '3:00 PM - 4:00 PM' },
  { day: 'Monday', time: '16:00-17:00', displayTime: '4:00 PM - 5:00 PM' },
  
  // Tuesday
  { day: 'Tuesday', time: '08:00-09:00', displayTime: '8:00 AM - 9:00 AM' },
  { day: 'Tuesday', time: '09:00-10:00', displayTime: '9:00 AM - 10:00 AM' },
  { day: 'Tuesday', time: '10:00-11:00', displayTime: '10:00 AM - 11:00 AM' },
  { day: 'Tuesday', time: '11:00-12:00', displayTime: '11:00 AM - 12:00 PM' },
  { day: 'Tuesday', time: '12:00-13:00', displayTime: '12:00 PM - 1:00 PM' },
  { day: 'Tuesday', time: '14:00-15:00', displayTime: '2:00 PM - 3:00 PM' },
  { day: 'Tuesday', time: '15:00-16:00', displayTime: '3:00 PM - 4:00 PM' },
  { day: 'Tuesday', time: '16:00-17:00', displayTime: '4:00 PM - 5:00 PM' },
  
  // Wednesday
  { day: 'Wednesday', time: '08:00-09:00', displayTime: '8:00 AM - 9:00 AM' },
  { day: 'Wednesday', time: '09:00-10:00', displayTime: '9:00 AM - 10:00 AM' },
  { day: 'Wednesday', time: '10:00-11:00', displayTime: '10:00 AM - 11:00 AM' },
  { day: 'Wednesday', time: '11:00-12:00', displayTime: '11:00 AM - 12:00 PM' },
  { day: 'Wednesday', time: '12:00-13:00', displayTime: '12:00 PM - 1:00 PM' },
  { day: 'Wednesday', time: '14:00-15:00', displayTime: '2:00 PM - 3:00 PM' },
  { day: 'Wednesday', time: '15:00-16:00', displayTime: '3:00 PM - 4:00 PM' },
  { day: 'Wednesday', time: '16:00-17:00', displayTime: '4:00 PM - 5:00 PM' },
  
  // Thursday
  { day: 'Thursday', time: '08:00-09:00', displayTime: '8:00 AM - 9:00 AM' },
  { day: 'Thursday', time: '09:00-10:00', displayTime: '9:00 AM - 10:00 AM' },
  { day: 'Thursday', time: '10:00-11:00', displayTime: '10:00 AM - 11:00 AM' },
  { day: 'Thursday', time: '11:00-12:00', displayTime: '11:00 AM - 12:00 PM' },
  { day: 'Thursday', time: '12:00-13:00', displayTime: '12:00 PM - 1:00 PM' },
  { day: 'Thursday', time: '14:00-15:00', displayTime: '2:00 PM - 3:00 PM' },
  { day: 'Thursday', time: '15:00-16:00', displayTime: '3:00 PM - 4:00 PM' },
  { day: 'Thursday', time: '16:00-17:00', displayTime: '4:00 PM - 5:00 PM' },
  
  // Friday
  { day: 'Friday', time: '08:00-09:00', displayTime: '8:00 AM - 9:00 AM' },
  { day: 'Friday', time: '09:00-10:00', displayTime: '9:00 AM - 10:00 AM' },
  { day: 'Friday', time: '10:00-11:00', displayTime: '10:00 AM - 11:00 AM' },
  { day: 'Friday', time: '11:00-12:00', displayTime: '11:00 AM - 12:00 PM' },
  { day: 'Friday', time: '12:00-13:00', displayTime: '12:00 PM - 1:00 PM' },
  { day: 'Friday', time: '14:00-15:00', displayTime: '2:00 PM - 3:00 PM' },
  { day: 'Friday', time: '15:00-16:00', displayTime: '3:00 PM - 4:00 PM' },
  { day: 'Friday', time: '16:00-17:00', displayTime: '4:00 PM - 5:00 PM' },

  // Saturday (Half Day or Extra Sessions)
  { day: 'Saturday', time: '08:00-09:00', displayTime: '8:00 AM - 9:00 AM' },
  { day: 'Saturday', time: '09:00-10:00', displayTime: '9:00 AM - 10:00 AM' },
  { day: 'Saturday', time: '10:00-11:00', displayTime: '10:00 AM - 11:00 AM' },
  { day: 'Saturday', time: '11:00-12:00', displayTime: '11:00 AM - 12:00 PM' },
  { day: 'Saturday', time: '12:00-13:00', displayTime: '12:00 PM - 1:00 PM' },
];

// Available rooms
export const ROOMS = [
  'Room 101', 'Room 102', 'Room 103', 'Room 104', 'Room 105',
  'Room 201', 'Room 202', 'Room 203', 'Room 204', 'Room 205',
  'Room 301', 'Room 302', 'Room 303', 'Room 304', 'Room 305',
  'Room 401', 'Room 402', 'Room 403', 'Room 404', 'Room 405',
  'L-101', 'L-102', 'L-201', 'L-202', 'L-301', 'L-302',
  'Lab 501', 'Lab 502', 'Lab 503', 'Lab 504', 'Lab 505',
  'Lab 601', 'Lab 602', 'Lab 603', 'Lab 604', 'Lab 605',
  'Seminar Hall 1', 'Seminar Hall 2', 'Main Audi', 'Workshop'
];

/**
 * Check if a time slot has conflicts
 */
export function hasConflict(
  existingEntries: TimetableEntry[],
  day: string,
  time: string,
  facultyId?: string,
  room?: string
): { hasConflict: boolean; reason?: string } {
  const conflicts = existingEntries.filter(
    entry => entry.day === day && entry.timeSlot === time
  );

  // Check faculty conflict (only if faculty is assigned)
  if (facultyId && facultyId !== '' && facultyId !== 'TBA') {
    const facultyConflict = conflicts.find(c => c.facultyId === facultyId);
    if (facultyConflict) {
      return {
        hasConflict: true,
        reason: `Faculty teaching ${facultyConflict.courseName} at same time`
      };
    }
  }

  // Check room conflict
  if (room) {
    const roomConflict = conflicts.find(c => c.room === room);
    if (roomConflict) {
      return {
        hasConflict: true,
        reason: `Room occupied by ${roomConflict.courseName}`
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Generate timetable for a department
 * FIXED: Ensures NO overlapping classes for same department students
 */
export function generateTimetable(
  courses: CourseSchedule[],
  department: string,
  semester: number,
  existingEntries: TimetableEntry[] = [],
  roomPool: string[] = ROOMS // Allow specific department room pool
): { entries: TimetableEntry[]; conflicts: string[] } {
  const generatedEntries: TimetableEntry[] = [];
  const conflicts: string[] = [];
  
  // Filter courses for this specific group
  const deptCourses = courses.filter(
    c => c.department === department && c.semester === semester
  );

  if (deptCourses.length === 0) {
    return { entries: generatedEntries, conflicts: ['No courses found for department'] };
  }

  // Track which slots are ALREADY USED by this department
  const departmentUsedSlots = new Set<string>();

  // Create a copy of available slots
  const allSlots = [...TIME_SLOTS];
  
  // Shuffle slots for better variety across departments
  for (let i = allSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allSlots[i], allSlots[j]] = [allSlots[j], allSlots[i]];
  }

  for (const course of deptCourses) {
    // Each course needs 3-4 sessions per week
    const sessionsNeeded = course.credits >= 4 ? 4 : 3;
    let sessionsScheduled = 0;
    
    // Sort slots by how many sessions we have that day to spread them out
    const getSchedulesForDay = (day: string) => 
      generatedEntries.filter(e => e.day === day && e.courseId === course.courseId).length;

    // Try multiple passes to find best distribution
    let pass = 0;
    while (sessionsScheduled < sessionsNeeded && pass < 5) {
      pass++;
      
      // Shuffle slots on each pass to find new openings
      const currentSlots = [...allSlots].sort(() => Math.random() - 0.5);
      
      for (const slot of currentSlots) {
        if (sessionsScheduled >= sessionsNeeded) break;
        
        const slotKey = `${slot.day}-${slot.time}`;
        
        // 1. Check if department students already have a class at this time
        if (departmentUsedSlots.has(slotKey)) continue;

        // 2. Control density: 1 pass = 1 class/day, later passes allow more
        const maxPerDay = pass <= 2 ? 1 : (pass <= 4 ? 2 : 3);
        if (getSchedulesForDay(slot.day) >= maxPerDay) continue;

        // 3. Faculty Conflict Check (skip if faculty is TBA)
        const allExisting = [...existingEntries, ...generatedEntries];
        const isFacultyAssigned = course.facultyId && course.facultyId !== '' && course.facultyId !== 'TBA';
        
        let facultyBusy = false;
        if (isFacultyAssigned) {
          facultyBusy = allExisting.some(
            e => e.day === slot.day && e.timeSlot === slot.time && e.facultyId === course.facultyId
          );
        }
        if (facultyBusy) continue;

        // 4. Room Check - Start with dept pool, fallback to global if pass is high
        let finalRoom = '';
        const currentRoomPool = pass > 3 ? ROOMS : roomPool;
        const shuffledPool = [...currentRoomPool].sort(() => Math.random() - 0.5);
        
        for (const room of shuffledPool) {
          const roomBusy = allExisting.some(
            e => e.day === slot.day && e.timeSlot === slot.time && e.room === room
          );
          if (!roomBusy) {
            finalRoom = room;
            break;
          }
        }

        if (!finalRoom) continue;

        // SUCCESS
        departmentUsedSlots.add(slotKey);
        generatedEntries.push({
          day: slot.day,
          timeSlot: slot.time,
          courseId: course.courseId,
          courseName: course.courseName,
          courseCode: course.courseCode,
          facultyId: course.facultyId,
          facultyName: course.facultyName,
          room: finalRoom,
          department,
          semester
        });
        sessionsScheduled++;
      }
    }

    if (sessionsScheduled < sessionsNeeded) {
      conflicts.push(`${course.courseCode}: Scheduled ${sessionsScheduled}/${sessionsNeeded}`);
    }
  }

  return { entries: generatedEntries, conflicts };
}

/**
 * Generate full timetable for all departments
 */
export function generateFullTimetable(
  allCourses: CourseSchedule[],
  departments: string[]
): { entries: TimetableEntry[]; summary: string } {
  let allEntries: TimetableEntry[] = [];
  const departmentSummary: string[] = [];
  let totalSessions = 0;
  
  // Assign random room pools to departments (3 rooms each)
  const deptRoomPools: Record<string, string[]> = {};
  departments.forEach(dept => {
    deptRoomPools[dept] = [...ROOMS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  });

  // Group all courses by (Department, Semester)
  const groups: { dept: string; sem: number }[] = [];
  allCourses.forEach(c => {
    if (!groups.some(g => g.dept === c.department && g.sem === c.semester)) {
      groups.push({ dept: c.department, sem: c.semester });
    }
  });

  // Shuffle groups so priority isn't always the same
  groups.sort(() => Math.random() - 0.5);

  for (const group of groups) {
    const { entries, conflicts } = generateTimetable(
      allCourses,
      group.dept,
      group.sem,
      allEntries,
      deptRoomPools[group.dept] || ROOMS
    );
    
    allEntries = [...allEntries, ...entries];
    totalSessions += entries.length;
    
    if (entries.length > 0) {
      departmentSummary.push(
        `✓ ${group.dept} S${group.sem}: ${entries.length}`
      );
    }
  }

  return {
    entries: allEntries,
    summary: `${totalSessions} sessions generated. Groups using fixed room pools for variety.`
  };
}
