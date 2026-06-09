export type VerificationStatus =
  | "idle"
  | "loading"
  | "verified"
  | "possible_match"
  | "not_found";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
  publisher: string;
  year: number;
}

export interface BookBorrow {
  id: string;
  userId: string;
  bookId: string;
  borrowDate: Date | string;
  dueDate: Date | string;
  returnDate?: Date | string;
  status: "borrowed" | "returned" | "overdue";
  fine?: number;
}

export interface Room {
  id: string;
  name: string;
  type: "classroom" | "lab" | "meeting-room" | "auditorium";
  capacity: number;
  building: string;
  floor: number;
  facilities: string[];
  location?: string;
  isAvailable?: boolean;
}

export interface RoomBooking {
  id: string;
  roomId: string;
  userId: string;
  title: string;
  startTime: Date | string;
  endTime: Date | string;
  date: string;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "completed";
}

export interface Leave {
  id: string;
  userId: string;
  userName?: string;
  leaveTypeId: string;
  startDate: Date | string;
  endDate: Date | string;
  status: "pending" | "approved" | "rejected";
}

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  president: string;
  members: string[];
  totalMembers: number;
}

export interface HostelComplaint {
  id: string;
  userId: string;
  room: string;
  category: string;
  description: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: Date | string;
}

export interface Todo {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}
