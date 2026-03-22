/**
 * Placement Seed Data
 * Based on PEC Chandigarh placement statistics 2024-25
 * - Highest Package: ₹61.02 LPA
 * - Average Package: ₹13.6 LPA
 * - 160+ companies, 461 offers
 */

import type { 
  PlacementProfile, 
  ExtendedJob, 
  JobApplication, 
  PlacementDrive,
  Skill,
  Project,
  Certification,
  WorkExperience 
} from '@/types';

// ============================================
// PEC-Based Realistic Company Data
// ============================================

export const pecCompanies = [
  // Top Tier (Dream Companies)
  { name: 'Google', logo: 'https://logo.clearbit.com/google.com', type: 'Product', minPackage: 45, maxPackage: 61, locations: ['Bangalore', 'Hyderabad'] },
  { name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', type: 'Product', minPackage: 35, maxPackage: 52, locations: ['Bangalore', 'Hyderabad', 'Noida'] },
  { name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com', type: 'Product', minPackage: 28, maxPackage: 45, locations: ['Bangalore', 'Hyderabad'] },
  { name: 'Adobe', logo: 'https://logo.clearbit.com/adobe.com', type: 'Product', minPackage: 25, maxPackage: 42, locations: ['Noida', 'Bangalore'] },
  { name: 'Goldman Sachs', logo: 'https://logo.clearbit.com/goldmansachs.com', type: 'Finance', minPackage: 30, maxPackage: 48, locations: ['Bangalore'] },
  { name: 'Uber', logo: 'https://logo.clearbit.com/uber.com', type: 'Product', minPackage: 28, maxPackage: 40, locations: ['Bangalore', 'Hyderabad'] },
  
  // Tier 2 (High Paying)
  { name: 'Qualcomm', logo: 'https://logo.clearbit.com/qualcomm.com', type: 'Hardware', minPackage: 18, maxPackage: 28, locations: ['Bangalore', 'Hyderabad', 'Chennai'] },
  { name: 'Texas Instruments', logo: 'https://logo.clearbit.com/ti.com', type: 'Hardware', minPackage: 16, maxPackage: 24, locations: ['Bangalore'] },
  { name: 'Arcesium', logo: 'https://logo.clearbit.com/arcesium.com', type: 'Finance', minPackage: 22, maxPackage: 32, locations: ['Hyderabad'] },
  { name: 'JP Morgan Chase', logo: 'https://logo.clearbit.com/jpmorgan.com', type: 'Finance', minPackage: 18, maxPackage: 28, locations: ['Mumbai', 'Bangalore'] },
  { name: 'American Express', logo: 'https://logo.clearbit.com/americanexpress.com', type: 'Finance', minPackage: 16, maxPackage: 24, locations: ['Gurgaon'] },
  { name: 'Cisco', logo: 'https://logo.clearbit.com/cisco.com', type: 'Networking', minPackage: 14, maxPackage: 22, locations: ['Bangalore'] },
  { name: 'Oracle', logo: 'https://logo.clearbit.com/oracle.com', type: 'Product', minPackage: 14, maxPackage: 20, locations: ['Bangalore', 'Hyderabad'] },
  { name: 'PhonePe', logo: 'https://logo.clearbit.com/phonepe.com', type: 'Fintech', minPackage: 18, maxPackage: 28, locations: ['Bangalore'] },
  { name: 'Intuit', logo: 'https://logo.clearbit.com/intuit.com', type: 'Product', minPackage: 16, maxPackage: 24, locations: ['Bangalore'] },
  { name: 'ZS Associates', logo: 'https://logo.clearbit.com/zs.com', type: 'Consulting', minPackage: 14, maxPackage: 20, locations: ['Pune', 'Gurgaon'] },
  
  // Tier 3 (Good Packages)
  { name: 'Micron Technology', logo: 'https://logo.clearbit.com/micron.com', type: 'Hardware', minPackage: 12, maxPackage: 18, locations: ['Hyderabad'] },
  { name: 'NatWest', logo: 'https://logo.clearbit.com/natwestgroup.com', type: 'Finance', minPackage: 10, maxPackage: 16, locations: ['Gurgaon', 'Chennai'] },
  { name: 'Samsung R&D', logo: 'https://logo.clearbit.com/samsung.com', type: 'Product', minPackage: 12, maxPackage: 18, locations: ['Noida', 'Bangalore'] },
  { name: 'Maruti Suzuki', logo: 'https://logo.clearbit.com/marutisuzuki.com', type: 'Automobile', minPackage: 10, maxPackage: 14, locations: ['Gurgaon'] },
  { name: 'Airbus', logo: 'https://logo.clearbit.com/airbus.com', type: 'Aerospace', minPackage: 12, maxPackage: 16, locations: ['Bangalore'] },
  { name: 'Tata Motors', logo: 'https://logo.clearbit.com/tatamotors.com', type: 'Automobile', minPackage: 9, maxPackage: 14, locations: ['Pune', 'Mumbai'] },
  
  // Mass Recruiters
  { name: 'TCS', logo: 'https://logo.clearbit.com/tcs.com', type: 'IT Services', minPackage: 4, maxPackage: 7, locations: ['Mumbai', 'Chennai', 'Pune', 'Bangalore', 'Hyderabad'] },
  { name: 'Infosys', logo: 'https://logo.clearbit.com/infosys.com', type: 'IT Services', minPackage: 4, maxPackage: 8, locations: ['Bangalore', 'Pune', 'Mysore'] },
  { name: 'Wipro', logo: 'https://logo.clearbit.com/wipro.com', type: 'IT Services', minPackage: 4, maxPackage: 6.5, locations: ['Bangalore', 'Hyderabad', 'Chennai'] },
  { name: 'Cognizant', logo: 'https://logo.clearbit.com/cognizant.com', type: 'IT Services', minPackage: 4, maxPackage: 7, locations: ['Chennai', 'Pune', 'Hyderabad'] },
  { name: 'Capgemini', logo: 'https://logo.clearbit.com/capgemini.com', type: 'IT Services', minPackage: 4.5, maxPackage: 7.5, locations: ['Mumbai', 'Pune', 'Bangalore'] },
  { name: 'Tech Mahindra', logo: 'https://logo.clearbit.com/techmahindra.com', type: 'IT Services', minPackage: 4, maxPackage: 6, locations: ['Pune', 'Hyderabad', 'Chennai'] },
  { name: 'HCL Technologies', logo: 'https://logo.clearbit.com/hcltech.com', type: 'IT Services', minPackage: 4.5, maxPackage: 7, locations: ['Noida', 'Chennai', 'Bangalore'] },
];

// ============================================
// Realistic Skills by Department
// ============================================

export const skillsByDepartment: Record<string, Skill[]> = {
  'Computer Science': [
    { name: 'React', proficiency: 'advanced' },
    { name: 'Python', proficiency: 'advanced' },
    { name: 'JavaScript', proficiency: 'advanced' },
    { name: 'TypeScript', proficiency: 'intermediate' },
    { name: 'Node.js', proficiency: 'intermediate' },
    { name: 'Java', proficiency: 'intermediate' },
    { name: 'C++', proficiency: 'advanced' },
    { name: 'Machine Learning', proficiency: 'intermediate' },
    { name: 'SQL', proficiency: 'advanced' },
    { name: 'AWS', proficiency: 'intermediate' },
    { name: 'Docker', proficiency: 'beginner' },
    { name: 'Git', proficiency: 'advanced' },
    { name: 'MongoDB', proficiency: 'intermediate' },
    { name: 'Data Structures', proficiency: 'expert' },
    { name: 'Algorithms', proficiency: 'expert' },
  ],
  'Electronics': [
    { name: 'VLSI Design', proficiency: 'advanced' },
    { name: 'Embedded Systems', proficiency: 'advanced' },
    { name: 'Verilog', proficiency: 'intermediate' },
    { name: 'MATLAB', proficiency: 'advanced' },
    { name: 'Signal Processing', proficiency: 'intermediate' },
    { name: 'PCB Design', proficiency: 'intermediate' },
    { name: 'Arduino', proficiency: 'advanced' },
    { name: 'Python', proficiency: 'intermediate' },
    { name: 'C/C++', proficiency: 'advanced' },
    { name: 'IoT', proficiency: 'intermediate' },
  ],
  'Electrical': [
    { name: 'Power Systems', proficiency: 'advanced' },
    { name: 'Control Systems', proficiency: 'advanced' },
    { name: 'MATLAB', proficiency: 'expert' },
    { name: 'PLC Programming', proficiency: 'intermediate' },
    { name: 'AutoCAD Electrical', proficiency: 'intermediate' },
    { name: 'Python', proficiency: 'intermediate' },
    { name: 'Power Electronics', proficiency: 'advanced' },
  ],
  'Mechanical': [
    { name: 'AutoCAD', proficiency: 'expert' },
    { name: 'SolidWorks', proficiency: 'advanced' },
    { name: 'ANSYS', proficiency: 'intermediate' },
    { name: 'CATIA', proficiency: 'intermediate' },
    { name: 'Manufacturing Processes', proficiency: 'advanced' },
    { name: 'Thermodynamics', proficiency: 'advanced' },
    { name: 'Python', proficiency: 'beginner' },
  ],
};

// ============================================
// Sample Projects
// ============================================

export const sampleProjects: Project[] = [
  {
    id: 'proj1',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce application with payment integration, user authentication, and admin dashboard',
    technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    githubUrl: 'https://github.com/student/ecommerce',
    liveUrl: 'https://myecommerce.vercel.app',
    isOngoing: false,
    startDate: '2025-01',
    endDate: '2025-04',
  },
  {
    id: 'proj2',
    title: 'AI Chatbot using LLM',
    description: 'Conversational AI chatbot using GPT-4 API with context retention and multi-language support',
    technologies: ['Python', 'FastAPI', 'OpenAI API', 'React'],
    githubUrl: 'https://github.com/student/ai-chatbot',
    isOngoing: false,
    startDate: '2025-02',
    endDate: '2025-05',
  },
  {
    id: 'proj3',
    title: 'Smart Campus IoT System',
    description: 'IoT-based campus monitoring system with sensors for attendance, energy management, and security',
    technologies: ['Arduino', 'Raspberry Pi', 'Node.js', 'InfluxDB'],
    githubUrl: 'https://github.com/student/smart-campus',
    isOngoing: true,
    startDate: '2025-06',
  },
  {
    id: 'proj4',
    title: 'Stock Price Predictor',
    description: 'Machine learning model for stock price prediction using LSTM neural networks',
    technologies: ['Python', 'TensorFlow', 'Pandas', 'Streamlit'],
    githubUrl: 'https://github.com/student/stock-predictor',
    isOngoing: false,
    startDate: '2024-08',
    endDate: '2024-12',
  },
  {
    id: 'proj5',
    title: 'College ERP System',
    description: 'Comprehensive ERP system for managing student records, attendance, and examinations',
    technologies: ['React', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
    isOngoing: true,
    startDate: '2025-03',
  },
];

// ============================================
// Sample Certifications
// ============================================

export const sampleCertifications: Certification[] = [
  { id: 'cert1', name: 'AWS Cloud Practitioner', issuingOrganization: 'Amazon Web Services', issueDate: '2024-06', credentialUrl: 'https://aws.amazon.com/verify' },
  { id: 'cert2', name: 'Google Cloud Associate', issuingOrganization: 'Google Cloud', issueDate: '2024-09', credentialUrl: 'https://cloud.google.com/verify' },
  { id: 'cert3', name: 'Meta React Developer', issuingOrganization: 'Meta', issueDate: '2025-01', credentialUrl: 'https://coursera.org/verify' },
  { id: 'cert4', name: 'Machine Learning Specialization', issuingOrganization: 'Stanford Online (Coursera)', issueDate: '2024-12' },
  { id: 'cert5', name: 'Full Stack Development', issuingOrganization: 'freeCodeCamp', issueDate: '2024-08', credentialUrl: 'https://freecodecamp.org/verify' },
  { id: 'cert6', name: 'Python for Data Science', issuingOrganization: 'IBM', issueDate: '2024-05' },
];

// ============================================
// Sample Work Experience (Internships)
// ============================================

export const sampleInternships: WorkExperience[] = [
  {
    id: 'exp1',
    companyName: 'Google',
    role: 'Software Engineering Intern',
    type: 'internship',
    location: 'Bangalore',
    description: 'Worked on Google Cloud Platform infrastructure. Developed microservices for data processing pipeline.',
    isCurrentRole: false,
    startDate: '2025-05',
    endDate: '2025-07',
  },
  {
    id: 'exp2',
    companyName: 'Microsoft',
    role: 'SDE Intern',
    type: 'internship',
    location: 'Hyderabad',
    description: 'Contributed to Azure DevOps. Built CI/CD pipeline automation tools.',
    isCurrentRole: false,
    startDate: '2025-05',
    endDate: '2025-07',
  },
  {
    id: 'exp3',
    companyName: 'Amazon',
    role: 'SDE Intern',
    type: 'internship',
    location: 'Bangalore',
    description: 'Worked on AWS Lambda team. Optimized serverless function cold start times.',
    isCurrentRole: false,
    startDate: '2025-06',
    endDate: '2025-08',
  },
  {
    id: 'exp4',
    companyName: 'Goldman Sachs',
    role: 'Summer Analyst',
    type: 'internship',
    location: 'Bangalore',
    description: 'Developed trading algorithms and risk management dashboards.',
    isCurrentRole: false,
    startDate: '2025-05',
    endDate: '2025-07',
  },
  {
    id: 'exp5',
    companyName: 'Flipkart',
    role: 'Product Intern',
    type: 'internship',
    location: 'Bangalore',
    description: 'Worked on recommendation engine improvements. A/B testing for product features.',
    isCurrentRole: false,
    startDate: '2024-12',
    endDate: '2025-02',
  },
  {
    id: 'exp6',
    companyName: 'PhonePe',
    role: 'Backend Intern',
    type: 'internship',
    location: 'Bangalore',
    description: 'Built payment reconciliation microservices processing 10M+ transactions daily.',
    isCurrentRole: false,
    startDate: '2025-01',
    endDate: '2025-03',
  },
];

// ============================================
// First names for Indian students
// ============================================

const firstNames = [
  'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Arjun', 'Neha', 
  'Rohan', 'Kavita', 'Aditya', 'Pooja', 'Saurabh', 'Divya', 'Karan', 
  'Shreya', 'Varun', 'Riya', 'Nikhil', 'Ankita', 'Harsh', 'Megha',
  'Sahil', 'Tanvi', 'Gaurav', 'Ishita', 'Mohit', 'Nisha', 'Pranav', 'Sakshi'
];

const lastNames = [
  'Sharma', 'Patel', 'Kumar', 'Singh', 'Agarwal', 'Gupta', 'Verma', 
  'Mehta', 'Joshi', 'Reddy', 'Nair', 'Kapoor', 'Malhotra', 'Bansal',
  'Chauhan', 'Dubey', 'Pandey', 'Yadav', 'Saxena', 'Bhatia'
];

const departments = ['Computer Science', 'Electronics', 'Electrical', 'Mechanical'];

// ============================================
// Seed Function
// ============================================

export async function seedPlacementData(orgId?: string) {
  console.log('🌱 Starting placement data seeding...');
  
  try {
    // 0. Seed Departments with HODs and Faculty
    console.log('🏫 Seeding departments & faculty...');
    const { departments, faculty } = await seedFacultyAndDepartments();
    console.log(`✅ Created ${departments} departments, ${faculty} faculty members`);

    // 1. Seed Jobs from PEC companies
    console.log('📋 Seeding jobs...');
    const jobIds = await seedJobs();
    console.log(`✅ Created ${jobIds.length} jobs`);

    // 2. Seed Placement Drives
    console.log('🏢 Seeding placement drives...');
    const driveIds = await seedPlacementDrives();
    console.log(`✅ Created ${driveIds.length} placement drives`);

    // 3. Seed Student Profiles (for existing users or create mock)
    console.log('👨‍🎓 Seeding student profiles...');
    const profileIds = await seedStudentProfiles();
    console.log(`✅ Created ${profileIds.length} student profiles`);

    // 4. Seed Applications
    console.log('📝 Seeding job applications...');
    const applicationCount = await seedApplications(jobIds, profileIds);
    console.log(`✅ Created ${applicationCount} applications`);

    console.log('🎉 Placement data seeding complete!');
    
    return {
      departments,
      faculty,
      jobs: jobIds.length,
      drives: driveIds.length,
      students: profileIds.length,
      profiles: profileIds.length,
      applications: applicationCount,
    };
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// ============================================
// Faculty and Department Seeding
// ============================================

const pecDepartments = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'ECE', name: 'Electronics & Communication Engineering' },
  { code: 'EE', name: 'Electrical Engineering' },
  { code: 'ME', name: 'Mechanical Engineering' },
  { code: 'CE', name: 'Civil Engineering' },
  { code: 'PIE', name: 'Production & Industrial Engineering' },
  { code: 'AERO', name: 'Aerospace Engineering' },
  { code: 'META', name: 'Metallurgical Engineering' },
];

const facultyDesignations = [
  'Professor',
  'Associate Professor', 
  'Assistant Professor',
  'Lecturer',
  'Senior Lecturer',
];

const facultyFirstNames = ['Rajesh', 'Priya', 'Amit', 'Neha', 'Vikram', 'Anita', 'Sanjay', 'Meera', 'Arun', 'Kavita', 'Suresh', 'Deepa', 'Rahul', 'Pooja', 'Manoj', 'Ritu'];
const facultyLastNames = ['Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Jain', 'Gupta', 'Bhatia', 'Agarwal', 'Reddy', 'Rao', 'Iyer'];

async function seedFacultyAndDepartments(): Promise<{ departments: number; faculty: number }> {
  const batch = writeBatch(({} as any));
  let deptCount = 0;
  let facultyCount = 0;

  for (let i = 0; i < pecDepartments.length; i++) {
    const dept = pecDepartments[i];
    const deptId = `dept_${dept.code.toLowerCase()}_pec`;
    
    // Create HOD for this department
    const hodFirstName = facultyFirstNames[i % facultyFirstNames.length];
    const hodLastName = facultyLastNames[i % facultyLastNames.length];
    const hodName = `Dr. ${hodFirstName} ${hodLastName}`;
    const hodId = `faculty_hod_${dept.code.toLowerCase()}_${Date.now()}`;
    const hodEmail = `${hodFirstName.toLowerCase()}.${dept.code.toLowerCase()}@pec.edu.in`;

    // HOD User
    batch.set(doc(({} as any), 'users', hodId), {
      id: hodId,
      fullName: hodName,
      email: hodEmail,
      role: 'faculty',
      organizationId: 'pec_chandigarh',
      status: 'active',
      profileComplete: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // HOD Faculty Profile
    batch.set(doc(({} as any), 'facultyProfiles', hodId), {
      uid: hodId,
      fullName: hodName,
      email: hodEmail,
      employeeId: `FAC-${dept.code}-HOD`,
      department: dept.name,
      designation: 'Head of Department',
      isHOD: true,
      specialization: `${dept.name} Specialization`,
      phone: `+91 98${10000000 + i}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    facultyCount++;

    // Create 2-3 additional faculty per department
    const additionalFacultyCount = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < additionalFacultyCount; j++) {
      const fFirstName = facultyFirstNames[(i * 3 + j + 5) % facultyFirstNames.length];
      const fLastName = facultyLastNames[(i + j + 3) % facultyLastNames.length];
      const designation = facultyDesignations[j % facultyDesignations.length];
      const prefix = designation.includes('Professor') ? 'Dr.' : 'Prof.';
      const fName = `${prefix} ${fFirstName} ${fLastName}`;
      const fId = `faculty_${dept.code.toLowerCase()}_${j}_${Date.now()}`;
      const fEmail = `${fFirstName.toLowerCase()}.${fLastName.toLowerCase()}@pec.edu.in`;

      batch.set(doc(({} as any), 'users', fId), {
        id: fId,
        fullName: fName,
        email: fEmail,
        role: 'faculty',
        organizationId: 'pec_chandigarh',
        status: 'active',
        profileComplete: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(doc(({} as any), 'facultyProfiles', fId), {
        uid: fId,
        fullName: fName,
        email: fEmail,
        employeeId: `FAC-${dept.code}-${100 + j}`,
        department: dept.name,
        designation,
        specialization: `${dept.name} Research`,
        phone: `+91 98${20000000 + (i * 10) + j}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      facultyCount++;
    }

    // Create Department
    batch.set(doc(({} as any), 'departments', deptId), {
      code: dept.code,
      name: dept.name,
      hodId,
      hodName,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    deptCount++;
  }

  // Create Placement Officer (TPO)
  const tpoId = `faculty_tpo_pec_${Date.now()}`;
  batch.set(doc(({} as any), 'users', tpoId), {
    id: tpoId,
    fullName: 'Dr. Placement Officer',
    email: 'tpo@pec.edu.in',
    role: 'placement_officer',
    organizationId: 'pec_chandigarh',
    status: 'active',
    profileComplete: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(doc(({} as any), 'facultyProfiles', tpoId), {
    uid: tpoId,
    fullName: 'Dr. Placement Officer',
    email: 'tpo@pec.edu.in',
    employeeId: 'FAC-TPO-001',
    department: 'Training & Placement Cell',
    designation: 'Training & Placement Officer',
    isTPO: true,
    specialization: 'Career Development & Industry Relations',
    phone: '+91 9800000001',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  facultyCount++;

  await batch.commit();
  return { departments: deptCount, faculty: facultyCount };
}

async function seedJobs(): Promise<string[]> {
  const batch = writeBatch(({} as any));
  const jobIds: string[] = [];
  
  const jobTypes = ['full-time', 'internship'];
  
  for (const company of pecCompanies.slice(0, 20)) {
    for (const jobType of jobTypes) {
      const jobId = `job_${company.name.toLowerCase().replace(/\s+/g, '_')}_${jobType}_${Date.now()}`;
      const salary = jobType === 'internship' 
        ? `₹${Math.floor(company.minPackage * 8)}K - ₹${Math.floor(company.maxPackage * 10)}K /month`
        : `₹${company.minPackage} - ${company.maxPackage} LPA`;
      
      const job: any = {
        title: jobType === 'internship' 
          ? `${company.type === 'IT Services' ? 'Software' : company.type} Intern` 
          : `Software ${company.type === 'Finance' ? 'Analyst' : 'Engineer'}`,
        companyId: company.name.toLowerCase().replace(/\s+/g, ''),
        companyName: company.name,
        companyLogo: company.logo,
        description: `Join ${company.name} as a ${jobType === 'internship' ? 'summer intern' : 'full-time engineer'}. Work on cutting-edge technology and solve real-world problems.`,
        type: jobType as any,
        location: company.locations[0],
        salary,
        requirements: ['Strong problem-solving skills', 'Good communication', 'Team player'],
        responsibilities: ['Write clean, maintainable code', 'Participate in code reviews', 'Collaborate with cross-functional teams'],
        status: 'open',
        applicationDeadline: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        postedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        eligibilityCriteria: {
          minCgpa: company.minPackage > 20 ? 7.5 : 6.0,
          maxBacklogs: 0,
          eligibleBranches: ['Computer Science', 'Electronics', 'Electrical'],
          eligibleBatches: ['2026'],
        },
        compensation: {
          baseSalary: salary,
          benefits: ['Health Insurance', 'Paid Time Off', 'Learning Budget'],
        },
        interviewRounds: [
          { id: '1', order: 1, name: 'Online Assessment', type: 'aptitude', duration: 90 },
          { id: '2', order: 2, name: 'Technical Interview 1', type: 'technical', duration: 60 },
          { id: '3', order: 3, name: 'Technical Interview 2', type: 'coding', duration: 60 },
          { id: '4', order: 4, name: 'HR Round', type: 'hr', duration: 30 },
        ],
      };
      
      const docRef = doc(({} as any), 'jobs', jobId);
      batch.set(docRef, job);
      jobIds.push(jobId);
    }
  }
  
  await batch.commit();
  return jobIds;
}

async function seedPlacementDrives(): Promise<string[]> {
  const batch = writeBatch(({} as any));
  const driveIds: string[] = [];
  
  const topCompanies = pecCompanies.filter(c => c.maxPackage >= 20).slice(0, 8);
  
  for (let i = 0; i < topCompanies.length; i++) {
    const company = topCompanies[i];
    const driveId = `drive_${company.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
    const startDate = new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000);
    
    const drive: any = {
      companyId: company.name.toLowerCase().replace(/\s+/g, ''),
      companyName: company.name,
      companyLogo: company.logo,
      title: `${company.name} Campus Recruitment Drive 2026`,
      description: `${company.name} is visiting PEC for campus placements. Multiple roles available for final year students.`,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000)),
      registrationDeadline: Timestamp.fromDate(new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000)),
      venue: 'Placement Cell, Main Building',
      status: 'upcoming',
      eligibleBranches: ['Computer Science', 'Electronics', 'Electrical', 'Mechanical'],
      minCgpa: company.maxPackage >= 30 ? 7.5 : 6.5,
      maxBacklogs: 0,
      roles: [
        {
          title: 'Software Development Engineer',
          type: 'full-time',
          salary: `₹${company.minPackage} - ${company.maxPackage} LPA`,
          openings: Math.floor(Math.random() * 10) + 5,
        },
      ],
      rounds: [
        { roundNumber: 1, roundName: 'Resume Shortlisting', roundType: 'screening', date: Timestamp.fromDate(startDate) },
        { roundNumber: 2, roundName: 'Online Test', roundType: 'aptitude', date: Timestamp.fromDate(startDate) },
        { roundNumber: 3, roundName: 'Technical Interview', roundType: 'technical', date: Timestamp.fromDate(new Date(startDate.getTime() + 24 * 60 * 60 * 1000)) },
        { roundNumber: 4, roundName: 'HR Interview', roundType: 'hr', date: Timestamp.fromDate(new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000)) },
      ] as any,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    const docRef = doc(({} as any), 'placementDrives', driveId);
    batch.set(docRef, drive);
    driveIds.push(driveId);
  }
  
  await batch.commit();
  return driveIds;
}

async function seedStudentProfiles(): Promise<string[]> {
  const batch = writeBatch(({} as any));
  const profileIds: string[] = [];
  
  // Create 30 realistic student profiles with full user accounts
  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const fullName = `${firstName} ${lastName}`;
    const department = departments[i % 4];
    const semester = Math.random() > 0.3 ? 8 : (Math.random() > 0.5 ? 7 : 6);
    const cgpa = parseFloat((6.5 + Math.random() * 3.3).toFixed(2)); // 6.5 to 9.8
    const enrollmentNumber = `PEC${2022 + Math.floor(i / 10)}${department.substring(0, 2).toUpperCase()}${String(100 + i).padStart(3, '0')}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@pec.edu.in`;
    
    const userId = `student_${firstName.toLowerCase()}_${lastName.toLowerCase()}_${i}`;
    
    // =====================
    // 1. Create User Account
    // =====================
    const user: any = {
      id: userId,
      name: fullName,
      email,
      role: 'student',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      organizationId: 'pec_chandigarh',
      profileComplete: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(doc(({} as any), 'users', userId), user);
    
    // =====================
    // 2. Create Student Profile (Academic)
    // =====================
    const studentProfile: any = {
      uid: userId,
      email,
      fullName,
      enrollmentNumber,
      department,
      semester: semester.toString(),
      phone: `+91 ${9800000000 + i}`,
      dob: `200${3 + Math.floor(i / 10)}-0${(i % 9) + 1}-${10 + (i % 20)}`,
      address: 'PEC Campus Hostel',
      city: 'Chandigarh',
      state: 'Chandigarh',
      bio: `${department} student at PEC with passion for technology and innovation.`,
      cgpa,
      attendancePercentage: 75 + Math.floor(Math.random() * 20),
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(doc(({} as any), 'studentProfiles', userId), studentProfile);
    
    // =====================
    // 3. Create Placement Profile
    // =====================
    // Select random skills based on department
    const deptSkills = skillsByDepartment[department] || skillsByDepartment['Computer Science'];
    const numSkills = Math.floor(Math.random() * 5) + 4; // 4-8 skills
    const selectedSkills = shuffleArray([...deptSkills]).slice(0, numSkills);
    
    // Select random projects (1-3)
    const numProjects = Math.floor(Math.random() * 3) + 1;
    const selectedProjects = shuffleArray([...sampleProjects])
      .slice(0, numProjects)
      .map((p, idx) => ({ ...p, id: `${userId}_proj_${idx}` }));
    
    // 60% chance of having certification
    const hasCerts = Math.random() > 0.4;
    const selectedCerts = hasCerts 
      ? shuffleArray([...sampleCertifications])
          .slice(0, Math.floor(Math.random() * 2) + 1)
          .map((c, idx) => ({ ...c, id: `${userId}_cert_${idx}` }))
      : [];
    
    // 40% chance of having internship (higher for 8th sem)
    const hasInternship = semester >= 7 ? Math.random() > 0.3 : Math.random() > 0.7;
    const selectedInternships = hasInternship
      ? shuffleArray([...sampleInternships])
          .slice(0, Math.floor(Math.random() * 2) + 1)
          .map((e, idx) => ({ ...e, id: `${userId}_exp_${idx}` }))
      : [];
    
    // Calculate readiness score
    const readinessScore = calculateReadinessScore({
      cgpa,
      skills: selectedSkills,
      projects: selectedProjects,
      certifications: selectedCerts,
      workExperience: selectedInternships,
    });
    
    const placementProfile: any = {
      userId,
      studentName: fullName,
      studentEmail: email,
      studentAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      enrollmentNumber,
      department,
      semester,
      cgpa,
      backlogs: Math.random() > 0.9 ? 1 : 0,
      skills: selectedSkills,
      projects: selectedProjects,
      certifications: selectedCerts,
      workExperience: selectedInternships,
      preferredJobTypes: semester >= 7 ? ['full-time'] : ['internship'],
      preferredLocations: shuffleArray(['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR']).slice(0, 3),
      willingToRelocate: Math.random() > 0.3,
      noticePeriod: 'Immediate',
      isProfileComplete: readinessScore >= 50,
      placementReadinessScore: readinessScore,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    batch.set(doc(({} as any), 'placementProfiles', userId), placementProfile);
    profileIds.push(userId);
  }
  
  await batch.commit();
  return profileIds;
}

async function seedApplications(jobIds: string[], profileIds: string[]): Promise<number> {
  const batch = writeBatch(({} as any));
  let count = 0;
  
  const statuses: JobApplication['status'][] = [
    'applied', 'under-review', 'shortlisted', 'interview-scheduled', 
    'interviewed', 'offered', 'hired', 'rejected'
  ];
  
  // Each student applies to 3-8 random jobs
  for (const profileId of profileIds.slice(0, 20)) {
    const numApplications = Math.floor(Math.random() * 6) + 3;
    const appliedJobs = shuffleArray([...jobIds]).slice(0, numApplications);
    
    for (const jobId of appliedJobs) {
      const applicationId = `app_${profileId}_${jobId}_${Date.now()}_${count}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const application: any = {
        jobId,
        studentId: profileId,
        status,
        appliedAt: serverTimestamp(),
        currentRound: status === 'applied' ? 1 : Math.floor(Math.random() * 4) + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = doc(({} as any), 'applications', applicationId);
      batch.set(docRef, application);
      count++;
    }
  }
  
  await batch.commit();
  return count;
}

// ============================================
// Helper Functions
// ============================================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function calculateReadinessScore(data: {
  cgpa: number;
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  workExperience: WorkExperience[];
}): number {
  let score = 0;
  
  // CGPA contribution (max 25 points)
  score += Math.min((data.cgpa / 10) * 25, 25);
  
  // Skills contribution (max 20 points)
  const expertSkills = data.skills.filter(s => s.proficiency === 'expert').length;
  const advancedSkills = data.skills.filter(s => s.proficiency === 'advanced').length;
  score += Math.min(expertSkills * 4 + advancedSkills * 2 + data.skills.length, 20);
  
  // Projects contribution (max 20 points)
  score += Math.min(data.projects.length * 7, 20);
  
  // Certifications contribution (max 15 points)
  score += Math.min(data.certifications.length * 5, 15);
  
  // Work experience contribution (max 20 points)
  score += Math.min(data.workExperience.length * 10, 20);
  
  return Math.min(Math.round(score), 100);
}

export default seedPlacementData;
