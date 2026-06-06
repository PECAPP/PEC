export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  instructor: string;
  department: string;
  semester: number;
  status?: "ongoing" | "completed" | "upcoming";
  facultyName?: string;
  maxStudents?: number;
  enrolledStudents?: number;
  description?: string;
  type?: string;
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
  attendancePercentage: number;
  status: "active" | "graduated" | "suspended";
}



export interface Department {
  id: string;
  name: string;
  code: string;
  head?: string;
  description?: string;
}
