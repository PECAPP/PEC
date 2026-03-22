import api from "@/lib/api";

export async function addMemberToGroup(roomId: string, userEmail: string) {
  const search = await api.get("/users/search", {
    params: { email: userEmail.toLowerCase().trim() },
    validateStatus: (status) => status === 200 || status === 404,
  });

  if (search.status === 404 || !search.data?.uid) {
    throw new Error("User not found");
  }

  await api.post(`/chat/room/${roomId}/participants`, {
    userId: search.data.uid,
  });

  return {
    userId: search.data.uid,
    userName: search.data.fullName || search.data.name || search.data.email,
  };
}

export async function removeMemberFromGroup(roomId: string, userId: string) {
  await api.delete(`/chat/room/${roomId}/participants/${userId}`);
}

export async function makeUserAdmin(roomId: string, userId: string) {
  return;
}

export async function removeUserAdmin(roomId: string, userId: string) {
  return;
}

export async function updateGroupInfo(
  roomId: string,
  data: { title?: string; description?: string },
) {
  await api.patch(`/chat/room/${roomId}`, {
    name: data.title,
  });
}

export async function getMemberDetails(userIds: string[]) {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  const users = await Promise.all(
    userIds.map(async (uid) => {
      try {
        const { data } = await api.get(`/users/${uid}`);
        return {
          uid,
          fullName: data?.fullName || data?.name || data?.email,
          email: data?.email,
          role: data?.role,
        };
      } catch {
        return null;
      }
    }),
  );

  return users.filter(Boolean);
}

export async function getMembersForGroup(room: {
  id?: string;
  type: string;
  semester?: number;
  department?: string;
  organizationId: string;
  members?: string[];
  participants?: string[];
}) {
  if (!room.id) {
    const ids = room.members || room.participants || [];
    return getMemberDetails(ids);
  }

  try {
    const { data } = await api.get(`/chat/room/${room.id}/participants`);
    return Array.isArray(data) ? data : [];
  } catch {
    const ids = room.members || room.participants || [];
    return getMemberDetails(ids);
  }
}
