import api from "@/lib/api";

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
      r.type === "dm" && 
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

export async function fetchChatRooms(user: any) {
  try {
    const res = await api.get("/chat/rooms");
    const rooms = res.data?.data || res.data || [];
    
    // Map backend rooms to frontend ChatRoom type if needed
    return rooms.map((room: any) => ({
      id: room.id,
      title: room.name,
      type: room.isGroup ? "group" : "dm",
      description: room.description || "",
      participants: room.participants?.map((p: any) => p.userId || p) || [],
      participantNames: room.participants?.reduce((acc: any, p: any) => {
        if (p.user) acc[p.userId] = p.user.name;
        return acc;
      }, {}) || {},
      createdAt: room.createdAt,
      lastMessage: room.messages?.[0]?.content || "",
      unreadCount: 0
    }));
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
