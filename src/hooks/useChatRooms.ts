import { useEffect, useState } from "react";
import { ChatRoom } from "@/types/chat";
import { fetchChatRooms } from "@/lib/chatRooms.service";

export function useChatRooms(user: any) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    fetchChatRooms(user)
      .then(setRooms)
      .finally(() => setLoading(false));
  }, [user]);

  return { rooms, loading };
}
