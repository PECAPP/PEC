export type CgpaEntry = {
  id: string;
  courseId?: string;
  subjectName: string;
  courseCode: string;
  semester: number;
  credits: number;
  gradePoint: number;
  examDate: string;
  notes: string;
  createdAt: string;
};

export type CourseOption = {
  id: string;
  code: string;
  name: string;
  semester?: number;
  credits?: number;
};
