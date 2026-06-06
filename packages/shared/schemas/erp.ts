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
});

export const facultySchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(3, 'Full name required'),
  email: z.string().email('Invalid institutional email'),
  department: z.string().min(1, 'Department is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  designation: z.string().min(1, 'Designation is required'),
  specialization: z.string().optional(),
  phone: z.string().regex(/^\+?[0-9- ]{10,15}$/, 'Invalid phone number').optional(),
});

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
});

export const AuthLoginSchema = z.object({
  email: z.string().email('Invalid institutional email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const AuthSignupSchema = z.object({
  fullName: z.string().min(3, 'Full name required'),
  email: z.string().email('Invalid institutional email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'faculty', 'college_admin']).default('student'),
});

export const AuthResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
    role: z.string(),
  }),
  token: z.string(),
});

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
});

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
});

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
});

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
});

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
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

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
}).passthrough();

export const examinationSchema = z.object({
  id: z.string().uuid().optional(),
  courseId: z.string().uuid('Invalid course ID'),
  examType: z.enum(['midterm', 'final', 'quiz', 'lab']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time (HH:MM)'),
  room: z.string().min(1, 'Room required'),
});

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type FacultyInput = z.infer<typeof facultySchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type AttendanceSessionInput = z.infer<typeof attendanceSessionSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
export type HostelIssueInput = z.infer<typeof hostelIssueSchema>;
export type TimetableInput = z.infer<typeof timetableSchema>;
export type ExaminationInput = z.infer<typeof examinationSchema>;

