import { useCallback, useEffect, useState } from "react";
import { ChatRoom } from "@/types/chat";
import { fetchChatRooms } from "@/lib/chatRooms.service";

export function useChatRooms(user: any) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = useCallback(async () => {
    if (!user) {
      setRooms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    await fetchChatRooms(user)
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    const handleRoomsUpdated = () => {
      void loadRooms();
    };

    window.addEventListener("chat-rooms-updated", handleRoomsUpdated);
    return () => {
      window.removeEventListener("chat-rooms-updated", handleRoomsUpdated);
    };
  }, [loadRooms]);

  return { rooms, loading, refreshRooms: loadRooms };
}
