export type ChatRoomType = "general" | "semester" | "department" | "dm" | "group" | "club";
export interface ChatRoom {
    id: string;
    type: ChatRoomType;
    title: string;
    isSystem?: boolean;
    organizationId: string;
    semester?: number;
    department?: string;
    participants?: string[];
    participantNames?: {
        [userId: string]: string;
    };
    admins?: string[];
    members?: string[];
    description?: string;
    createdAt: any;
    createdBy?: string;
}
