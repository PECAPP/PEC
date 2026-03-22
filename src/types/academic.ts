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

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: any;
  totalPoints: number;
  status: 'active' | 'archived';
  courseCode?: string;
  courseName?: string;
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
  credits?: number;
  type: 'midterm' | 'final' | 'assignment';
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head?: string;
  description?: string;
}
