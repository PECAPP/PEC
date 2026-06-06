export type UserRole = 'student' | 'faculty' | 'college_admin' | 'super_admin' | 'auditor' | 'officer';
export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    department?: string;
    enrollmentNumber?: string;
    semester?: number;
    profileComplete?: boolean;
    avatarUrl?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
export interface Course {
    id: string;
    code: string;
    name: string;
    department: string;
    semester: number;
    credits: number;
    instructor?: string;
    facultyName?: string;
    maxStudents: number;
    currentStudents?: number;
    description?: string;
    status: 'active' | 'inactive' | 'archived';
    createdAt?: string | Date;
    updatedAt?: string | Date;
}
export interface DashboardStats {
    totalStudents: number;
    totalFaculty: number;
    totalCourses: number;
    totalDepartments?: number;
    activeUsers?: number;
    pendingRequests?: number;
}
export interface AdminDashboardData {
    stats: DashboardStats;
    courses: Course[];
    users: User[];
}
