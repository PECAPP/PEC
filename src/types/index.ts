export type UserRole = 
  | 'super_admin'
  | 'college_admin'
  | 'placement_officer'
  | 'faculty'
  | 'student'
  | 'recruiter';

export type VerificationStatus = 'idle' | 'loading' | 'verified' | 'possible_match' | 'not_found';

export interface Organization {
  id: string;
  name: string;
  location?: string;
  type?: 'university' | 'college' | 'institute';
  verified: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | null; // Role can be null initially
  avatar?: string;
  organizationId?: string;
  profileComplete?: boolean; // Track if profile is complete
}

export interface Student {
  id: string;
  userId: string;
  enrollmentNumber: string;
  department: string;
  semester: number;
  cgpa: number;
  attendancePercentage: number;
  status: 'active' | 'graduated' | 'suspended';
}

// Role-specific profile interfaces
export interface StudentProfile {
  uid: string;
  email: string;
  fullName: string;
  enrollmentNumber: string;
  department: string;
  semester: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface FacultyProfile {
  uid: string;
  email: string;
  fullName: string;
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  specialization: string;
  qualifications: string;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CollegeAdminProfile {
  uid: string;
  email: string;
  fullName: string;
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  responsibilities: string;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PlacementOfficerProfile {
  uid: string;
  email: string;
  fullName: string;
  employeeId: string;
  phone: string;
  yearsOfExperience: string;
  specializations: string;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface RecruiterProfile {
  uid: string;
  email: string;
  fullName: string;
  companyName: string;
  designation: string;
  phone: string;
  companyWebsite: string;
  focusAreas: string;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  department: string;
  semester: number;
  status: 'ongoing' | 'completed' | 'upcoming';
}

export interface AttendanceRecord {
  date: string;
  status: 'present' | 'absent' | 'late';
  subject: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship';
  salary?: string;
  deadline: string;
  matchScore?: number;
}
