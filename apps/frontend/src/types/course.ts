export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  facultyName: string;
  maxStudents: number;
  enrolledStudents: number;
  description?: string;
  type?: string;
  instructor?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  semester: number;
  status: 'active' | 'completed' | 'dropped';
  grade?: string;
  marks?: number;
}
