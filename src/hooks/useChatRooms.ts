import { useCallback, useEffect, useRef, useState } from "react";
import { ChatRoom } from "@/types/chat";
import { fetchChatRooms } from "@/lib/chatRooms.service";

export function useChatRooms(user: any) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const loadRooms = useCallback(async (expectedUserId?: string) => {
    const userId = expectedUserId ?? user?.uid;
    const requestId = ++requestIdRef.current;

    if (!user || !userId) {
      setRooms([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const nextRooms = await fetchChatRooms(user);
      if (requestIdRef.current === requestId && user?.uid === userId) {
        setRooms(nextRooms);
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const currentUserId = user?.uid;
    void loadRooms(currentUserId);

    return () => {
      requestIdRef.current += 1;
    };
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
