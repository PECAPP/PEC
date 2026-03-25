import api from "@/lib/api";
import { ChatRoom } from "@/types/chat";

type ApiRoom = {
  id: string;
  name: string;
  isGroup: boolean;
  createdAt: string;
  participants?: Array<{
    userId: string;
    user?: {
      id: string;
      name?: string | null;
      fullName?: string | null;
      email?: string | null;
    };
  }>;
};

const SYSTEM_ROOM_NAMES = new Set(["Campus Community"]);

type ApiSuccess<T> = {
  success: true;
  data: T;
};

const unwrap = <T>(payload: T | ApiSuccess<T>): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in (payload as Record<string, unknown>) &&
    "data" in (payload as Record<string, unknown>)
  ) {
    return (payload as ApiSuccess<T>).data;
  }
  return payload as T;
};

const mapRoom = (room: ApiRoom, currentUserId: string): ChatRoom => {
  const participants = Array.isArray(room.participants)
    ? room.participants.map((p) => p.userId)
    : [];

  const participantNames = (room.participants || []).reduce<
    Record<string, string>
  >((acc, participant) => {
    if (participant.userId) {
      acc[participant.userId] =
        participant.user?.fullName ||
        participant.user?.name ||
        participant.user?.email ||
        participant.userId;
    }
    return acc;
  }, {});

  const isDm = !room.isGroup && participants.length <= 2;
  const isCommunityRoom = room.isGroup && SYSTEM_ROOM_NAMES.has(room.name);
  const dmOtherId = isDm
    ? participants.find((id) => id !== currentUserId)
    : undefined;
  const dmTitle = dmOtherId ? participantNames[dmOtherId] : "Direct Message";
  const roomType: ChatRoom["type"] = isDm
    ? "dm"
    : isCommunityRoom
      ? "general"
      : "group";

  return {
    id: room.id,
    type: roomType,
    title: isDm ? dmTitle : room.name,
    isSystem: isCommunityRoom,
    organizationId: "",
    participants,
    participantNames,
    members: participants,
    createdAt: room.createdAt,
  };
};

export async function fetchChatRooms(user: {
  uid: string;
  role: string;
  semester?: number;
  department?: string;
  organizationId: string;
}) {
  const res = await api.get<ApiRoom[] | ApiSuccess<ApiRoom[]>>("/chat/rooms");
  const data = unwrap(res.data);
  const rooms = Array.isArray(data) ? data : [];
  return rooms.map((room) => mapRoom(room, user.uid));
}

export type ChatSearchUser = {
  id: string;
  uid: string;
  email: string;
  fullName: string;
  role: string | null;
};

export async function fetchChatUsers(q?: string): Promise<ChatSearchUser[]> {
  const res = await api.get<
    Array<{ id: string; name?: string | null; email: string; role: string | null }> |
      ApiSuccess<Array<{ id: string; name?: string | null; email: string; role: string | null }>>
  >("/chat/users", {
    params: q ? { q } : undefined,
  });

  const users = unwrap(res.data);
  if (!Array.isArray(users)) return [];

  return users.map((user) => ({
    id: user.id,
    uid: user.id,
    email: user.email,
    fullName: user.name || user.email,
    role: user.role,
  }));
}

export async function findUserByEmail(email: string) {
  const normalized = email.toLowerCase().trim();
  const users = await fetchChatUsers(normalized);
  return users.find((user) => user.email.toLowerCase() === normalized) || null;
}

export async function createOrFindDMRoom(
  currentUserId: string,
  otherUserId: string,
  orgId: string,
) {
  const res = await api.post<ApiRoom | ApiSuccess<ApiRoom>>("/chat/room", {
    name: "DM",
    isGroup: false,
    userIds: [otherUserId],
  });
  return mapRoom(unwrap(res.data), currentUserId);
}

export async function createGroupRoom(options: {
  title: string;
  description?: string;
  organizationId: string;
  creatorId: string;
  members: string[];
  admins: string[];
}) {
  const memberIds = Array.from(new Set(options.members.filter(Boolean)));
  const res = await api.post<ApiRoom | ApiSuccess<ApiRoom>>("/chat/room", {
    name: options.title,
    isGroup: true,
    userIds: memberIds,
  });
  return mapRoom(unwrap(res.data), options.creatorId);
}

export async function updateGroupRoom(
  roomId: string,
  updates: Partial<ChatRoom>,
) {
  await api.patch(`/chat/room/${roomId}`, {
    name: updates.title,
  });
}

export async function deleteChatRoom(roomId: string) {
  await api.delete(`/chat/room/${roomId}`);
}

/**
 * @deprecated Use deleteChatRoom instead.
 */
export async function deleteGroupRoom(roomId: string) {
  return deleteChatRoom(roomId);
}
