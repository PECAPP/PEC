export type Course = {
  id: string;
  code: string;
  name: string;
  department?: string | null;
};

export type Department = {
  id: string;
  name: string;
};

export type ExamSchedule = {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  department?: string | null;
  examType: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
};
