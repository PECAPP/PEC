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
  const dmOtherId = isDm
    ? participants.find((id) => id !== currentUserId)
    : undefined;
  const dmTitle = dmOtherId ? participantNames[dmOtherId] : "Direct Message";

  return {
    id: room.id,
    type: isDm ? "dm" : "group",
    title: isDm ? dmTitle : room.name,
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
  const res = await api.get<ApiRoom[]>("/chat/rooms");
  const rooms = Array.isArray(res.data) ? res.data : [];
  return rooms.map((room) => mapRoom(room, user.uid));
}

export async function findUserByEmail(email: string) {
  const res = await api.get("/users/search", {
    params: { email },
    validateStatus: (status) => status === 200 || status === 404,
  });

  if (res.status === 404) return null;
  return res.data;
}

export async function createOrFindDMRoom(
  currentUserId: string,
  otherUserId: string,
  orgId: string,
) {
  const res = await api.post<ApiRoom>("/chat/room", {
    name: "DM",
    isGroup: false,
    userIds: [otherUserId],
  });
  return mapRoom(res.data, currentUserId);
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
  const res = await api.post<ApiRoom>("/chat/room", {
    name: options.title,
    isGroup: true,
    userIds: memberIds,
  });
  return mapRoom(res.data, options.creatorId);
}

export async function updateGroupRoom(
  roomId: string,
  updates: Partial<ChatRoom>,
) {
  await api.patch(`/chat/room/${roomId}`, {
    name: updates.title,
  });
}

export async function deleteGroupRoom(roomId: string) {
  await api.patch(`/chat/room/${roomId}`, {
    name: "[Archived] Group",
  });
}
