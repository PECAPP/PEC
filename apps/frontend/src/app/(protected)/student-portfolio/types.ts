export interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  techStack: string;
  githubUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isFeatured: boolean;
  createdAt: string;
}

export interface Skill {
  id: string;
  studentId: string;
  name: string;
  level: number;
  category: string;
}
