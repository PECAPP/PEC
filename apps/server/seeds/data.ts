export type DepartmentSeed = {
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

export type FacultySeed = {
  id: string;
  name: string;
  departmentCode: string;
  departmentName: string;
};

export type StudentSeed = {
  id: string;
  name: string;
  departmentCode: string;
  departmentName: string;
  semester: number;
  batch?: string;
};

export type CourseSeed = {
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

export type CanteenItemSeed = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
};

export type HostelIssueSeed = {
  id: string;
  studentId: string;
  studentName: string;
  hostelName: string;
  roomNumber: string;
  category: string;
  description: string;
  status: string;
  priority: string;
};

export const ACTIVE_SEMESTERS = [1, 3, 5, 7];
export const TIMETABLE_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export const TIMETABLE_TIME_SLOTS = [
  ['08:00', '09:00'],
  ['09:00', '10:00'],
  ['10:00', '11:00'],
  ['11:00', '12:00'],
  ['12:00', '13:00'],
  ['14:00', '15:00'],
  ['15:00', '16:00'],
] as const;
export const TIMETABLE_ROOMS = Array.from({ length: 37 }, (_, index) => `L-${index + 1}`);

export const COMMON_SEMESTER_ONE = [
  { code: '101', name: 'Engineering Mathematics I', credits: 4 },
  { code: '102', name: 'Applied Physics', credits: 4 },
  { code: '103', name: 'Programming for Problem Solving', credits: 3 },
  { code: '104', name: 'Basic Electrical & Electronics', credits: 3 },
  { code: '105', name: 'Workshop Practice', credits: 2 },
];



export const ROOM_FEATURES = [
  JSON.stringify(['Projector', 'WiFi', 'Whiteboard']),
  JSON.stringify(['Smart Display', 'WiFi', 'AC']),
  JSON.stringify(['Projector', 'Lab Benches', 'Power Backup']),
];

export const STUDENT_FIRST_NAMES = ['Aarav', 'Ishita', 'Vivaan', 'Ananya', 'Aditya', 'Meera', 'Kunal', 'Riya', 'Kabir', 'Siya'];
export const STUDENT_LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Singh', 'Reddy', 'Iyer', 'Nair', 'Gupta', 'Das', 'Kapoor'];

export const FACULTY_PREFIXES = ['Dr.', 'Prof.', 'Dr.'];
export const FACULTY_FIRST_NAMES = ['Amit', 'Priya', 'Sandeep', 'Neha', 'Rahul', 'Smita', 'Arvind', 'Shalini', 'Vivek', 'Meenakshi'];
export const FACULTY_LAST_NAMES = ['Kumar', 'Menon', 'Bansal', 'Saxena', 'Chopra', 'Ghosh', 'Raman', 'Batra', 'Khanna', 'Mishra'];

export const SOCIAL_SUFFIXES = ['dev', 'eng', 'official', 'campus', 'acad', 'labs'];

export const SEMESTER_DISTRIBUTION = [1, 1, 1, 3, 3, 3, 5, 5, 7, 7];

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

export const DEPARTMENTS: DepartmentSeed[] = [
  buildDepartment('DS', 'Data Science', 'DS Timetable', 'Applied analytics...', ['Machine Learning', 'Data Engineering', 'Applied Statistics'], {
    3: ['Data Structures', 'Probability & Statistics', 'Database Systems', 'Data Visualization', 'Python for Analytics'],
    5: ['Machine Learning', 'Data Mining', 'Big Data Systems', 'Optimization Techniques', 'ML Laboratory'],
    7: ['Deep Learning', 'MLOps & Deployment', 'Business Analytics', 'Data Products Lab', 'Capstone Project'],
  }),
  buildDepartment('META', 'Metallurgical Engineering', 'META Timetable', 'Materials processing...', ['Physical Metallurgy', 'Extractive Metallurgy', 'Materials Characterization'], {
    3: ['Thermodynamics of Materials', 'Engineering Metallurgy', 'Material Science', 'Manufacturing Processes', 'Metallography Lab'],
    5: ['Iron & Steel Making', 'Mechanical Behaviour of Materials', 'Foundry Technology', 'Heat Treatment', 'Materials Testing Lab'],
    7: ['Welding Technology', 'Corrosion Engineering', 'Powder Metallurgy', 'Industrial Metallurgy Lab', 'Capstone Project'],
  }),
  buildDepartment('EE', 'Electrical Engineering', 'EE Timetable', 'Power systems...', ['Power Systems', 'Electrical Machines', 'Control Systems'], {
    3: ['Circuit Theory', 'Electrical Machines I', 'Signals & Systems', 'Network Analysis', 'Electrical Lab'],
    5: ['Power Systems I', 'Control Systems', 'Power Electronics', 'Measurements & Instrumentation', 'Machines Lab'],
    7: ['Power System Protection', 'Renewable Energy Systems', 'Electric Drives', 'High Voltage Engineering', 'Capstone Project'],
  }),
  buildDepartment('MECH', 'Mechanical Engineering', 'MECH Timetable', 'Design, thermal...', ['Thermal Engineering', 'Machine Design', 'Manufacturing'], {
    3: ['Engineering Mechanics', 'Thermodynamics', 'Strength of Materials', 'Manufacturing Science', 'Workshop Lab'],
    5: ['Machine Design', 'Fluid Mechanics', 'Heat Transfer', 'Production Engineering', 'Thermal Lab'],
    7: ['IC Engines', 'CAD/CAM', 'Refrigeration & Air Conditioning', 'Industrial Engineering', 'Capstone Project'],
  }),
  buildDepartment('CIVIL', 'Civil Engineering', 'CIVIL Timetable', 'Infrastructure...', ['Structural Engineering', 'Transportation', 'Environmental Engineering'], {
    3: ['Surveying', 'Mechanics of Solids', 'Building Materials', 'Fluid Mechanics', 'Civil Drafting Lab'],
    5: ['Structural Analysis', 'Geotechnical Engineering', 'Transportation Engineering', 'Concrete Technology', 'Survey Lab'],
    7: ['Design of RCC Structures', 'Environmental Engineering', 'Construction Planning', 'Water Resources Engineering', 'Capstone Project'],
  }),
  buildDepartment('PROD', 'Production Engineering', 'PROD Timetable', 'Industrial operations...', ['Operations Management', 'Manufacturing Systems', 'Quality Engineering'], {
    3: ['Engineering Materials', 'Manufacturing Processes', 'Machine Tools', 'Engineering Metrology', 'Production Lab'],
    5: ['Production Planning & Control', 'Operations Research', 'Tool Design', 'Industrial Engineering', 'Metrology Lab'],
    7: ['Quality Control', 'Supply Chain Systems', 'Automation in Manufacturing', 'Plant Layout & Safety', 'Capstone Project'],
  }),
  buildDepartment('MNC', 'Mathematics & Computing', 'M & C Timetable', 'Mathematical foundations...', ['Algorithms', 'Computational Mathematics', 'Scientific Computing'], {
    3: ['Discrete Mathematics', 'Data Structures', 'Linear Algebra', 'Object Oriented Programming', 'Programming Lab'],
    5: ['Design & Analysis of Algorithms', 'Numerical Methods', 'Database Systems', 'Operating Systems', 'Scientific Computing Lab'],
    7: ['Machine Learning Foundations', 'Cryptography', 'Distributed Systems', 'Optimization Models', 'Capstone Project'],
  }),
  buildDepartment('AERO', 'Aerospace Engineering', 'AERO Timetable', 'Aerodynamics...', ['Aerodynamics', 'Propulsion', 'Flight Mechanics'], {
    3: ['Aircraft Structures I', 'Fluid Mechanics', 'Thermodynamics', 'Engineering Drawing', 'Mechanics Lab'],
    5: ['Aerodynamics I', 'Aircraft Propulsion', 'Materials for Aerospace', 'Flight Mechanics', 'Aero Lab'],
    7: ['Aircraft Design', 'Avionics Basics', 'Space Mechanics', 'Computational Aerodynamics', 'Capstone Project'],
  }),
  buildDepartment('VLSI', 'VLSI Design', 'VLSI Timetable', 'Semiconductor devices...', ['Digital VLSI', 'Analog Design', 'Verification'], {
    3: ['Circuit Theory', 'Semiconductor Devices', 'Digital Electronics', 'Network Analysis', 'Devices Lab'],
    5: ['Digital VLSI Design', 'CMOS Circuits', 'HDL & FPGA Lab', 'Analog Electronics', 'VLSI CAD Tools'],
    7: ['Physical Design Automation', 'ASIC Verification', 'Memory Design', 'Mixed Signal Systems', 'Capstone Project'],
  }),
  buildDepartment('AI', 'Artificial Intelligence', 'AI Timetable', 'AI systems...', ['Machine Learning', 'Intelligent Systems', 'AI Infrastructure'], {
    3: ['Linear Algebra for AI', 'Data Structures', 'Probability Models', 'Python for AI', 'AI Foundations Lab'],
    5: ['Machine Learning', 'Knowledge Representation', 'Database Systems', 'Optimization for AI', 'ML Laboratory'],
    7: ['Deep Learning', 'Natural Language Processing', 'Computer Vision', 'AI Deployment Systems', 'Capstone Project'],
  }),
  buildDepartment('ECE', 'Electronics & Communication Engineering', 'ECE Timetable', 'Electronics, communication...', ['Communication Systems', 'Embedded Systems', 'Signal Processing'], {
    3: ['Network Theory', 'Electronic Devices', 'Digital Logic Design', 'Signals & Systems', 'Electronics Lab'],
    5: ['Analog Circuits', 'Communication Systems', 'Microprocessors', 'Electromagnetic Waves', 'Embedded Lab'],
    7: ['Digital Signal Processing', 'Wireless Communication', 'Embedded System Design', 'Microwave Engineering', 'Capstone Project'],
  }),
  buildDepartment('CSE', 'Computer Science & Engineering', 'CSE Timetable', 'Core computing...', ['Software Engineering', 'Systems', 'Data & Intelligence'], {
    3: ['Data Structures', 'Discrete Mathematics', 'Digital Logic', 'Object Oriented Programming', 'DSA Lab'],
    5: ['Operating Systems', 'Database Management Systems', 'Computer Networks', 'Software Engineering', 'Systems Lab'],
    7: ['Compiler Design', 'Distributed Systems', 'Information Security', 'Cloud Computing', 'Capstone Project'],
  }),
];

export const CANTEEN_ITEMS = [
  { name: 'Veg Cheese Maggi', price: 60, category: 'Snacks', description: 'Classic comfort food with extra cheese', image: 'https://images.unsplash.com/photo-1594970719739-4s5b9a81723a' },
  { name: 'Schezwan Noodles', price: 80, category: 'Snacks', description: 'Spicy street-style Indo-Chinese noodles', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246' },
  { name: 'Cold Coffee with Ice Cream', price: 70, category: 'Drinks', description: 'Creamy and refreshing', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c' },
  { name: 'Paneer Butter Masala & Roti', price: 120, category: 'Meals', description: 'Hearty late night dinner', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7' },
  { name: 'Chocolate Brownie', price: 50, category: 'Desserts', description: 'Warm and gooey', image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e' },
];

export const HOSTELS = ['H1', 'H2', 'H3', 'H4', 'H5', 'GDH1', 'GDH2'];
export const HOSTEL_CATEGORIES = ['Plumbing', 'Electrical', 'Internet', 'Furniture', 'Other'];
export const ISSUE_STATUSES = ['Open', 'InProgress', 'Resolved'];
export const ISSUE_PRIORITIES = ['Low', 'Medium', 'High'];
