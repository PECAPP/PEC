import { prisma } from './utils';
import { daysFromNow } from './utils';

export async function seedAcademicCalendar(adminId: string) {
  console.log('   Seeding academic calendar events for 2026...');

  const events = [
    // January 2026
    {
      title: 'Academic Year Begins',
      description: 'Start of the academic year 2026-2027',
      date: new Date(2026, 0, 2),
      eventType: 'event',
      category: 'academic',
      importance: 'high',
      targetAudience: 'all',
    },
    {
      title: 'Student Registration Opens',
      description: 'Online registration for new and continuing students',
      date: new Date(2026, 0, 15),
      endDate: new Date(2026, 0, 31),
      eventType: 'registration',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
    },
    {
      title: 'Republic Day',
      description: 'National holiday - No classes',
      date: new Date(2026, 0, 26),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },

    // February 2026
    {
      title: 'Classes Begin - Semester 1',
      description: 'Commencement of classroom teaching activities',
      date: new Date(2026, 1, 1),
      eventType: 'event',
      category: 'academic',
      importance: 'high',
      targetAudience: 'all',
      location: 'All Departments',
    },
    {
      title: 'Faculty Development Workshop',
      description: 'Professional development for teaching staff',
      date: new Date(2026, 1, 15),
      endDate: new Date(2026, 1, 17),
      eventType: 'event',
      category: 'technical',
      importance: 'medium',
      targetAudience: 'faculty',
    },

    // March 2026
    {
      title: "Founder's Day Celebration",
      description: 'Annual celebration of the college foundation',
      date: new Date(2026, 2, 20),
      eventType: 'event',
      category: 'cultural',
      importance: 'medium',
      targetAudience: 'all',
      location: 'Main Auditorium',
    },
    {
      title: 'Spring Recess',
      description: 'One-week break for students and staff',
      date: new Date(2026, 2, 25),
      endDate: new Date(2026, 2, 31),
      eventType: 'recess',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },

    // April 2026
    {
      title: 'End Term Exams - Semester 1',
      description: 'Final examinations for first semester',
      date: new Date(2026, 3, 15),
      endDate: new Date(2026, 3, 30),
      eventType: 'exam',
      category: 'examination',
      importance: 'high',
      targetAudience: 'students',
    },

    // May 2026
    {
      title: 'Summer Vacation Begins',
      description: 'Start of summer break for students',
      date: new Date(2026, 4, 1),
      endDate: new Date(2026, 5, 30),
      eventType: 'recess',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'students',
    },

    // June 2026
    {
      title: 'Faculty Orientation & Planning',
      description: 'Preparation for the second semester',
      date: new Date(2026, 5, 1),
      endDate: new Date(2026, 5, 15),
      eventType: 'event',
      category: 'academic',
      importance: 'medium',
      targetAudience: 'faculty',
    },

    // July 2026
    {
      title: 'Second Semester Begins',
      description: 'Classes resume for even semesters',
      date: new Date(2026, 6, 1),
      eventType: 'event',
      category: 'academic',
      importance: 'high',
      targetAudience: 'all',
      location: 'All Departments',
    },

    // August 2026
    {
      title: 'Freshman Orientation Program',
      description: 'Welcome session for new students joining the institute',
      date: new Date(2026, 7, 1),
      endDate: new Date(2026, 7, 5),
      eventType: 'orientation',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
      location: 'Main Auditorium',
    },
    {
      title: 'Independence Day',
      description: 'National holiday - No classes',
      date: new Date(2026, 7, 15),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },
    {
      title: 'Course Registration Opens',
      description: 'Students can register for semester courses through the portal',
      date: new Date(2026, 7, 10),
      endDate: new Date(2026, 7, 20),
      eventType: 'registration',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
    },
    {
      title: 'Janmashtami',
      description: 'Festival holiday - No classes',
      date: new Date(2026, 7, 25),
      endDate: new Date(2026, 7, 27),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'medium',
      targetAudience: 'all',
    },

    // September 2026
    {
      title: "Teachers' Day Celebration",
      description: 'Appreciation day for faculty members',
      date: new Date(2026, 8, 5),
      eventType: 'event',
      category: 'cultural',
      importance: 'medium',
      targetAudience: 'all',
      location: 'Main Auditorium',
    },
    {
      title: 'Midterm Examinations - Sem 2',
      description: 'Midterm examination for second semester',
      date: new Date(2026, 8, 1),
      endDate: new Date(2026, 8, 15),
      eventType: 'exam',
      category: 'examination',
      importance: 'high',
      targetAudience: 'students',
    },
    {
      title: 'Gandhi Jayanti',
      description: 'Birth anniversary of Mahatma Gandhi - Holiday',
      date: new Date(2026, 8, 2),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },

    // October 2026
    {
      title: 'Autumn Recess',
      description: 'Mid-semester break',
      date: new Date(2026, 9, 2),
      endDate: new Date(2026, 9, 10),
      eventType: 'recess',
      category: 'holiday',
      importance: 'medium',
      targetAudience: 'all',
    },
    {
      title: 'Dussehra Holidays',
      description: 'Festival holiday - No classes',
      date: new Date(2026, 9, 8),
      endDate: new Date(2026, 9, 13),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },
    {
      title: 'Technical Symposium - TECHTRIX',
      description: 'Annual technical symposium featuring hackathons and competitions',
      date: new Date(2026, 9, 15),
      endDate: new Date(2026, 9, 17),
      eventType: 'event',
      category: 'technical',
      importance: 'high',
      targetAudience: 'students',
    },

    // November 2026
    {
      title: 'Diwali Celebration',
      description: 'Festival celebration on campus',
      date: new Date(2026, 10, 14),
      endDate: new Date(2026, 10, 17),
      eventType: 'event',
      category: 'cultural',
      importance: 'medium',
      targetAudience: 'all',
    },
    {
      title: 'End Term Exams - Semester 2',
      description: 'Final examinations for second semester',
      date: new Date(2026, 10, 15),
      endDate: new Date(2026, 10, 30),
      eventType: 'exam',
      category: 'examination',
      importance: 'high',
      targetAudience: 'students',
    },

    // December 2026
    {
      title: 'Result Declaration',
      description: 'Announcement of semester results',
      date: new Date(2026, 11, 10),
      eventType: 'event',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
    },
    {
      title: 'Winter Break Begins',
      description: 'Winter vacation for all',
      date: new Date(2026, 11, 15),
      endDate: new Date(2026, 11, 31),
      eventType: 'recess',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },
  ];

  const createdEvents = await Promise.all(
    events.map((event) =>
      prisma.academicCalendarEvent.create({
        data: {
          ...event,
          createdBy: adminId,
        },
      })
    )
  );

  console.log(`   ✓ Created ${createdEvents.length} academic calendar events for 2026`);
  return createdEvents;
}

