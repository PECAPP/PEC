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
  organizationId?: string; // NEW: Link to organization
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

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: any;
  totalPoints: number;
  status: 'active' | 'archived';
  courseCode?: string; // Optional for UI display
  courseName?: string; // Optional for UI display
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  submittedAt: any;
  content: string;
  attachments?: string[];
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  gradePoints: number;
  credits?: number; // Optional as it might come from Course
  type: 'midterm' | 'final' | 'assignment';
}

// ========================================
// Placement & Job Board Types
// ========================================

export interface Skill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  role: string;
  type: 'internship' | 'part-time' | 'full-time' | 'freelance';
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
  description: string;
  location: string;
}

export interface PlacementProfile {
  id: string;
  userId: string;
  // Academic Details
  enrollmentNumber: string;
  department: string;
  semester: number;
  cgpa: number;
  backlogs: number;
  // Skills & Profile
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  workExperience: WorkExperience[];
  // Documents
  resumeUrl?: string;
  resumeUpdatedAt?: any;
  isResumePublic?: boolean;
  // Career Preferences
  preferredJobTypes: ('full-time' | 'internship' | 'part-time')[];
  preferredLocations: string[];
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  willingToRelocate: boolean;
  // Readiness
  isProfileComplete: boolean;
  placementReadinessScore: number; // 0-100
  // Meta
  createdAt: any;
  updatedAt: any;
}

export interface EligibilityCriteria {
  minCgpa?: number;
  maxBacklogs?: number;
  allowedDepartments?: string[];
  allowedBatches?: string[];
  requiredSkills?: string[];
  minProjects?: number;
}

export interface InterviewRound {
  id: string;
  name: string;
  type: 'aptitude' | 'technical' | 'hr' | 'coding' | 'group-discussion' | 'other';
  description?: string;
  duration?: number; // in minutes
  order: number;
}

export interface CompensationDetails {
  baseSalary: string;
  bonus?: string;
  joiningBonus?: string;
  stockOptions?: string;
  benefits?: string[];
}

export interface ExtendedJob {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  location: string;
  locationType: 'onsite' | 'remote' | 'hybrid';
  type: 'full-time' | 'internship' | 'part-time';
  // Compensation
  salary: string;
  compensation?: CompensationDetails;
  // Eligibility
  eligibility: EligibilityCriteria;
  // Interview Process
  interviewRounds: InterviewRound[];
  // Dates
  deadline: any;
  postedAt: any;
  // Status
  status: 'draft' | 'open' | 'closed' | 'filled';
  // Counts
  applicationsCount: number;
  shortlistedCount: number;
  hiredCount: number;
  // Meta
  tags: string[];
  recruiterId: string;
  organizationId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string;
  // Student Info (denormalized for quick access)
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  studentCgpa: number;
  // Application Data
  resumeUrl: string;
  coverLetter?: string;
  // Status Tracking
  status: 'applied' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
  currentRound?: number;
  // Feedback
  feedback?: string;
  internalNotes?: string;
  // Dates
  appliedAt: any;
  lastUpdatedAt: any;
  // Interview
  interviewSchedule?: InterviewSchedule[];
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  jobId: string;
  studentId: string;
  // Interview Details
  roundNumber: number;
  roundName: string;
  roundType: InterviewRound['type'];
  // Schedule
  scheduledDate: any;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  // Location/Meeting
  mode: 'in-person' | 'video-call' | 'phone';
  location?: string; // For in-person
  meetingLink?: string; // For video calls
  // Participants
  interviewerIds?: string[];
  interviewerNames?: string[];
  // Status & Outcome
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';
  outcome?: 'passed' | 'failed' | 'pending';
  feedback?: string;
  score?: number;
  // Meta
  createdAt: any;
  updatedAt: any;
}

export interface Offer {
  id: string;
  applicationId: string;
  jobId: string;
  studentId: string;
  recruiterId: string;
  // Offer Details
  jobTitle: string;
  companyName: string;
  location: string;
  // Compensation
  compensation: CompensationDetails;
  // Dates
  joiningDate: string;
  offerValidTill: string;
  offeredAt: any;
  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
  respondedAt?: any;
  // Documents
  offerLetterUrl?: string;
  signedOfferUrl?: string;
  // Notes
  notes?: string;
  rejectionReason?: string;
  // Meta
  createdAt: any;
  updatedAt: any;
}

export interface PlacementDrive {
  id: string;
  companyName: string;
  companyLogo?: string;
  role: string;
  description: string;
  // Schedule
  date: any;
  venue: string;
  rounds: InterviewRound[];
  // Eligibility
  eligibility: EligibilityCriteria;
  batch: string;
  // Compensation
  salary: string;
  compensation?: CompensationDetails;
  // Status
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  // Registration
  registeredStudents: string[];
  registeredCount: number;
  maxRegistrations?: number;
  registrationDeadline: any;
  // Results
  shortlistedStudents?: string[];
  selectedStudents?: string[];
  // Contact
  contactPerson: string;
  contactEmail?: string;
  contactPhone?: string;
  // Meta
  organizationId?: string;
  createdBy: string;
  createdAt: any;
  updatedAt: any;
}

export interface CompanyPartnership {
  id: string;
  companyName: string;
  companyLogo?: string;
  industry: string;
  website?: string;
  // Contact
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone?: string;
  // Partnership Details
  partnershipType: 'regular' | 'premium' | 'exclusive';
  partnershipStartDate: string;
  partnershipEndDate?: string;
  isActive: boolean;
  // History
  totalHires: number;
  totalDrives: number;
  averagePackage?: string;
  lastDriveDate?: any;
  // Status
  verificationStatus: 'pending' | 'verified' | 'rejected' | 'blacklisted';
  verifiedAt?: any;
  verifiedBy?: string;
  // Notes
  notes?: string;
  // Meta
  organizationId?: string;
  createdAt: any;
  updatedAt: any;
}

export interface PlacementStats {
  // Overall Stats
  totalStudents: number;
  placedStudents: number;
  placementPercentage: number;
  // Package Stats
  highestPackage: string;
  averagePackage: string;
  medianPackage: string;
  // Company Stats
  totalCompanies: number;
  totalOffers: number;
  // Department-wise
  departmentStats: {
    department: string;
    total: number;
    placed: number;
    percentage: number;
    avgPackage: string;
  }[];
  // Package Distribution
  packageDistribution: {
    range: string; // e.g., "0-5 LPA", "5-10 LPA"
    count: number;
  }[];
  // Year/Batch
  year: number;
  batch: string;
  // Meta
  lastUpdated: any;
}

export interface PlacementSettings {
  id: string;
  organizationId: string;
  // CGPA Requirements
  minCgpaForPlacements: number;
  maxBacklogsAllowed: number;
  // Resume Settings
  mandatoryResumeFields: string[];
  allowedResumeFormats: string[];
  maxResumeSize: number; // in MB
  // Timeline
  placementSeasonStart: string;
  placementSeasonEnd: string;
  // Company Settings
  requireCompanyVerification: boolean;
  companyVerificationDocuments: string[];
  // Notifications
  notifyOnNewJob: boolean;
  notifyOnApplicationUpdate: boolean;
  notifyOnDriveRegistration: boolean;
  // Meta
  updatedAt: any;
  updatedBy: string;
}
