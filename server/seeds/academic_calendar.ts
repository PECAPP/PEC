import { prisma } from './utils';
import { daysFromNow } from './utils';

export async function seedAcademicCalendar(adminId: string) {
  console.log('   Seeding academic calendar events...');

  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  const events = [
    // April 2026 - Current Month Focus
    {
      title: 'Mid-Term Project Evaluatons',
      description: 'Mid-term evaluation for final year projects and major research work.',
      date: new Date(currentYear, 3, 5), // April 5
      endDate: new Date(currentYear, 3, 10),
      eventType: 'exam',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
      location: 'Seminar Rooms',
    },
    {
      title: 'Workshop: Modern Web Architectures',
      description: 'A 2-day session by industry leaders on Next.js, Microfrontends, and Serverless.',
      date: new Date(currentYear, 3, 12),
      eventType: 'event',
      category: 'technical',
      importance: 'medium',
      targetAudience: 'all',
      location: 'Lab 4, IT Department',
    },
    {
      title: 'Course Selection for Next Semester',
      description: 'Students are advised to review elective offerings and select preferences.',
      date: new Date(currentYear, 3, 15),
      endDate: new Date(currentYear, 3, 20),
      eventType: 'registration',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
    },
    {
      title: 'Inter-College Sports Meet',
      description: 'Grand sports competition across basketball, football, and athletics.',
      date: new Date(currentYear, 3, 22),
      endDate: new Date(currentYear, 3, 26),
      eventType: 'event',
      category: 'sports',
      importance: 'high',
      targetAudience: 'all',
      location: 'Sports Complex',
    },
    {
      title: 'Final Assignment Deadline - Semester 2',
      description: 'Deadline to submit all lab journals and internal assignments.',
      date: new Date(currentYear, 3, 30),
      eventType: 'deadline',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
    },

    // Orientation Week
    {
      title: 'Freshman Orientation Program',
      description: 'Welcome session for new students joining the institute. Introduction to campus facilities, faculty, and academic policies.',
      date: new Date(currentYear, 7, 1), // August 1
      endDate: new Date(currentYear, 7, 5),
      eventType: 'orientation',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
      location: 'Main Auditorium',
    },
    {
      title: 'Campus Tour for New Students',
      description: 'Guided tour of all campus facilities including library, laboratories, sports complex, and hostels.',
      date: new Date(currentYear, 7, 2),
      eventType: 'event',
      category: 'administrative',
      importance: 'medium',
      targetAudience: 'students',
      location: 'Campus Wide',
    },

    // Registration & Admission
    {
      title: 'Course Registration Opens',
      description: 'Students can register for semester courses through the portal.',
      date: new Date(currentYear, 7, 10),
      endDate: new Date(currentYear, 7, 20),
      eventType: 'registration',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
    },
    {
      title: 'Course Add/Drop Period',
      description: 'Students can add or drop courses during this period without penalty.',
      date: new Date(currentYear, 7, 25),
      endDate: new Date(currentYear, 8, 5),
      eventType: 'event',
      category: 'academic',
      importance: 'medium',
      targetAudience: 'students',
    },

    // First Semester Start
    {
      title: 'Classes Begin - Odd Semester',
      description: 'Regular classes commence for all semesters.',
      date: new Date(currentYear, 7, 16),
      eventType: 'event',
      category: 'academic',
      importance: 'high',
      targetAudience: 'all',
      location: 'All Departments',
    },

    // Independence Day
    {
      title: 'Independence Day',
      description: 'National holiday - No classes.',
      date: new Date(currentYear, 7, 15),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },

    // Teacher's Day
    {
      title: "Teacher's Day Celebration",
      description: 'Celebration to honor and appreciate faculty members. Cultural programs by students.',
      date: new Date(currentYear, 8, 5),
      eventType: 'event',
      category: 'cultural',
      importance: 'medium',
      targetAudience: 'all',
      location: 'Main Auditorium',
    },

    // Mid Semester
    {
      title: 'Mid Semester Examinations Begin',
      description: 'Internal mid-term examinations for all courses.',
      date: new Date(currentYear, 8, 20),
      endDate: new Date(currentYear, 9, 5),
      eventType: 'exam',
      category: 'examination',
      importance: 'high',
      targetAudience: 'students',
    },
    {
      title: 'Mid Semester Break',
      description: 'Short break during mid-semester examinations.',
      date: new Date(currentYear, 9, 10),
      endDate: new Date(currentYear, 9, 15),
      eventType: 'recess',
      category: 'academic',
      importance: 'medium',
      targetAudience: 'all',
    },

    // Gandhi Jayanti
    {
      title: 'Gandhi Jayanti',
      description: 'Birth anniversary of Mahatma Gandhi - Holiday.',
      date: new Date(currentYear, 8, 2),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },

    // Dussehra
    {
      title: 'Dussehra Holidays',
      description: 'Festival holiday - No classes.',
      date: new Date(currentYear, 9, 3),
      endDate: new Date(currentYear, 9, 8),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },

    // Diwali
    {
      title: 'Diwali Holidays',
      description: 'Festival of lights celebration - No classes.',
      date: new Date(currentYear, 10, 1),
      endDate: new Date(currentYear, 10, 7),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
    },

    // Technical Events
    {
      title: 'Technical Symposium - TECHTRIX',
      description: 'Annual technical symposium featuring hackathons, coding competitions, and tech talks.',
      date: new Date(currentYear, 9, 15),
      endDate: new Date(currentYear, 9, 17),
      eventType: 'event',
      category: 'technical',
      importance: 'high',
      targetAudience: 'students',
      location: 'Computer Science Block',
    },
    {
      title: 'Workshop on Machine Learning',
      description: 'Hands-on workshop covering neural networks and deep learning fundamentals.',
      date: new Date(currentYear, 9, 20),
      eventType: 'event',
      category: 'technical',
      importance: 'medium',
      targetAudience: 'students',
      location: 'Seminar Hall 2',
    },
    {
      title: 'Industry Expert Lecture Series',
      description: 'Guest lecture by industry professionals on emerging technologies.',
      date: new Date(currentYear, 9, 25),
      eventType: 'event',
      category: 'academic',
      importance: 'medium',
      targetAudience: 'all',
      location: 'Auditorium B',
    },

    // Cultural Events
    {
      title: 'Annual Cultural Festival - UDAAN',
      description: 'Three-day cultural festival with music, dance, drama, and art exhibitions.',
      date: new Date(currentYear, 10, 10),
      endDate: new Date(currentYear, 10, 12),
      eventType: 'event',
      category: 'cultural',
      importance: 'high',
      targetAudience: 'all',
      location: 'Open Air Theatre',
    },
    {
      title: 'Sports Meet',
      description: 'Annual sports meet with athletics and team sports competitions.',
      date: new Date(currentYear, 10, 20),
      endDate: new Date(currentYear, 10, 23),
      eventType: 'event',
      category: 'sports',
      importance: 'medium',
      targetAudience: 'all',
      location: 'Sports Complex',
    },

    // Assignment Deadlines
    {
      title: 'Assignment Submission Deadline - All Courses',
      description: 'Last date to submit all semester assignments.',
      date: new Date(currentYear, 10, 15),
      eventType: 'deadline',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
    },
    {
      title: 'Project Presentations Deadline',
      description: 'Final project presentations for all courses with practical components.',
      date: new Date(currentYear, 10, 25),
      eventType: 'deadline',
      category: 'academic',
      importance: 'high',
      targetAudience: 'students',
    },

    // End Semester
    {
      title: 'End Semester Examinations Begin',
      description: 'Final examinations for all courses.',
      date: new Date(currentYear, 11, 1),
      endDate: new Date(currentYear, 11, 20),
      eventType: 'exam',
      category: 'examination',
      importance: 'high',
      targetAudience: 'students',
      location: 'Examination Hall',
    },
    {
      title: 'Practical Examinations',
      description: 'Lab practical examinations for all courses.',
      date: new Date(currentYear, 10, 25),
      endDate: new Date(currentYear, 11, 5),
      eventType: 'exam',
      category: 'examination',
      importance: 'high',
      targetAudience: 'students',
      location: 'Various Laboratories',
    },

    // Semester End
    {
      title: 'Semester End Recess',
      description: 'Break after end semester examinations before results.',
      date: new Date(currentYear, 11, 22),
      endDate: new Date(currentYear, 11, 31),
      eventType: 'recess',
      category: 'academic',
      importance: 'medium',
      targetAudience: 'all',
    },
    {
      title: 'Result Declaration',
      description: 'Declaration of semester examination results.',
      date: new Date(currentYear + 1, 0, 5),
      eventType: 'result',
      category: 'academic',
      importance: 'high',
      targetAudience: 'all',
    },

    // Christmas & New Year
    {
      title: 'Christmas Day',
      description: 'Christmas holiday.',
      date: new Date(currentYear, 11, 25),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'medium',
      targetAudience: 'all',
    },
    {
      title: 'New Year Holidays',
      description: 'Celebration of the new year.',
      date: new Date(currentYear + 1, 0, 1),
      endDate: new Date(currentYear + 1, 0, 3),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'medium',
      targetAudience: 'all',
    },

    // Republic Day
    {
      title: 'Republic Day',
      description: 'National holiday celebrating the Constitution of India.',
      date: new Date(currentYear + 1, 0, 26),
      eventType: 'holiday',
      category: 'holiday',
      importance: 'high',
      targetAudience: 'all',
      location: 'Main Ground',
    },

    // Important Faculty Events
    {
      title: 'Faculty Development Program',
      description: 'Workshop on latest teaching methodologies and curriculum updates.',
      date: new Date(currentYear, 8, 10),
      endDate: new Date(currentYear, 8, 12),
      eventType: 'event',
      category: 'academic',
      importance: 'medium',
      targetAudience: 'faculty',
      location: 'Faculty Lounge',
    },
    {
      title: 'Research Paper Submission Deadline',
      description: 'Last date for submitting research papers for the departmental journal.',
      date: new Date(currentYear, 9, 30),
      eventType: 'deadline',
      category: 'academic',
      importance: 'medium',
      targetAudience: 'faculty',
    },
    {
      title: 'Annual Faculty Review',
      description: 'Performance review and feedback session for all faculty members.',
      date: new Date(currentYear, 10, 30),
      eventType: 'event',
      category: 'administrative',
      importance: 'high',
      targetAudience: 'faculty',
      location: 'Conference Room',
    },

    // Working Saturdays
    {
      title: 'Saturday Working Day',
      description: ' compensatory working day for holidays',
      date: new Date(currentYear, 8, 14),
      eventType: 'working-day',
      category: 'administrative',
      importance: 'medium',
      targetAudience: 'all',
    },
    {
      title: 'Saturday Working Day',
      description: 'Compensatory working day for holidays.',
      date: new Date(currentYear, 10, 9),
      eventType: 'working-day',
      category: 'administrative',
      importance: 'medium',
      targetAudience: 'all',
    },

    // Alumni & Placement
    {
      title: 'Alumni Meet',
      description: 'Annual gathering of institute alumni for networking and interactions.',
      date: new Date(currentYear, 10, 15),
      eventType: 'event',
      category: 'administrative',
      importance: 'medium',
      targetAudience: 'all',
      location: 'Alumni Hall',
    },
    {
      title: 'Placement Drive - Tech Companies',
      description: 'Campus recruitment for technology companies.',
      date: new Date(currentYear, 10, 5),
      endDate: new Date(currentYear, 10, 10),
      eventType: 'event',
      category: 'administrative',
      importance: 'high',
      targetAudience: 'students',
      location: 'Placement Cell',
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

  console.log(`   Created ${createdEvents.length} academic calendar events`);
  return createdEvents;
}
