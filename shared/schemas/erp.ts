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
});

export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, 'Course name required'),
  code: z.string().min(2, 'Course code required').toUpperCase(),
  department: z.string().min(1, 'Department is required'),
  credits: z.number().min(1).max(20).default(4),
  instructorId: z.string().uuid().optional(),
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

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type FacultyInput = z.infer<typeof facultySchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type CourseInput = z.infer<typeof courseSchema>;
export type UserInput = z.infer<typeof userSchema>;
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;
