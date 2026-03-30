export type ChatRoomType = "general" | "semester" | "department" | "dm" | "group";

// in @/types/chat.ts
export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  title: string;
  isSystem?: boolean;
  organizationId: string;
  semester?: number;
  department?: string;
  participants?: string[]; // For DM rooms
  participantNames?: { [userId: string]: string }; // For DM rooms
  admins?: string[]; // User IDs who can manage this group
  members?: string[]; // For groups - list of member IDs
  description?: string; // Group description
  createdAt: any;
  createdBy?: string; // Creator user ID
}
