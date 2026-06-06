import { useCallback, useEffect, useRef, useState } from "react";
import { ChatRoom } from "@/types/chat";
import { fetchChatRooms } from "@/lib/chatRooms.service";

export function useChatRooms(user: any, initialRooms?: ChatRoom[]) {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms || []);
  const [loading, setLoading] = useState(!initialRooms);
  const requestIdRef = useRef(0);

  const userId = user?.uid;

  const loadRooms = useCallback(async (expectedUserId?: string) => {
    // If we have initial rooms and it's the first run, we skip fetching
    if (initialRooms && rooms.length > 0 && loading === false) {
       // but we still want to fetch once eventually if it was server-only data
       // For simplicity, let's just let it run if it's the first time
    }
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
      const uniqueRooms = nextRooms.filter(
        (room, index, arr) => arr.findIndex((candidate) => candidate.id === room.id) === index,
      );
      if (requestIdRef.current === requestId && user?.uid === userId) {
        setRooms(uniqueRooms);
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    void loadRooms(userId);

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadRooms, userId]);

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
