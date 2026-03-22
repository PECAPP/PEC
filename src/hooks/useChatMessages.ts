import { useEffect, useState } from "react";
import {
  ChatMessage,
  subscribeToMessages,
  sendMessage
} from "@/lib/messages.service";

export function useChatMessages(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [limitCount, setLimitCount] = useState(20);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    // When room changes, reset limit
    setLimitCount(20);

    const unsub = subscribeToMessages(roomId, msgs => {
      setMessages(msgs);
      setLoading(false);
    }, 20); // Initial subscription with default limit

    return () => unsub();
  }, [roomId]);

  // Handle limit updates separately to avoid resetting loading state too aggressively
  useEffect(() => {
    if (!roomId) return;
    
    // If limit is practically 20 (initial), handled by above effect. 
    // This effect handles upgrades.
    if (limitCount === 20) return;

    const unsub = subscribeToMessages(roomId, msgs => {
      setMessages(msgs);
    }, limitCount);

    return () => unsub();
  }, [roomId, limitCount]);

  const loadMore = () => {
    setLimitCount(prev => prev + 20);
  };

  return {
    messages,
    loading,
    sendMessage,
    loadMore,
    hasMore: messages.length >= limitCount // Heuristic: if we got less than requested, we reached end
  };
}
