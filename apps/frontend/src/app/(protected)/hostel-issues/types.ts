export interface HostelIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  roomNumber: string;
  studentId: string;
  studentName: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  responses?: { from: string; message: string; timestamp: string }[];
}
