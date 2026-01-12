export type UserRole =
  | "super_admin"
  | "college_admin"
  | "placement_officer"
  | "faculty"
  | "student"
  | "recruiter";

export type VerificationStatus =
  | "idle"
  | "loading"
  | "verified"
  | "possible_match"
  | "not_found";

export interface Organization {
  id: string;
  name: string;
  location?: string;
  type?: "university" | "college" | "institute";
  verified: boolean;
}

export interface CollegeSettings {
  collegeName: string;
  collegeShortName?: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  tagline: string;
  logoUrl: string;
  logoDisplayMode?: "logo-only" | "text-only" | "both";
  brandingColors?: string[]; // Hex colors users can choose from
  cloudinaryCloudName?: string;
  cloudinaryPreset?: string;
  lastUpdated: any;
  updatedBy: string;
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
  status: "active" | "graduated" | "suspended";
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
  status: "ongoing" | "completed" | "upcoming";
}

export interface AttendanceRecord {
  date: string;
  status: "present" | "absent" | "late";
  subject: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "internship";
  salary?: string;
  deadline: string;
  matchScore?: number;
}

// Library Management
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  publisher: string;
  year: number;
}

export interface BookBorrow {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: any;
  dueDate: any;
  returnDate?: any;
  status: "borrowed" | "returned" | "overdue";
  fine?: number;
}

// Room Booking
export interface Room {
  id: string;
  name: string;
  type: "classroom" | "lab" | "meeting-room" | "auditorium";
  capacity: number;
  building: string;
  floor: number;
  facilities: string[];
  location?: string;
  isAvailable?: boolean;
  createdAt?: any;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startTime: any;
  endTime: any;
  date: string;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: any;
}

// Leave Management
export interface LeaveType {
  id: string;
  name: string;
  defaultDays: number;
  description: string;
}

export interface Leave {
  id: string;
  userId: string;
  userName?: string;
  leaveTypeId: string;
  leaveType?: string;
  startDate: any;
  endDate: any;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvalDate?: any;
  createdAt: any;
}

export interface LeaveBalance {
  id: string;
  userId: string;
  leaveTypeId: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

// Clubs
export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo?: string;
  president: string;
  vice_president?: string;
  members: string[];
  totalMembers: number;
  createdAt: any;
  updatedAt: any;
}

export interface ClubEvent {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: any;
  time: string;
  location: string;
  registrations: number;
  maxRegistrations?: number;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: any;
}

export interface ClubRecruitment {
  id: string;
  clubId: string;
  userId: string;
  position: string;
  status: "pending" | "approved" | "rejected";
  appliedAt: any;
  approvedAt?: any;
  approvedBy?: string;
}

export interface Workshop {
  id: string;
  title: string;
  description: string;
  conductor: string;
  date: any;
  time: string;
  duration: number;
  location: string;
  maxParticipants: number;
  registrations: number;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: any;
}

// Hostel
export interface HostelComplaint {
  id: string;
  userId: string;
  room: string;
  category: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: any;
  resolvedAt?: any;
  notes?: string;
}

export interface VisitorPass {
  id: string;
  studentId: string;
  visitorName: string;
  visitorPhone: string;
  relationship: string;
  checkInTime: any;
  checkOutTime?: any;
  room: string;
  status: "active" | "checked-out";
}

// Approvals
export interface ApprovalRequest {
  id: string;
  type:
    | "room-booking"
    | "leave"
    | "club-recruitment"
    | "book-request"
    | "other";
  requesterId: string;
  relatedId: string;
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  createdAt: any;
  approvedAt?: any;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: any;
  createdAt: any;
  updatedAt: any;
}
