import { z } from 'zod';

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

export type DepartmentInput = z.infer<typeof departmentSchema>;
export type FacultyInput = z.infer<typeof facultySchema>;

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().email(),
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
});
export type UserInput = z.infer<typeof userSchema>;

export const courseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  code: z.string().min(2)
});
export type CourseInput = z.infer<typeof courseSchema>;

export const enrollmentSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string(),
  courseId: z.string(),
  status: z.string().optional()
});
export type EnrollmentInput = z.infer<typeof enrollmentSchema>;

export const attendanceSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string(),
  courseId: z.string(),
  date: z.string().or(z.date()).optional(),
  status: z.string()
});
export type AttendanceInput = z.infer<typeof attendanceSchema>;
