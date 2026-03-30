import api from "@/lib/api";
import { ChatRoom } from "@/types/chat";

export async function findUserByEmail(email: string) {
  try {
    const res = await api.get("/chat/users", {
      params: { q: email }
    });
    const users = res.data?.data || res.data || [];
    // Find exact match
    return users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}

export async function createOrFindDMRoom(userId: string, otherUserId: string, organizationId: string) {
  // First, check if a DM already exists
  try {
    const res = await api.get("/chat/rooms");
    const rooms = res.data?.data || res.data || [];
    const existingDM = rooms.find((r: any) => 
      !r.isGroup &&
      r.participants?.includes(otherUserId) && 
      r.participants?.includes(userId)
    );

    if (existingDM) return existingDM;

    // Create new DM room
    const createRes = await api.post("/chat/room", {
      name: `DM between ${userId} and ${otherUserId}`,
      isGroup: false,
      userIds: [otherUserId]
    });
    
    return createRes.data?.data || createRes.data;
  } catch (error) {
    console.error("Error in createOrFindDMRoom:", error);
    throw error;
  }
}

export async function fetchChatUsers() {
  try {
    const res = await api.get("/chat/users", { params: { q: "" } });
    const data = res.data?.data || res.data || [];
    return data.map((u: any) => ({
      uid: u.id,
      fullName: u.name || u.email
    }));
  } catch (error) {
    console.error("Error fetching chat users:", error);
    return [];
  }
}

export async function fetchChatRooms(user: any): Promise<ChatRoom[]> {
  try {
    const res = await api.get("/chat/rooms");
    const rooms = res.data?.data || res.data || [];
    const uniqueRooms = (Array.isArray(rooms) ? rooms : []).filter(
      (room: any, index: number, arr: any[]) =>
        room?.id && arr.findIndex((candidate: any) => candidate?.id === room.id) === index,
    );

    const isDepartmentRoom = (name: string) => /timetable$/i.test(name.trim());
    const isCommunityRoom = (name: string) =>
      name.trim().toLowerCase() === "pec global announcements";
    
    // Map backend rooms to frontend ChatRoom type if needed
    return uniqueRooms.map((room: any): ChatRoom => {
      const roomName = String(room?.name || "").trim();
      const isClub = roomName.startsWith("CLUB::");
      const normalizedTitle = isClub
        ? roomName.replace("CLUB::", "").trim()
        : roomName;

      const type = !room.isGroup
        ? "dm"
        : isClub
          ? "club"
          : isCommunityRoom(roomName)
            ? "general"
            : isDepartmentRoom(roomName)
              ? "department"
              : "group";

      return {
        id: room.id,
        title: normalizedTitle,
        type,
        description: room.description || "",
        participants: room.participants?.map((p: any) => p.userId || p) || [],
        participantNames: room.participants?.reduce((acc: any, p: any) => {
          if (p.user) acc[p.userId] = p.user.name;
          return acc;
        }, {}) || {},
        department: type === "department" ? roomName.replace(/timetable$/i, "").trim() : undefined,
        createdAt: room.createdAt || new Date(),
        organizationId: room.organizationId || ""
      };
    });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    return [];
  }
}

export async function createGroupRoom(name: string, userIds: string[]) {
  try {
    const res = await api.post("/chat/room", {
      name,
      isGroup: true,
      userIds
    });
    return res.data?.data || res.data;
  } catch (error) {
    console.error("Error creating group room:", error);
    throw error;
  }
}

export async function deleteChatRoom(roomId: string) {
  try {
    await api.delete(`/chat/room/${roomId}`);
  } catch (error) {
    console.error("Error deleting chat room:", error);
    throw error;
  }
}
