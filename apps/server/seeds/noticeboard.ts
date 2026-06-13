import { daysAgo, prisma } from './utils';
import { FacultySeed } from './data';

type NoticeSeed = {
  title: string;
  content: string;
  category: 'news' | 'update' | 'event' | 'alert';
  important?: boolean;
  priorityLevel?: number;
  pinned?: boolean;
  mediaJson?: string;
  authorId: string;
  publishedAt?: Date;
};

export async function seedNoticeboard(adminId: string, faculties: FacultySeed[]) {
  const fallbackAuthorId = faculties[0]?.id ?? adminId;
  const faculty1 = faculties[1]?.id ?? adminId;
  const faculty2 = faculties[2]?.id ?? adminId;
  const faculty3 = faculties[3]?.id ?? adminId;

  const notices: NoticeSeed[] = [
    {
      title: 'Orientation in PEC Main Auditorium',
      content: 'All 1st-year B.Tech students are requested to attend the semester orientation in the Main Auditorium at 10:00 AM on Monday. Attendance is mandatory. Parents are also invited.',
      category: 'news', important: true, priorityLevel: 3, pinned: true,
      authorId: adminId, publishedAt: daysAgo(1),
    },
    {
      title: 'Mid-Semester Examination Schedule Released',
      content: 'The mid-semester examination timetable for all departments has been released on the university portal. Students are requested to check their individual schedules and report any discrepancies to their department coordinators before Friday.',
      category: 'alert', important: true, priorityLevel: 3, pinned: true,
      authorId: adminId, publishedAt: daysAgo(2),
    },
    {
      title: 'Department Lab Timings Updated',
      content: 'Faculty and students should check revised lab slots before booking project sessions this week. The new schedule is effective from Monday.',
      category: 'update', important: false, priorityLevel: 1,
      authorId: fallbackAuthorId, publishedAt: daysAgo(3),
    },
    {
      title: 'Registrations Open for PECFest 2026',
      content: 'Registrations are officially open for PECFest! Teams can submit their hackathon and cultural event entries through their department coordinators. Last date: 20th June 2026.',
      category: 'event', important: false, priorityLevel: 2,
      authorId: adminId, publishedAt: daysAgo(4),
    },
    {
      title: 'Server Maintenance Window — Sunday 1–3 AM',
      content: 'A brief maintenance window is planned on Sunday from 01:00 AM to 03:00 AM. Some modules may be temporarily unavailable. Please save your work beforehand.',
      category: 'alert', important: true, priorityLevel: 3,
      authorId: adminId, publishedAt: daysAgo(0),
    },
    {
      title: 'GATE 2027 Coaching — Registration Open',
      content: 'The institute is offering subsidized GATE 2027 coaching for final year B.Tech students. Registration is open till 15th June. Contact your department HOD for details.',
      category: 'news', important: false, priorityLevel: 2,
      authorId: faculty1, publishedAt: daysAgo(5),
    },
    {
      title: 'Industry Visit: Google India, Gurgaon',
      content: 'CSE, AI, and DS department students of 5th and 7th semester are invited to an industry visit to Google India offices in Gurgaon on 25th June. Register via the student portal by 18th June.',
      category: 'event', important: false, priorityLevel: 2,
      authorId: faculty2, publishedAt: daysAgo(6),
    },
    {
      title: 'Anti-Ragging Committee Notice',
      content: 'The Anti-Ragging Committee reminds all students that any form of ragging is strictly prohibited under UGC regulations. Anyone witnessing ragging should report immediately to the committee or call the helpline 1800-180-5522.',
      category: 'alert', important: true, priorityLevel: 3, pinned: true,
      authorId: adminId, publishedAt: daysAgo(7),
    },
    {
      title: 'Scholarship Applications — PM-YASASVI Scheme',
      content: 'Applications for the PM-YASASVI scholarship scheme are now open. Eligible OBC, EBC, and DNT students should submit their applications through the National Scholarship Portal by 31st July 2026.',
      category: 'news', important: false, priorityLevel: 2,
      authorId: adminId, publishedAt: daysAgo(8),
    },
    {
      title: 'NSS Camp Registration — July 2026',
      content: 'NSS Unit PEC is organizing a 7-day special camp in July. Students who wish to participate should submit their names to the NSS Program Officer by 10th June. Service certificates will be awarded.',
      category: 'event', important: false, priorityLevel: 1,
      authorId: faculty3, publishedAt: daysAgo(9),
    },
    {
      title: 'New Wi-Fi Access Points Installed in Academic Block',
      content: 'IT Services has installed high-speed Wi-Fi access points on all 4 floors of the Academic Block. Students can connect using their PEC credentials. Please report any connectivity issues to helpdesk@pec.edu.',
      category: 'update', important: false, priorityLevel: 1,
      authorId: adminId, publishedAt: daysAgo(10),
    },
    {
      title: 'Smart India Hackathon 2026 — Team Formation',
      content: 'SIH 2026 registration is open! Form teams of 6 students (same or cross-department) and register through your department coordinator. PEC students who won last year will mentor registered teams.',
      category: 'event', important: true, priorityLevel: 3,
      authorId: faculty1, publishedAt: daysAgo(11),
    },
    {
      title: 'CGPA Requirements for Placements Circular',
      content: 'The Training & Placement Office announces that companies in the upcoming recruitment drive require a minimum CGPA of 6.5. Students with backlogs are not eligible for campus placements this cycle.',
      category: 'alert', important: true, priorityLevel: 3,
      authorId: adminId, publishedAt: daysAgo(12),
    },
    {
      title: 'Annual Sports Meet 2026 — Events and Schedule',
      content: 'The Annual Sports Meet will be held from 28th June to 2nd July 2026 at the PEC Sports Complex. Events include cricket, football, badminton, chess, and athletics. Department teams must register by 22nd June.',
      category: 'event', important: false, priorityLevel: 2,
      authorId: adminId, publishedAt: daysAgo(14),
    },
    {
      title: 'PhD Admissions Open — January 2027 Batch',
      content: 'PEC University invites applications for PhD admissions in all engineering departments for the January 2027 batch. Candidates with M.Tech/M.E. degrees or GATE scores are eligible. Last date: 30th August 2026.',
      category: 'news', important: false, priorityLevel: 2,
      authorId: adminId, publishedAt: daysAgo(15),
    },
    {
      title: 'Hostel Room Allocation for New Students',
      content: 'Room allocation for first-year students admitted in 2026 has been completed. Students can view their room assignments in the Hostel module. Report any issues to the Chief Warden by 15th July.',
      category: 'update', important: false, priorityLevel: 1,
      authorId: adminId, publishedAt: daysAgo(18),
    },
    {
      title: 'Research Seminar: Sustainable Energy Systems',
      content: 'Dr. Priya Menon from EE Department will be delivering a guest lecture on "Advances in Sustainable Energy Systems and Grid Integration" on Friday at 3 PM in Seminar Hall 2. Open to all students.',
      category: 'event', important: false, priorityLevel: 1,
      authorId: faculty2, publishedAt: daysAgo(20),
    },
    {
      title: 'Blood Donation Camp — NCC & NSS',
      content: 'A blood donation camp is being organized by NCC & NSS units on 5th July 2026 in the Main Auditorium from 9 AM – 2 PM. All willing donors above 18 years of age are encouraged to participate.',
      category: 'event', important: false, priorityLevel: 1,
      authorId: faculty3, publishedAt: daysAgo(22),
    },
    {
      title: 'Fee Payment Last Date — July Semester',
      content: 'Students are reminded that the last date for fee payment for the July semester is 30th June 2026. A late fine of Rs. 100 per day will be charged after the deadline. Pay via the Finance module.',
      category: 'alert', important: true, priorityLevel: 3,
      authorId: adminId, publishedAt: daysAgo(25),
    },
    {
      title: 'IEEE Student Branch — New Membership Drive',
      content: 'The IEEE Student Branch at PEC is conducting its annual membership drive. Students who join before 30th June get early access to workshops, international conferences, and technical resources.',
      category: 'news', important: false, priorityLevel: 1,
      authorId: faculty1, publishedAt: daysAgo(30),
    },
  ];

  await prisma.notice.createMany({
    data: notices.map((notice) => ({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      important: !!notice.important,
      priorityLevel: notice.priorityLevel ?? (notice.important ? 3 : 2),
      pinned: !!notice.pinned,
      mediaJson: notice.mediaJson ?? null,
      authorId: notice.authorId,
      publishedAt: notice.publishedAt ?? new Date(),
    })),
  });
}

