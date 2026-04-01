"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.examinationSchema = exports.timetableSchema = exports.hostelIssueSchema = exports.enrollmentSchema = exports.userSchema = exports.courseSchema = exports.attendanceSessionSchema = exports.AuthResponseSchema = exports.AuthSignupSchema = exports.AuthLoginSchema = exports.attendanceSchema = exports.facultySchema = exports.departmentSchema = void 0;
const zod_1 = require("zod");
/**
 * Shared Domain Schemas (Single Source of Truth)
 * used by both Next.js (frontend) and NestJS (backend).
 */
exports.departmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(3, 'Name must be at least 3 characters'),
    code: zod_1.z.string().min(2, 'Code must be at least 2 characters').toUpperCase(),
    hod: zod_1.z.string().optional(),
    description: zod_1.z.string().max(500, 'Description too long').optional(),
});
exports.facultySchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    fullName: zod_1.z.string().min(3, 'Full name required'),
    email: zod_1.z.string().email('Invalid institutional email'),
    department: zod_1.z.string().min(1, 'Department is required'),
    employeeId: zod_1.z.string().min(1, 'Employee ID is required'),
    designation: zod_1.z.string().min(1, 'Designation is required'),
    specialization: zod_1.z.string().optional(),
    phone: zod_1.z.string().regex(/^\+?[0-9- ]{10,15}$/, 'Invalid phone number').optional(),
});
exports.attendanceSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    studentId: zod_1.z.string().uuid('Invalid student ID'),
    subject: zod_1.z.string().min(1, 'Course ID/Subject is required'),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    status: zod_1.z.enum(['present', 'absent', 'late']),
    remarks: zod_1.z.string().max(200).optional(),
    sessionId: zod_1.z.string().uuid().optional(),
    markedAt: zod_1.z.string().datetime().optional(),
    method: zod_1.z.enum(['qr', 'manual']).default('manual'),
    courseId: zod_1.z.string().optional(),
    facultyId: zod_1.z.string().uuid().optional(),
    lat: zod_1.z.number().optional(),
    lng: zod_1.z.number().optional(),
});
exports.AuthLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid institutional email'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.AuthSignupSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(3, 'Full name required'),
    email: zod_1.z.string().email('Invalid institutional email'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['student', 'faculty', 'college_admin']).default('student'),
});
exports.AuthResponseSchema = zod_1.z.object({
    user: zod_1.z.object({
        id: zod_1.z.string(),
        email: zod_1.z.string(),
        fullName: zod_1.z.string(),
        role: zod_1.z.string(),
    }),
    token: zod_1.z.string(),
});
exports.attendanceSessionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    facultyId: zod_1.z.string().uuid('Invalid faculty ID'),
    courseId: zod_1.z.string().min(1, 'Course ID is required'),
    courseName: zod_1.z.string().min(1, 'Course name is required'),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Invalid start time (HH:MM or HH:MM:SS)'),
    qrCode: zod_1.z.string().min(1, 'QR code is required'),
    active: zod_1.z.boolean().default(true),
    expiresAt: zod_1.z.string().datetime(),
    attendanceCount: zod_1.z.number().int().min(0).default(0),
    createdAt: zod_1.z.string().datetime().optional(),
    endedAt: zod_1.z.string().datetime().optional(),
});
exports.courseSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(3, 'Course name required'),
    code: zod_1.z.string().min(2, 'Course code required').toUpperCase(),
    department: zod_1.z.string().min(1, 'Department is required'),
    credits: zod_1.z.number().min(1).max(20).default(4),
    instructorId: zod_1.z.string().uuid().optional(),
    instructor: zod_1.z.string().optional(),
    semester: zod_1.z.number().int().min(1).max(8).optional(),
    status: zod_1.z.enum(['active', 'inactive', 'archived']).default('active'),
});
exports.userSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    fullName: zod_1.z.string().min(3, 'Full name required'),
    email: zod_1.z.string().email('Invalid institutional email'),
    role: zod_1.z.enum(['student', 'faculty', 'college_admin', 'super_admin']).default('student'),
    status: zod_1.z.enum(['active', 'inactive', 'suspended']).default('active'),
    department: zod_1.z.string().optional(),
    // Student Specific
    enrollmentNumber: zod_1.z.string().optional(),
    semester: zod_1.z.number().int().min(1).max(8).optional(),
    // Faculty Specific
    employeeId: zod_1.z.string().optional(),
    designation: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
});
exports.enrollmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    studentId: zod_1.z.string().min(1, 'Student ID is required'),
    courseId: zod_1.z.string().uuid('Invalid course ID'),
    courseName: zod_1.z.string().min(1, 'Course name is required'),
    courseCode: zod_1.z.string().min(1, 'Course code is required'),
    semester: zod_1.z.number().int().min(1).max(8).optional(),
    batch: zod_1.z.string().optional(),
    status: zod_1.z.enum(['active', 'inactive', 'completed', 'withdrawn']).default('active'),
    enrolledAt: zod_1.z.string().datetime().optional(),
});
exports.hostelIssueSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    title: zod_1.z.string().min(3, 'Title is too short'),
    description: zod_1.z.string().min(10, 'Description is too short'),
    category: zod_1.z.string().min(1, 'Category is required'),
    priority: zod_1.z.enum(['low', 'medium', 'high', 'emergency']),
    status: zod_1.z.enum(['pending', 'assigned', 'resolved', 'closed']).default('pending'),
    roomNumber: zod_1.z.string().min(1, 'Room number required'),
    studentId: zod_1.z.string().min(1, 'Student ID required'),
    studentName: zod_1.z.string().min(1, 'Student name required'),
    organizationId: zod_1.z.string().optional(),
    responses: zod_1.z.unknown().optional(),
    createdAt: zod_1.z.string().datetime().optional(),
    updatedAt: zod_1.z.string().datetime().optional(),
});
exports.timetableSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    courseId: zod_1.z.string().uuid().optional(),
    courseName: zod_1.z.string().min(1, 'Course name required'),
    courseCode: zod_1.z.string().min(1, 'Course code required'),
    facultyId: zod_1.z.string().uuid().optional(),
    facultyName: zod_1.z.string().optional(),
    day: zod_1.z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time (HH:MM)'),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time (HH:MM)'),
    room: zod_1.z.string().min(1, 'Room required'),
    department: zod_1.z.string().optional(),
    semester: zod_1.z.number().int().min(1).max(8).optional(),
    batch: zod_1.z.string().optional(),
});
exports.examinationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    courseId: zod_1.z.string().uuid('Invalid course ID'),
    examType: zod_1.z.enum(['midterm', 'final', 'quiz', 'lab']),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid start time (HH:MM)'),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid end time (HH:MM)'),
    room: zod_1.z.string().min(1, 'Room required'),
});
