export interface Skill {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface WorkExperience {
  id: string;
  companyName: string;
  role: string;
  type: 'internship' | 'part-time' | 'full-time' | 'freelance';
  startDate: string;
  endDate?: string;
  isCurrentRole: boolean;
  description: string;
  location: string;
}

export interface EligibilityCriteria {
  minCgpa?: number;
  maxBacklogs?: number;
  allowedDepartments?: string[];
  allowedBatches?: string[];
  requiredSkills?: string[];
  minProjects?: number;
}

export interface InterviewRound {
  id: string;
  name: string;
  type: 'aptitude' | 'technical' | 'hr' | 'coding' | 'group-discussion' | 'other';
  description?: string;
  duration?: number;
  order: number;
}

export interface CompensationDetails {
  baseSalary: string;
  bonus?: string;
  joiningBonus?: string;
  stockOptions?: string;
  benefits?: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "internship";
  salary?: string;
  deadline: string;
  matchScore?: number;
}

export interface ExtendedJob {
  id: string;
  title: string;
  companyName: string;
  type: 'full-time' | 'internship' | 'part-time';
  salary: string;
  location: string;
  deadline: any;
  status: 'draft' | 'open' | 'closed' | 'filled';
  applicationsCount: number;
  tags: string[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string;
  status: 'applied' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'interviewed' | 'offered' | 'hired' | 'rejected' | 'withdrawn';
  appliedAt: any;
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  scheduledDate: any;
  startTime: string;
  endTime: string;
  mode: 'in-person' | 'video-call' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Offer {
  id: string;
  jobId: string;
  studentId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
  offeredAt: any;
}
