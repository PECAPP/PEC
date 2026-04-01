import { z } from 'zod';
/**
 * Shared Domain Schemas (Single Source of Truth)
 * used by both Next.js (frontend) and NestJS (backend).
 */
export declare const departmentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    code: z.ZodString;
    hod: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    code: string;
    id?: string | undefined;
    hod?: string | undefined;
    description?: string | undefined;
}, {
    name: string;
    code: string;
    id?: string | undefined;
    hod?: string | undefined;
    description?: string | undefined;
}>;
export declare const facultySchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    fullName: z.ZodString;
    email: z.ZodString;
    department: z.ZodString;
    employeeId: z.ZodString;
    designation: z.ZodString;
    specialization: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    department: string;
    employeeId: string;
    designation: string;
    id?: string | undefined;
    specialization?: string | undefined;
    phone?: string | undefined;
}, {
    fullName: string;
    email: string;
    department: string;
    employeeId: string;
    designation: string;
    id?: string | undefined;
    specialization?: string | undefined;
    phone?: string | undefined;
}>;
export declare const attendanceSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    studentId: z.ZodString;
    subject: z.ZodString;
    date: z.ZodString;
    status: z.ZodEnum<["present", "absent", "late"]>;
    remarks: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
    markedAt: z.ZodOptional<z.ZodString>;
    method: z.ZodDefault<z.ZodEnum<["qr", "manual"]>>;
    courseId: z.ZodOptional<z.ZodString>;
    facultyId: z.ZodOptional<z.ZodString>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "present" | "absent" | "late";
    studentId: string;
    subject: string;
    date: string;
    method: "qr" | "manual";
    id?: string | undefined;
    remarks?: string | undefined;
    sessionId?: string | undefined;
    markedAt?: string | undefined;
    courseId?: string | undefined;
    facultyId?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
}, {
    status: "present" | "absent" | "late";
    studentId: string;
    subject: string;
    date: string;
    id?: string | undefined;
    remarks?: string | undefined;
    sessionId?: string | undefined;
    markedAt?: string | undefined;
    method?: "qr" | "manual" | undefined;
    courseId?: string | undefined;
    facultyId?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
}>;
export declare const AuthLoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const AuthSignupSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["student", "faculty", "college_admin"]>>;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    password: string;
    role: "student" | "faculty" | "college_admin";
}, {
    fullName: string;
    email: string;
    password: string;
    role?: "student" | "faculty" | "college_admin" | undefined;
}>;
export declare const AuthResponseSchema: z.ZodObject<{
    user: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        fullName: z.ZodString;
        role: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        fullName: string;
        email: string;
        role: string;
    }, {
        id: string;
        fullName: string;
        email: string;
        role: string;
    }>;
    token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    };
    token: string;
}, {
    user: {
        id: string;
        fullName: string;
        email: string;
        role: string;
    };
    token: string;
}>;
export declare const attendanceSessionSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    facultyId: z.ZodString;
    courseId: z.ZodString;
    courseName: z.ZodString;
    date: z.ZodString;
    startTime: z.ZodString;
    qrCode: z.ZodString;
    active: z.ZodDefault<z.ZodBoolean>;
    expiresAt: z.ZodString;
    attendanceCount: z.ZodDefault<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodString>;
    endedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    date: string;
    courseId: string;
    facultyId: string;
    courseName: string;
    startTime: string;
    qrCode: string;
    active: boolean;
    expiresAt: string;
    attendanceCount: number;
    id?: string | undefined;
    createdAt?: string | undefined;
    endedAt?: string | undefined;
}, {
    date: string;
    courseId: string;
    facultyId: string;
    courseName: string;
    startTime: string;
    qrCode: string;
    expiresAt: string;
    id?: string | undefined;
    active?: boolean | undefined;
    attendanceCount?: number | undefined;
    createdAt?: string | undefined;
    endedAt?: string | undefined;
}>;
export declare const courseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    code: z.ZodString;
    department: z.ZodString;
    credits: z.ZodDefault<z.ZodNumber>;
    instructorId: z.ZodOptional<z.ZodString>;
    instructor: z.ZodOptional<z.ZodString>;
    semester: z.ZodOptional<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "archived"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    code: string;
    status: "active" | "inactive" | "archived";
    department: string;
    credits: number;
    id?: string | undefined;
    instructorId?: string | undefined;
    instructor?: string | undefined;
    semester?: number | undefined;
}, {
    name: string;
    code: string;
    department: string;
    id?: string | undefined;
    status?: "active" | "inactive" | "archived" | undefined;
    credits?: number | undefined;
    instructorId?: string | undefined;
    instructor?: string | undefined;
    semester?: number | undefined;
}>;
export declare const userSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    fullName: z.ZodString;
    email: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["student", "faculty", "college_admin", "super_admin"]>>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "suspended"]>>;
    department: z.ZodOptional<z.ZodString>;
    enrollmentNumber: z.ZodOptional<z.ZodString>;
    semester: z.ZodOptional<z.ZodNumber>;
    employeeId: z.ZodOptional<z.ZodString>;
    designation: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "suspended";
    fullName: string;
    email: string;
    role: "student" | "faculty" | "college_admin" | "super_admin";
    id?: string | undefined;
    department?: string | undefined;
    employeeId?: string | undefined;
    designation?: string | undefined;
    specialization?: string | undefined;
    phone?: string | undefined;
    semester?: number | undefined;
    enrollmentNumber?: string | undefined;
}, {
    fullName: string;
    email: string;
    id?: string | undefined;
    status?: "active" | "inactive" | "suspended" | undefined;
    department?: string | undefined;
    employeeId?: string | undefined;
    designation?: string | undefined;
    specialization?: string | undefined;
    phone?: string | undefined;
    role?: "student" | "faculty" | "college_admin" | "super_admin" | undefined;
    semester?: number | undefined;
    enrollmentNumber?: string | undefined;
}>;
export declare const enrollmentSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    studentId: z.ZodString;
    courseId: z.ZodString;
    courseName: z.ZodString;
    courseCode: z.ZodString;
    semester: z.ZodOptional<z.ZodNumber>;
    batch: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "completed", "withdrawn"]>>;
    enrolledAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "active" | "inactive" | "completed" | "withdrawn";
    studentId: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    id?: string | undefined;
    semester?: number | undefined;
    batch?: string | undefined;
    enrolledAt?: string | undefined;
}, {
    studentId: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    id?: string | undefined;
    status?: "active" | "inactive" | "completed" | "withdrawn" | undefined;
    semester?: number | undefined;
    batch?: string | undefined;
    enrolledAt?: string | undefined;
}>;
export declare const hostelIssueSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodString;
    priority: z.ZodEnum<["low", "medium", "high", "emergency"]>;
    status: z.ZodDefault<z.ZodEnum<["pending", "assigned", "resolved", "closed"]>>;
    roomNumber: z.ZodString;
    studentId: z.ZodString;
    studentName: z.ZodString;
    organizationId: z.ZodOptional<z.ZodString>;
    responses: z.ZodOptional<z.ZodUnknown>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description: string;
    status: "pending" | "assigned" | "resolved" | "closed";
    studentId: string;
    title: string;
    category: string;
    priority: "low" | "medium" | "high" | "emergency";
    roomNumber: string;
    studentName: string;
    id?: string | undefined;
    createdAt?: string | undefined;
    organizationId?: string | undefined;
    responses?: unknown;
    updatedAt?: string | undefined;
}, {
    description: string;
    studentId: string;
    title: string;
    category: string;
    priority: "low" | "medium" | "high" | "emergency";
    roomNumber: string;
    studentName: string;
    id?: string | undefined;
    status?: "pending" | "assigned" | "resolved" | "closed" | undefined;
    createdAt?: string | undefined;
    organizationId?: string | undefined;
    responses?: unknown;
    updatedAt?: string | undefined;
}>;
export declare const timetableSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    courseId: z.ZodOptional<z.ZodString>;
    courseName: z.ZodString;
    courseCode: z.ZodString;
    facultyId: z.ZodOptional<z.ZodString>;
    facultyName: z.ZodOptional<z.ZodString>;
    day: z.ZodEnum<["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]>;
    startTime: z.ZodString;
    endTime: z.ZodString;
    room: z.ZodString;
    department: z.ZodOptional<z.ZodString>;
    semester: z.ZodOptional<z.ZodNumber>;
    batch: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    courseName: string;
    startTime: string;
    courseCode: string;
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    endTime: string;
    room: string;
    id?: string | undefined;
    department?: string | undefined;
    courseId?: string | undefined;
    facultyId?: string | undefined;
    semester?: number | undefined;
    batch?: string | undefined;
    facultyName?: string | undefined;
}, {
    courseName: string;
    startTime: string;
    courseCode: string;
    day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
    endTime: string;
    room: string;
    id?: string | undefined;
    department?: string | undefined;
    courseId?: string | undefined;
    facultyId?: string | undefined;
    semester?: number | undefined;
    batch?: string | undefined;
    facultyName?: string | undefined;
}>;
export declare const examinationSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    courseId: z.ZodString;
    examType: z.ZodEnum<["midterm", "final", "quiz", "lab"]>;
    date: z.ZodString;
    startTime: z.ZodString;
    endTime: z.ZodString;
    room: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    courseId: string;
    startTime: string;
    endTime: string;
    room: string;
    examType: "midterm" | "final" | "quiz" | "lab";
    id?: string | undefined;
}, {
    date: string;
    courseId: string;
    startTime: string;
    endTime: string;
    room: string;
    examType: "midterm" | "final" | "quiz" | "lab";
    id?: string | undefined;
}>;
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
