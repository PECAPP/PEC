export type UserRole =
  | "college_admin"
  | "faculty"
  | "student";

export interface User {
  id: string;
  uid: string;
  name: string;
  fullName: string;
  email: string;
  role: UserRole | null;
  roles?: string[];
  avatar?: string;
  profileComplete?: boolean;
}

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

