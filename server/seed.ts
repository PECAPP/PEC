import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { encryptField } from './src/common/security/field-encryption';

type DepartmentSeed = {
  code: string;
  name: string;
  timetableLabel: string;
  description: string;
  specializations: [string, string, string];
  semesterCatalog: Record<
    number,
    Array<{ code: string; name: string; credits: number }>
  >;
};

type FacultySeed = {
  id: string;
  name: string;
  departmentCode: string;
  departmentName: string;
};

type StudentSeed = {
  id: string;
  name: string;
  departmentCode: string;
  departmentName: string;
  semester: number;
  batch: string;
};

type CourseSeed = {
  id: string;
  code: string;
  name: string;
  credits: number;
  departmentCode: string;
  departmentName: string;
  semester: number;
  facultyId: string;
  facultyName: string;
};

const prisma = new PrismaClient();

const ACTIVE_SEMESTERS = [1, 3, 5, 7];
const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const TIMETABLE_TIME_SLOTS = [
  ['08:00', '09:00'],
  ['09:00', '10:00'],
  ['10:00', '11:00'],
  ['11:00', '12:00'],
  ['12:00', '13:00'],
  ['14:00', '15:00'],
  ['15:00', '16:00'],
] as const;
const TIMETABLE_ROOMS = Array.from({ length: 37 }, (_, index) => `L-${index + 1}`);

const COMMON_SEMESTER_ONE = [
  { code: '101', name: 'Engineering Mathematics I', credits: 4 },
  { code: '102', name: 'Applied Physics', credits: 4 },
  { code: '103', name: 'Programming for Problem Solving', credits: 3 },
  { code: '104', name: 'Basic Electrical & Electronics', credits: 3 },
  { code: '105', name: 'Workshop Practice', credits: 2 },
];

const JOB_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Texas Instruments',
  'NVIDIA',
  'Tata Steel',
  'L&T',
  'Bosch',
  'ZS Associates',
  'Deloitte',
  'BHEL',
  'Airbus',
];

const ROOM_FEATURES = [
  JSON.stringify(['Projector', 'WiFi', 'Whiteboard']),
  JSON.stringify(['Smart Display', 'WiFi', 'AC']),
  JSON.stringify(['Projector', 'Lab Benches', 'Power Backup']),
];

const STUDENT_FIRST_NAMES = [
  'Aarav',
  'Ishita',
  'Vivaan',
  'Ananya',
  'Aditya',
  'Meera',
  'Kunal',
  'Riya',
  'Kabir',
  'Siya',
];

const STUDENT_LAST_NAMES = [
  'Sharma',
  'Verma',
  'Patel',
  'Singh',
  'Reddy',
  'Iyer',
  'Nair',
  'Gupta',
  'Das',
  'Kapoor',
];

const FACULTY_PREFIXES = ['Dr.', 'Prof.', 'Dr.'];
const FACULTY_FIRST_NAMES = [
  'Amit',
  'Priya',
  'Sandeep',
  'Neha',
  'Rahul',
  'Smita',
  'Arvind',
  'Shalini',
  'Vivek',
  'Meenakshi',
];
const FACULTY_LAST_NAMES = [
  'Kumar',
  'Menon',
  'Bansal',
  'Saxena',
  'Chopra',
  'Ghosh',
  'Raman',
  'Batra',
  'Khanna',
  'Mishra',
];

const SOCIAL_SUFFIXES = ['dev', 'eng', 'official', 'campus', 'acad', 'labs'];

const SEMESTER_DISTRIBUTION = [1, 1, 1, 3, 3, 3, 5, 5, 7, 7];

function buildDepartment(
  code: string,
  name: string,
  timetableLabel: string,
  description: string,
  specializations: [string, string, string],
  semesterNames: Record<number, string[]>,
): DepartmentSeed {
  return {
    code,
    name,
    timetableLabel,
    description,
    specializations,
    semesterCatalog: {
      1: COMMON_SEMESTER_ONE.map((course) => ({
        code: `${code}${course.code}`,
        name: course.name,
        credits: course.credits,
      })),
      3: semesterNames[3].map((courseName, index) => ({
        code: `${code}3${String(index + 1).padStart(2, '0')}`,
        name: courseName,
        credits: index === 4 ? 2 : 3,
      })),
      5: semesterNames[5].map((courseName, index) => ({
        code: `${code}5${String(index + 1).padStart(2, '0')}`,
        name: courseName,
        credits: index === 4 ? 2 : 3,
      })),
      7: semesterNames[7].map((courseName, index) => ({
        code: `${code}7${String(index + 1).padStart(2, '0')}`,
        name: courseName,
        credits: index === 4 ? 4 : 3,
      })),
    },
  };
}

const DEPARTMENTS: DepartmentSeed[] = [
  buildDepartment(
    'DS',
    'Data Science',
    'DS Timetable',
    'Applied analytics, statistical learning, and intelligent systems.',
    ['Machine Learning', 'Data Engineering', 'Applied Statistics'],
    {
      3: [
        'Data Structures',
        'Probability & Statistics',
        'Database Systems',
        'Data Visualization',
        'Python for Analytics',
      ],
      5: [
        'Machine Learning',
        'Data Mining',
        'Big Data Systems',
        'Optimization Techniques',
        'ML Laboratory',
      ],
      7: [
        'Deep Learning',
        'MLOps & Deployment',
        'Business Analytics',
        'Data Products Lab',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'META',
    'Metallurgical Engineering',
    'META Timetable',
    'Materials processing, extractive metallurgy, and industrial characterization.',
    [
      'Physical Metallurgy',
      'Extractive Metallurgy',
      'Materials Characterization',
    ],
    {
      3: [
        'Thermodynamics of Materials',
        'Engineering Metallurgy',
        'Material Science',
        'Manufacturing Processes',
        'Metallography Lab',
      ],
      5: [
        'Iron & Steel Making',
        'Mechanical Behaviour of Materials',
        'Foundry Technology',
        'Heat Treatment',
        'Materials Testing Lab',
      ],
      7: [
        'Welding Technology',
        'Corrosion Engineering',
        'Powder Metallurgy',
        'Industrial Metallurgy Lab',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'EE',
    'Electrical Engineering',
    'EE Timetable',
    'Power systems, machines, control, and energy infrastructure.',
    ['Power Systems', 'Electrical Machines', 'Control Systems'],
    {
      3: [
        'Circuit Theory',
        'Electrical Machines I',
        'Signals & Systems',
        'Network Analysis',
        'Electrical Lab',
      ],
      5: [
        'Power Systems I',
        'Control Systems',
        'Power Electronics',
        'Measurements & Instrumentation',
        'Machines Lab',
      ],
      7: [
        'Power System Protection',
        'Renewable Energy Systems',
        'Electric Drives',
        'High Voltage Engineering',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'MECH',
    'Mechanical Engineering',
    'MECH Timetable',
    'Design, thermal systems, manufacturing, and machine intelligence.',
    ['Thermal Engineering', 'Machine Design', 'Manufacturing'],
    {
      3: [
        'Engineering Mechanics',
        'Thermodynamics',
        'Strength of Materials',
        'Manufacturing Science',
        'Workshop Lab',
      ],
      5: [
        'Machine Design',
        'Fluid Mechanics',
        'Heat Transfer',
        'Production Engineering',
        'Thermal Lab',
      ],
      7: [
        'IC Engines',
        'CAD/CAM',
        'Refrigeration & Air Conditioning',
        'Industrial Engineering',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'CIVIL',
    'Civil Engineering',
    'CIVIL Timetable',
    'Infrastructure, structures, transportation, and environmental systems.',
    ['Structural Engineering', 'Transportation', 'Environmental Engineering'],
    {
      3: [
        'Surveying',
        'Mechanics of Solids',
        'Building Materials',
        'Fluid Mechanics',
        'Civil Drafting Lab',
      ],
      5: [
        'Structural Analysis',
        'Geotechnical Engineering',
        'Transportation Engineering',
        'Concrete Technology',
        'Survey Lab',
      ],
      7: [
        'Design of RCC Structures',
        'Environmental Engineering',
        'Construction Planning',
        'Water Resources Engineering',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'PROD',
    'Production Engineering',
    'PROD Timetable',
    'Industrial operations, production systems, and quality engineering.',
    ['Operations Management', 'Manufacturing Systems', 'Quality Engineering'],
    {
      3: [
        'Engineering Materials',
        'Manufacturing Processes',
        'Machine Tools',
        'Engineering Metrology',
        'Production Lab',
      ],
      5: [
        'Production Planning & Control',
        'Operations Research',
        'Tool Design',
        'Industrial Engineering',
        'Metrology Lab',
      ],
      7: [
        'Quality Control',
        'Supply Chain Systems',
        'Automation in Manufacturing',
        'Plant Layout & Safety',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'MNC',
    'Mathematics & Computing',
    'M & C Timetable',
    'Mathematical foundations, algorithms, systems, and computational modeling.',
    ['Algorithms', 'Computational Mathematics', 'Scientific Computing'],
    {
      3: [
        'Discrete Mathematics',
        'Data Structures',
        'Linear Algebra',
        'Object Oriented Programming',
        'Programming Lab',
      ],
      5: [
        'Design & Analysis of Algorithms',
        'Numerical Methods',
        'Database Systems',
        'Operating Systems',
        'Scientific Computing Lab',
      ],
      7: [
        'Machine Learning Foundations',
        'Cryptography',
        'Distributed Systems',
        'Optimization Models',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'AERO',
    'Aerospace Engineering',
    'AERO Timetable',
    'Aerodynamics, structures, propulsion, and flight systems.',
    ['Aerodynamics', 'Propulsion', 'Flight Mechanics'],
    {
      3: [
        'Aircraft Structures I',
        'Fluid Mechanics',
        'Thermodynamics',
        'Engineering Drawing',
        'Mechanics Lab',
      ],
      5: [
        'Aerodynamics I',
        'Aircraft Propulsion',
        'Materials for Aerospace',
        'Flight Mechanics',
        'Aero Lab',
      ],
      7: [
        'Aircraft Design',
        'Avionics Basics',
        'Space Mechanics',
        'Computational Aerodynamics',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'VLSI',
    'VLSI Design',
    'VLSI Timetable',
    'Semiconductor devices, chip design, verification, and fabrication workflows.',
    ['Digital VLSI', 'Analog Design', 'Verification'],
    {
      3: [
        'Circuit Theory',
        'Semiconductor Devices',
        'Digital Electronics',
        'Network Analysis',
        'Devices Lab',
      ],
      5: [
        'Digital VLSI Design',
        'CMOS Circuits',
        'HDL & FPGA Lab',
        'Analog Electronics',
        'VLSI CAD Tools',
      ],
      7: [
        'Physical Design Automation',
        'ASIC Verification',
        'Memory Design',
        'Mixed Signal Systems',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'AI',
    'Artificial Intelligence',
    'AI Timetable',
    'AI systems, intelligent agents, data platforms, and modern model deployment.',
    ['Machine Learning', 'Intelligent Systems', 'AI Infrastructure'],
    {
      3: [
        'Linear Algebra for AI',
        'Data Structures',
        'Probability Models',
        'Python for AI',
        'AI Foundations Lab',
      ],
      5: [
        'Machine Learning',
        'Knowledge Representation',
        'Database Systems',
        'Optimization for AI',
        'ML Laboratory',
      ],
      7: [
        'Deep Learning',
        'Natural Language Processing',
        'Computer Vision',
        'AI Deployment Systems',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'ECE',
    'Electronics & Communication Engineering',
    'ECE Timetable',
    'Electronics, communication, embedded systems, and signal processing.',
    ['Communication Systems', 'Embedded Systems', 'Signal Processing'],
    {
      3: [
        'Network Theory',
        'Electronic Devices',
        'Digital Logic Design',
        'Signals & Systems',
        'Electronics Lab',
      ],
      5: [
        'Analog Circuits',
        'Communication Systems',
        'Microprocessors',
        'Electromagnetic Waves',
        'Embedded Lab',
      ],
      7: [
        'Digital Signal Processing',
        'Wireless Communication',
        'Embedded System Design',
        'Microwave Engineering',
        'Capstone Project',
      ],
    },
  ),
  buildDepartment(
    'CSE',
    'Computer Science & Engineering',
    'CSE Timetable',
    'Core computing, software engineering, systems, and advanced computing.',
    ['Software Engineering', 'Systems', 'Data & Intelligence'],
    {
      3: [
        'Data Structures',
        'Discrete Mathematics',
        'Digital Logic',
        'Object Oriented Programming',
        'DSA Lab',
      ],
      5: [
        'Operating Systems',
        'Database Management Systems',
        'Computer Networks',
        'Software Engineering',
        'Systems Lab',
      ],
      7: [
        'Compiler Design',
        'Distributed Systems',
        'Information Security',
        'Cloud Computing',
        'Capstone Project',
      ],
    },
  ),
];

function sample<T>(items: T[], index: number): T {
  return items[index % items.length];
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function batchForSemester(semester: number) {
  switch (semester) {
    case 1:
      return '2026-2030';
    case 3:
      return '2025-2029';
    case 5:
      return '2024-2028';
    case 7:
      return '2023-2027';
    default:
      return '2026-2030';
  }
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function rotate<T>(items: readonly T[], offset: number): T[] {
  if (items.length === 0) return [];
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

function sessionsForCredits(credits: number) {
  return credits >= 4 ? 4 : 3;
}

function buildDailyTargets(totalSessions: number, seed: string) {
  const orderedDays = rotate(TIMETABLE_DAYS, hashString(seed) % TIMETABLE_DAYS.length);
  const targets: Record<string, number> = Object.fromEntries(
    TIMETABLE_DAYS.map((day) => [day, 0]),
  );

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
  }

  return targets;
}

function createExpandedCourseSessions(courses: CourseSeed[], seed: string) {
  const orderedCourses = [...courses].sort((left, right) => {
    const delta = sessionsForCredits(right.credits) - sessionsForCredits(left.credits);
    if (delta !== 0) return delta;
    return left.code.localeCompare(right.code);
  });

  const maxSessions = Math.max(...orderedCourses.map((course) => sessionsForCredits(course.credits)));
  const expanded: Array<{ course: CourseSeed; ordinal: number }> = [];

  for (let ordinal = 0; ordinal < maxSessions; ordinal += 1) {
    const courseOrder = rotate(
      orderedCourses,
      hashString(`${seed}:${ordinal}`) % Math.max(orderedCourses.length, 1),
    );

    for (const course of courseOrder) {
      if (ordinal < sessionsForCredits(course.credits)) {
        expanded.push({ course, ordinal });
      }
    }
  }

  return expanded;
}

async function clearDatabase() {
  const prismaAny = prisma as any;
  await prisma.auditLog.deleteMany();
  await prismaAny.backgroundJob.deleteMany();
  await prismaAny.featureFlag.deleteMany();
  await prisma.bookBorrow.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.message.deleteMany();
  await prisma.userChatRoom.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.timetable.deleteMany();
  await prisma.course.deleteMany();
  await prisma.job.deleteMany();
  await prisma.book.deleteMany();
  await prisma.room.deleteMany();
  await prismaAny.department.deleteMany();
  await (prisma as any).feeRecord.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
}

async function ensureRole(name: string) {
  return prisma.role.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function createUserWithRole(params: {
  email: string;
  name: string;
  role: string;
  password: string;
  githubUsername?: string | null;
  linkedinUsername?: string | null;
  isPublicProfile?: boolean;
}) {
  const role = await ensureRole(params.role);

  return prisma.user.create({
    data: {
      email: params.email,
      name: params.name,
      password: params.password,
      role: params.role,
      githubUsername: params.githubUsername ?? null,
      linkedinUsername: params.linkedinUsername ?? null,
      isPublicProfile: params.isPublicProfile ?? true,
      profileComplete: true,
      emailVerified: true,
      emailVerifiedAt: daysAgo(90),
      passwordChangedAt: daysAgo(30),
      roles: {
        create: {
          roleId: role.id,
        },
      },
    },
  });
}

async function seedDepartments() {
  const prismaAny = prisma as any;
  for (const department of DEPARTMENTS) {
    await prismaAny.department.create({
      data: {
        code: department.code,
        name: department.name,
        description: department.description,
        status: 'active',
        timetableLabel: department.timetableLabel,
      },
    });
  }
}

async function seedUsers(passwordHash: string) {
  const admin = await createUserWithRole({
    email: 'admin@pec.edu',
    name: 'PEC College Admin',
    role: 'college_admin',
    password: passwordHash,
  });

  await createUserWithRole({
    email: 'ops.admin@pec.edu',
    name: 'Operations Admin',
    role: 'admin',
    password: passwordHash,
  });

  await createUserWithRole({
    email: 'moderator@pec.edu',
    name: 'Platform Moderator',
    role: 'moderator',
    password: passwordHash,
  });

  await createUserWithRole({
    email: 'guest.user@pec.edu',
    name: 'Generic Campus User',
    role: 'user',
    password: passwordHash,
  });

  const faculties: FacultySeed[] = [];
  const students: StudentSeed[] = [];

  for (let deptIndex = 0; deptIndex < DEPARTMENTS.length; deptIndex += 1) {
    const department = DEPARTMENTS[deptIndex];

    for (let facultyIndex = 0; facultyIndex < 3; facultyIndex += 1) {
      const fullName = `${FACULTY_PREFIXES[facultyIndex]} ${sample(FACULTY_FIRST_NAMES, deptIndex + facultyIndex)} ${sample(FACULTY_LAST_NAMES, facultyIndex + deptIndex * 2)}`;
      const email =
        department.code === 'DS' && facultyIndex === 0
          ? 'faculty@pec.edu'
          : `${department.code.toLowerCase()}.faculty${facultyIndex + 1}@pec.edu`;

      const user = await createUserWithRole({
        email,
        name: fullName,
        role: 'faculty',
        password: passwordHash,
        githubUsername:
          facultyIndex % 2 === 0
            ? `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${sample(SOCIAL_SUFFIXES, facultyIndex + deptIndex)}`
            : null,
        linkedinUsername: `${department.code.toLowerCase()}-${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        isPublicProfile: facultyIndex !== 2,
      });

      await prisma.facultyProfile.create({
        data: {
          userId: user.id,
          employeeId: `FAC-${department.code}-${String(facultyIndex + 1).padStart(3, '0')}`,
          department: department.name,
          designation:
            facultyIndex === 0
              ? 'Professor & HOD'
              : facultyIndex === 1
                ? 'Associate Professor'
                : 'Assistant Professor',
          phone: encryptField(
            `+91-98${String(deptIndex + 11).padStart(2, '0')}${String(facultyIndex + 1).padStart(6, '0')}`,
          ),
          specialization: department.specializations[facultyIndex],
          qualifications: facultyIndex === 0 ? 'PhD' : 'M.Tech, PhD',
          bio: encryptField(
            `${department.timetableLabel} coordinator focused on ${department.specializations[facultyIndex]}.`,
          ),
        },
      });

      faculties.push({
        id: user.id,
        name: fullName,
        departmentCode: department.code,
        departmentName: department.name,
      });

      if (facultyIndex === 0) {
        await (prisma as any).department.update({
          where: { code: department.code },
          data: { hod: fullName },
        });
      }
    }

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
        password: passwordHash,
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
          enrollmentNumber: `PEC${batch.slice(0, 4)}${department.code}${String(studentIndex + 1).padStart(3, '0')}`,
          department: department.name,
          semester,
          phone: encryptField(
            `+91-97${String(deptIndex + 10).padStart(2, '0')}${String(studentIndex + 1).padStart(6, '0')}`,
          ),
          dob: new Date(
            2004,
            (studentIndex + deptIndex) % 12,
            10 + (studentIndex % 18),
          ),
          address: encryptField(
            `Hostel Block ${((deptIndex + studentIndex) % 8) + 1}, PEC Campus`,
          ),
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

  console.log(
    `Created ${faculties.length} faculty and ${students.length} students`,
  );

  return { admin, faculties, students };
}

async function seedCourses(faculties: FacultySeed[]) {
  const courses: CourseSeed[] = [];

  for (const department of DEPARTMENTS) {
    const facultyPool = faculties.filter(
      (faculty) => faculty.departmentCode === department.code,
    );

    // If no faculty pool, skip
    if (facultyPool.length === 0) continue;

    for (const semester of ACTIVE_SEMESTERS) {
      const catalog = department.semesterCatalog[semester] || [];

      // Create base courses from catalog
      for (
        let courseIndex = 0;
        courseIndex < catalog.length;
        courseIndex += 1
      ) {
        const faculty = facultyPool[courseIndex % facultyPool.length];
        const courseData = catalog[courseIndex];
        const created = await prisma.course.create({
          data: {
            code: courseData.code,
            name: courseData.name,
            credits: courseData.credits,
            instructor: faculty.name,
            department: department.name,
            semester,
            status: 'active',
          },
        });

        courses.push({
          id: created.id,
          code: created.code,
          name: created.name,
          credits: created.credits,
          departmentCode: department.code,
          departmentName: department.name,
          semester,
          facultyId: faculty.id,
          facultyName: faculty.name,
        });
      }

      // Add extra courses to ensure 3-5 sessions per day (multiply base courses)
      // Target: 7-10 courses per semester per department to fill timetable
      const baseCount = Math.max(catalog.length, 1);
      const targetCount = 8; // aim for 8-10 courses per semester
      const additionalNeeded = Math.max(0, targetCount - baseCount);

      for (let extra = 0; extra < additionalNeeded; extra++) {
        const faculty = facultyPool[extra % facultyPool.length];
        const baseData = catalog[extra % Math.max(catalog.length, 1)] || { code: 'ELEC', name: 'Elective', credits: 3 };
        const courseCode = `${baseData.code}-${extra + 1}`;
        const courseName = `${baseData.name} (Section ${extra + 1})`;
        const created = await prisma.course.create({
          data: {
            code: courseCode,
            name: courseName,
            credits: baseData.credits,
            instructor: faculty.name,
            department: department.name,
            semester,
            status: 'active',
          },
        });

        courses.push({
          id: created.id,
          code: created.code,
          name: created.name,
          credits: created.credits,
          departmentCode: department.code,
          departmentName: department.name,
          semester,
          facultyId: faculty.id,
          facultyName: faculty.name,
        });
      }
    }
  }

  console.log(
    `Created ${courses.length} courses across ${DEPARTMENTS.length} departments`,
  );

  return courses;
}

async function seedEnrollmentsAssignmentsAttendance(
  students: StudentSeed[],
  courses: CourseSeed[],
) {
  let enrollmentCount = 0;
  let assignmentCount = 0;
  let attendanceCount = 0;

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
      enrollmentCount += 1;

      for (let sessionIndex = 0; sessionIndex < 10; sessionIndex += 1) {
        await prisma.attendance.create({
          data: {
            date: daysAgo(sessionIndex + 1),
            status:
              sessionIndex % 7 === 0
                ? 'late'
                : sessionIndex % 9 === 0
                  ? 'absent'
                  : 'present',
            subject: course.code,
            studentId: student.id,
          },
        });
        attendanceCount += 1;
      }
    }
  }

  for (const course of courses) {
    await prisma.assignment.createMany({
      data: [
        {
          title: `${course.code} Tutorial Set`,
          description: `Weekly problem set for ${course.name}`,
          dueDate: daysFromNow(7),
          courseId: course.id,
        },
        {
          title: `${course.code} Mid-Sem Project`,
          description: `Departmental assessment for ${course.name}`,
          dueDate: daysFromNow(18),
          courseId: course.id,
        },
      ],
    });
    assignmentCount += 2;
  }

  console.log(`Created ${enrollmentCount} enrollments`);
  console.log(`Created ${assignmentCount} assignments`);
  console.log(`Created ${attendanceCount} attendance records`);
}

async function seedFeeRecords(students: StudentSeed[]) {
  const categories = ['tuition', 'hostel', 'exam', 'library', 'other'] as const;
  const descriptions: Record<(typeof categories)[number], string[]> = {
    tuition: ['Semester Tuition Fee', 'Lab & Tuition Composite Fee'],
    hostel: ['Hostel Accommodation Fee', 'Hostel Maintenance Charge'],
    exam: ['Examination Registration Fee', 'Revaluation & Exam Services Fee'],
    library: ['Library Subscription Fee', 'Library Digital Access Fee'],
    other: ['Student Activity Fee', 'Campus Development Fee'],
  };

  let feeRecordCount = 0;

  for (const student of students) {
    const recordsPerStudent = 2 + (hashString(student.id) % 3);

    for (let idx = 0; idx < recordsPerStudent; idx += 1) {
      const category = categories[(hashString(`${student.id}-${idx}`) + idx) % categories.length];
      const amountBase =
        category === 'tuition'
          ? 42000
          : category === 'hostel'
            ? 18500
            : category === 'exam'
              ? 3500
              : category === 'library'
                ? 1200
                : 2800;
      const variance = (hashString(`${student.id}-${category}-${idx}`) % 6500) - 1800;
      const amount = Math.max(750, amountBase + variance);

      const statusRoll = hashString(`${student.id}-${idx}-status`) % 100;
      const status =
        statusRoll < 58
          ? 'paid'
          : statusRoll < 83
            ? 'pending'
            : statusRoll < 93
              ? 'pending_verification'
              : 'overdue';

      const dueDate = daysAgo(35 - (hashString(`${student.id}-${idx}-due`) % 70));
      const paidDate = status === 'paid' ? daysAgo(hashString(`${student.id}-${idx}-paid`) % 40) : null;
      const transactionPrefix = `${student.departmentCode}${student.semester}${idx}`;

      await (prisma as any).feeRecord.create({
        data: {
          studentId: student.id,
          amount,
          description:
            descriptions[category][
              hashString(`${student.id}-${category}-${idx}`) % descriptions[category].length
            ],
          dueDate,
          category,
          status,
          paidDate,
          pendingTransactionId:
            status === 'pending' || status === 'pending_verification'
              ? `PEND-${transactionPrefix}-${String(hashString(`${student.id}-${idx}-pend`) % 100000).padStart(5, '0')}`
              : null,
          paymentTransactionId:
            status === 'paid'
              ? `TXN-${transactionPrefix}-${String(hashString(`${student.id}-${idx}-txn`) % 1000000).padStart(6, '0')}`
              : null,
          lastPaymentAttempt:
            status === 'pending' || status === 'pending_verification'
              ? daysAgo(hashString(`${student.id}-${idx}-attempt`) % 5)
              : null,
          verificationSubmittedAt:
            status === 'pending_verification'
              ? daysAgo(hashString(`${student.id}-${idx}-verify`) % 3)
              : null,
        },
      });

      feeRecordCount += 1;
    }
  }

  console.log(`Created ${feeRecordCount} fee records`);
}

async function seedTimetable(courses: CourseSeed[]) {
  let timetableCount = 0;
  const occupiedRooms = new Map<string, Set<string>>();
  const occupiedFaculty = new Set<string>();

  for (const department of DEPARTMENTS) {
    for (const semester of ACTIVE_SEMESTERS) {
      const semesterCourses = courses.filter(
        (course) =>
          course.departmentCode === department.code &&
          course.semester === semester,
      );

      const seed = `${department.code}-${semester}`;
      const dayTargets = buildDailyTargets(
        semesterCourses.reduce((sum, course) => sum + sessionsForCredits(course.credits), 0),
        seed,
      );
      const dayCounts: Record<string, number> = Object.fromEntries(
        TIMETABLE_DAYS.map((day) => [day, 0]),
      );
      const groupSlotUsage = new Set<string>();
      const courseDayUsage = new Map<string, Set<string>>();
      const pending = createExpandedCourseSessions(semesterCourses, seed);
      const orderedDays = rotate(TIMETABLE_DAYS, hashString(seed) % TIMETABLE_DAYS.length);

      const trySchedule = async (
        session: { course: CourseSeed; ordinal: number },
        allowRepeatCourseDay: boolean,
      ) => {
        for (const day of orderedDays) {
          if (dayCounts[day] >= 5) continue;
          if (!allowRepeatCourseDay && dayCounts[day] >= dayTargets[day]) continue;

          const courseDays = courseDayUsage.get(session.course.id) ?? new Set<string>();
          if (!allowRepeatCourseDay && courseDays.has(day)) continue;

          const slotPairs = rotate(
            TIMETABLE_TIME_SLOTS,
            hashString(`${seed}:${day}:${session.course.code}:${session.ordinal}`) %
              TIMETABLE_TIME_SLOTS.length,
          );
          const roomOrder = rotate(
            TIMETABLE_ROOMS,
            hashString(`${seed}:${day}:${session.course.code}`) % TIMETABLE_ROOMS.length,
          );

          for (const [startTime, endTime] of slotPairs) {
            const slotKey = `${day}-${startTime}-${endTime}`;
            if (groupSlotUsage.has(slotKey)) continue;

            const facultyKey = `${session.course.facultyId}@@${slotKey}`;
            if (occupiedFaculty.has(facultyKey)) continue;

            const roomsBusy = occupiedRooms.get(slotKey) ?? new Set<string>();
            const room = roomOrder.find((candidate) => !roomsBusy.has(candidate));
            if (!room) continue;

            await prisma.timetable.create({
              data: {
                courseId: session.course.id,
                courseName: session.course.name,
                courseCode: session.course.code,
                facultyId: session.course.facultyId,
                facultyName: session.course.facultyName,
                day,
                startTime,
                endTime,
                room,
                department: department.name,
                semester,
                batch: batchForSemester(semester),
              },
            });

            roomsBusy.add(room);
            occupiedRooms.set(slotKey, roomsBusy);
            occupiedFaculty.add(facultyKey);
            groupSlotUsage.add(slotKey);
            courseDays.add(day);
            courseDayUsage.set(session.course.id, courseDays);
            dayCounts[day] += 1;
            timetableCount += 1;
            return true;
          }
        }

        return false;
      };

      for (let index = 0; index < pending.length; ) {
        const scheduled = await trySchedule(pending[index], false);
        if (scheduled) {
          pending.splice(index, 1);
        } else {
          index += 1;
        }
      }

      for (const session of pending) {
        await trySchedule(session, true);
      }
    }
  }

  console.log(`Created ${timetableCount} timetable entries`);
}

function totalToLetterGrade(total: number) {
  if (total >= 90) return 'A+';
  if (total >= 80) return 'A';
  if (total >= 70) return 'B+';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 40) return 'D';
  return 'F';
}

async function seedExamSchedulesAndGrades(
  students: StudentSeed[],
  courses: CourseSeed[],
) {
  let scheduleCount = 0;
  let gradeCount = 0;

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
    scheduleCount += 2;
  }

  for (const student of students) {
    const eligibleCourses = courses.filter(
      (course) =>
        course.departmentCode === student.departmentCode &&
        course.semester <= student.semester,
    );

    for (let index = 0; index < eligibleCourses.length; index += 1) {
      const course = eligibleCourses[index];
      const base = 58 + ((index * 7 + student.semester * 3) % 34);
      const midterm = Math.min(50, Math.max(18, Math.round(base * 0.46)));
      const final = Math.min(50, Math.max(22, Math.round(base * 0.54)));
      const total = Math.min(100, midterm + final);

      await prisma.grade.upsert({
        where: {
          studentId_courseId: {
            studentId: student.id,
            courseId: course.id,
          },
        },
        update: {
          midterm,
          final,
          total,
          grade: totalToLetterGrade(total),
          credits: course.credits,
          remarks: total >= 75 ? 'Consistent performance' : 'Keep improving',
        },
        create: {
          studentId: student.id,
          courseId: course.id,
          midterm,
          final,
          total,
          grade: totalToLetterGrade(total),
          credits: course.credits,
          remarks: total >= 75 ? 'Consistent performance' : 'Keep improving',
        },
      });
      gradeCount += 1;
    }
  }

  console.log(`Created ${scheduleCount} exam schedules`);
  console.log(`Created ${gradeCount} grade records`);
}

async function seedLibraryAndRooms(students: StudentSeed[]) {
  const books: Array<{ id: string }> = [];

  for (
    let departmentIndex = 0;
    departmentIndex < DEPARTMENTS.length;
    departmentIndex += 1
  ) {
    const department = DEPARTMENTS[departmentIndex];

    for (let bookIndex = 0; bookIndex < 4; bookIndex += 1) {
      const created = await prisma.book.create({
        data: {
          title: `${department.code} Reference Volume ${bookIndex + 1}`,
          author: `${sample(FACULTY_FIRST_NAMES, departmentIndex + bookIndex)} ${sample(FACULTY_LAST_NAMES, bookIndex + departmentIndex)}`,
          isbn: `97810${String(departmentIndex * 10 + bookIndex).padStart(3, '0')}2026`,
          category: department.name,
          totalCopies: 10,
          availableCopies: 7,
          location: `Central Library - ${department.code} Shelf ${bookIndex + 1}`,
          publisher: 'PEC Academic Press',
          year: 2019 + ((departmentIndex + bookIndex) % 5),
        },
      });
      books.push({ id: created.id });
    }

    for (let roomIndex = 0; roomIndex < 3; roomIndex += 1) {
      await prisma.room.create({
        data: {
          name: `${department.code}-${roomIndex === 2 ? 'LAB' : `CR${roomIndex + 1}`}`,
          type: roomIndex === 2 ? 'laboratory' : 'classroom',
          capacity: roomIndex === 2 ? 40 : 70,
          building: `${department.code} Block`,
          floor: (roomIndex % 3) + 1,
          facilities: ROOM_FEATURES[roomIndex],
          isAvailable: true,
        },
      });
    }
  }

  let borrowCount = 0;
  for (let index = 0; index < students.length; index += 1) {
    const student = students[index];
    const book = books[index % books.length];
    await prisma.bookBorrow.create({
      data: {
        userId: student.id,
        bookId: book.id,
        dueDate: daysFromNow(10 + (index % 7)),
        status: index % 9 === 0 ? 'overdue' : 'borrowed',
        fine: index % 9 === 0 ? 25 : 0,
      },
    });
    borrowCount += 1;
  }

  console.log(
    `Created ${books.length} books, ${DEPARTMENTS.length * 3} rooms, and ${borrowCount} borrows`,
  );
}

async function seedJobs() {
  const jobs = [];

  for (let index = 0; index < 24; index += 1) {
    const department = DEPARTMENTS[index % DEPARTMENTS.length];
    jobs.push({
      title: `${department.code} Graduate Engineer ${index % 2 === 0 ? 'Intern' : 'Associate'}`,
      company: JOB_COMPANIES[index % JOB_COMPANIES.length],
      location:
        index % 3 === 0 ? 'Bangalore' : index % 3 === 1 ? 'Hyderabad' : 'Pune',
      type: index % 4 === 0 ? 'Internship' : 'Full-time',
      salary: index % 4 === 0 ? '45k/month' : `${8 + (index % 7)} LPA`,
      deadline: daysFromNow(15 + index),
      matchScore: 68 + (index % 25),
    });
  }

  await prisma.job.createMany({ data: jobs });
  console.log(`Created ${jobs.length} jobs`);
}

async function seedChatAndActivity(
  adminId: string,
  faculties: FacultySeed[],
  students: StudentSeed[],
  courses: CourseSeed[],
) {
  const allUsers = [
    adminId,
    ...faculties.map((item) => item.id),
    ...students.map((item) => item.id),
  ];
  const globalRoom = await prisma.chatRoom.create({
    data: { name: 'PEC Global Announcements', isGroup: true },
  });

  for (const userId of allUsers) {
    await prisma.userChatRoom.create({
      data: {
        userId,
        chatRoomId: globalRoom.id,
      },
    });
  }

  let roomCount = 1;
  let messageCount = 0;

  for (const department of DEPARTMENTS) {
    const departmentRoom = await prisma.chatRoom.create({
      data: { name: department.timetableLabel, isGroup: true },
    });
    roomCount += 1;

    const departmentFaculty = faculties.filter(
      (faculty) => faculty.departmentCode === department.code,
    );
    const departmentStudents = students.filter(
      (student) => student.departmentCode === department.code,
    );

    for (const userId of [
      ...departmentFaculty.map((item) => item.id),
      ...departmentStudents.map((item) => item.id),
    ]) {
      await prisma.userChatRoom.create({
        data: {
          userId,
          chatRoomId: departmentRoom.id,
        },
      });
    }

    const senders = [
      ...departmentFaculty.map((item) => item.id),
      ...departmentStudents.slice(0, 4).map((item) => item.id),
    ];

    for (let messageIndex = 0; messageIndex < 8; messageIndex += 1) {
      await prisma.message.create({
        data: {
          chatRoomId: departmentRoom.id,
          senderId: senders[messageIndex % senders.length],
          content:
            messageIndex % 2 === 0
              ? `${department.code} timetable updated for semester ${ACTIVE_SEMESTERS[messageIndex % ACTIVE_SEMESTERS.length]}.`
              : `${department.code} reminder: assignment checkpoints are live on the dashboard.`,
        },
      });
      messageCount += 1;
    }
  }

  await (prisma as any).featureFlag.createMany({
    data: [
      {
        key: 'timetable.auto_generation',
        description: 'Enable automated timetable generation for departments.',
        enabled: true,
        payload: JSON.stringify({ activeSemesters: ACTIVE_SEMESTERS }),
      },
      {
        key: 'placements.student_readiness',
        description: 'Enable placement readiness dashboard widgets.',
        enabled: true,
      },
      {
        key: 'departments.dynamic_listing',
        description: 'Serve live departments from Postgres-backed API.',
        enabled: true,
      },
    ],
  });

  await (prisma as any).backgroundJob.createMany({
    data: [
      {
        type: 'audit-log-prune',
        status: 'pending',
        payload: JSON.stringify({ retainDays: 180 }),
        runAt: daysFromNow(1),
        availableAt: daysFromNow(1),
        dedupeKey: 'audit-log-prune-default',
      },
      {
        type: 'timetable-sync',
        status: 'pending',
        payload: JSON.stringify({
          departments: DEPARTMENTS.map((item) => item.code),
        }),
        runAt: daysFromNow(1),
        availableAt: daysFromNow(1),
        dedupeKey: 'timetable-sync-campus',
      },
    ],
  });

  const auditEntries = courses.slice(0, 30).map((course, index) => ({
    actorUserId:
      index % 2 === 0 ? adminId : faculties[index % faculties.length].id,
    actorRole: index % 2 === 0 ? 'college_admin' : 'faculty',
    action: index % 3 === 0 ? 'create' : 'update',
    entity: index % 2 === 0 ? 'course' : 'timetable',
    entityId: course.id,
    method: index % 2 === 0 ? 'POST' : 'PATCH',
    path: index % 2 === 0 ? '/courses' : `/timetable/${course.id}`,
    ip: `10.0.0.${10 + index}`,
    statusCode: 200,
    metadata: JSON.stringify({
      courseCode: course.code,
      department: course.departmentName,
    }),
    createdAt: daysAgo(index),
  }));

  await prisma.auditLog.createMany({ data: auditEntries });

  console.log(
    `Created ${roomCount} chat rooms, ${messageCount} messages, feature flags, background jobs, and audit activity`,
  );
}

async function main() {
  console.log('Starting PEC campus seed...');

  await clearDatabase();
  await seedDepartments();

  const passwordHash = await bcrypt.hash('password123', 12);
  const { admin, faculties, students } = await seedUsers(passwordHash);
  const courses = await seedCourses(faculties);

  await seedEnrollmentsAssignmentsAttendance(students, courses);
  await seedFeeRecords(students);
  await seedTimetable(courses);
  await seedExamSchedulesAndGrades(students, courses);
  await seedLibraryAndRooms(students);
  await seedJobs();
  await seedChatAndActivity(admin.id, faculties, students, courses);

  console.log('');
  console.log('Seed completed successfully.');
  console.log(`Departments: ${DEPARTMENTS.length}`);
  console.log(`Faculty: ${faculties.length}`);
  console.log(`Students: ${students.length}`);
  console.log(`Courses: ${courses.length}`);
  console.log(`Active semesters: ${ACTIVE_SEMESTERS.join(', ')}`);
  console.log('');
  console.log('Demo credentials:');
  console.log('Student      student@pec.edu / password123');
  console.log('Faculty      faculty@pec.edu / password123');
  console.log('CollegeAdmin admin@pec.edu / password123');
  console.log('Admin        ops.admin@pec.edu / password123');
  console.log('Moderator    moderator@pec.edu / password123');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
