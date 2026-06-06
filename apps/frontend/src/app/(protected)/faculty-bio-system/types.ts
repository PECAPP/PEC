export interface Publication {
  id: string;
  facultyId: string;
  title: string;
  journal: string | null;
  conference: string | null;
  year: number;
  doi: string | null;
  url: string | null;
  abstract: string | null;
  citations: number;
  coAuthors: string | null;
  createdAt: string;
}

export interface Award {
  id: string;
  facultyId: string;
  title: string;
  description: string | null;
  awardedBy: string | null;
  year: number;
  category: string;
  createdAt: string;
}

export interface Conference {
  id: string;
  facultyId: string;
  name: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  role: string | null;
  presentationTitle: string | null;
  description: string | null;
  createdAt: string;
}

export interface Consultation {
  id: string;
  facultyId: string;
  organization: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  createdAt: string;
}

export interface FacultyProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string | null;
  employeeId: string;
  department: string;
  designation: string;
  phone: string | null;
  specialization: string | null;
  qualifications: string | null;
  bio: string | null;
}

export interface FullProfile {
  faculty: FacultyProfile | null;
  publications: Publication[];
  awards: Award[];
  conferences: Conference[];
  consultations: Consultation[];
  stats: {
    totalPublications: number;
    totalAwards: number;
    totalConferences: number;
    totalConsultations: number;
    totalCitations: number;
  };
}
