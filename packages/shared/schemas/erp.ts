import { z } from 'zod';

/**
 * Shared Domain Schemas (Single Source of Truth)
 * used by both Next.js (frontend) and NestJS (backend).
 */

export const departmentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
  hod: z.string().optional(),
  description: z.string().max(500, 'Description too long').optional(),
  status: z.enum(['active', 'inactive']).optional(),
}).strict();

export const facultySchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(3, 'Full name required'),
  email: z.string().email('Invalid institutional email'),
  department: z.string().min(1, 'Department is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  designation: z.string().min(1, 'Designation is required'),
  specialization: z.string().optional(),
  phone: z.string().regex(/^\+?[0-9- ]{10,15}$/, 'Invalid phone number').optional(),
}).strict();

export const attendanceSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid('Invalid student ID'),
  subject: z.string().min(1, 'Course ID/Subject is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  status: z.enum(['present', 'absent', 'late']),
  remarks: z.string().max(200).optional(),
  sessionId: z.string().uuid().optional(),
  markedAt: z.string().datetime().optional(),
  method: z.enum(['qr', 'manual']).default('manual'),
  courseId: z.string().optional(),
  facultyId: z.string().uuid().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
}).strict();

export const AuthLoginSchema = z.object({
  email: z.string().email('Invalid institutional email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).strict();

export const AuthSignupSchema = z.object({
  fullName: z.string().min(3, 'Full name required'),
  email: z.string().email('Invalid institutional email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'faculty', 'college_admin']).default('student'),
}).strict();

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
    role: z.string(),
  }),
  token: z.string(),
}).strict();

export const attendanceSessionSchema = z.object({
  id: z.string().uuid().optional(),
  facultyId: z.string().uuid('Invalid faculty ID'),
  courseId: z.string().min(1, 'Course ID is required'),
  courseName: z.string().min(1, 'Course name is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Invalid start time (HH:MM or HH:MM:SS)'),
  qrCode: z.string().min(1, 'QR code is required'),
  active: z.boolean().default(true),
  expiresAt: z.string().datetime(),
  attendanceCount: z.number().int().min(0).default(0),
  createdAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
}).strict();

export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Course name required'),
  code: z.string().min(2, 'Course code required').toUpperCase(),
  department: z.string().min(1, 'Department is required'),
  credits: z.number().min(1).max(20).default(4),
  instructorId: z.string().uuid().optional(),
  instructor: z.string().optional(),
  semester: z.number().int().min(1).max(8).optional(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
}).strict();

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(3, 'Full name required'),
  email: z.string().email('Invalid institutional email'),
  role: z.enum(['student', 'faculty', 'college_admin', 'super_admin']).default('student'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  department: z.string().optional(),
  // Student Specific
  enrollmentNumber: z.string().optional(),
  semester: z.number().int().min(1).max(8).optional(),
  // Faculty Specific
  employeeId: z.string().optional(),
  designation: z.string().optional(),
  specialization: z.string().optional(),
  phone: z.string().optional(),
}).strict();

export const enrollmentSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().min(1, 'Student ID is required'),
  courseId: z.string().uuid('Invalid course ID'),
  courseName: z.string().min(1, 'Course name is required'),
  courseCode: z.string().min(1, 'Course code is required'),
  semester: z.number().int().min(1).max(8).optional(),
  batch: z.string().optional(),
  status: z.enum(['active', 'inactive', 'completed', 'withdrawn']).default('active'),
  enrolledAt: z.string().datetime().optional(),
}).strict();

export const hostelIssueSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Title is too short'),
  description: z.string().min(10, 'Description is too short'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high', 'emergency']),
  status: z.enum(['pending', 'assigned', 'resolved', 'closed']).default('pending'),
  roomNumber: z.string().min(1, 'Room number required'),
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().min(1, 'Student name required'),
  organizationId: z.string().optional(),
  responses: z.unknown().optional(),
  images: z.array(z.string()).optional(),
  slaDeadline: z.string().datetime().optional(),
  isEscalated: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
}).strict();

export const hostelOutpassSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().min(1, 'Student ID required'),
  studentName: z.string().optional(),
  hostelName: z.string().min(1, 'Hostel Name required'),
  roomNumber: z.string().min(1, 'Room Number required'),
  reason: z.string().min(5, 'Reason is required'),
  destination: z.string().min(3, 'Destination is required'),
  departureDate: z.string().datetime(),
  returnDate: z.string().datetime(),
  status: z.enum(['Pending', 'Approved', 'Rejected', 'Active', 'Completed']).default('Pending'),
  approvedBy: z.string().optional(),
  qrCode: z.string().optional(),
  evidenceUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
}).strict();

export const timetableSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  courseName: z.string().min(1, 'Course name required'),
  courseCode: z.string().min(1, 'Course code required'),
  facultyId: z.string().uuid().optional(),
  facultyName: z.string().optional(),
  day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time (HH:MM)'),
  room: z.string().min(1, 'Room required'),
  department: z.string().optional(),
  semester: z.number().int().min(1).max(8).optional(),
  batch: z.string().optional(),
}).strict();

export const examinationSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid('Invalid course ID'),
  examType: z.enum(['midterm', 'final', 'quiz', 'lab']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time (HH:MM)'),
  room: z.string().min(1, 'Room required'),
}).strict();

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type FacultyInput = z.infer<typeof facultySchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type AttendanceSessionInput = z.infer<typeof attendanceSessionSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
export type HostelIssueInput = z.infer<typeof hostelIssueSchema>;
export type HostelOutpassInput = z.infer<typeof hostelOutpassSchema>;
export type TimetableInput = z.infer<typeof timetableSchema>;
export type ExaminationInput = z.infer<typeof examinationSchema>;

export const academicCalendarEventSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  type: z.enum(['academic', 'holiday', 'exam', 'event']),
  isPublic: z.boolean().default(true),
}).strict();

export const canteenOrderSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid('Student ID is required'),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1, 'Order must contain at least one item'),
  totalAmount: z.number().min(0),
  status: z.enum(['pending', 'preparing', 'ready', 'delivered', 'cancelled']).default('pending'),
  instructions: z.string().optional(),
}).strict();

export const canteenItemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Item name is required'),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  image: z.string().optional(),
  isAvailable: z.boolean().default(true),
  stock: z.number().int().min(0).default(0),
}).strict();

export const campusMapRegionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Region name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  coordinates: z.array(z.object({
    lat: z.number(),
    lng: z.number(),
  })).min(3, 'Region must be a polygon with at least 3 points'),
  color: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, 'Must be a valid hex color').optional(),
}).strict();

export type AcademicCalendarEventInput = z.infer<typeof academicCalendarEventSchema>;
export type CanteenOrderInput = z.infer<typeof canteenOrderSchema>;
export type CanteenItemInput = z.infer<typeof canteenItemSchema>;
export type CampusMapRegionInput = z.infer<typeof campusMapRegionSchema>;
