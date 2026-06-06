import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, subscribeToMessages, sendMessage as apiSendMessage, sendMediaMessage as apiSendMedia } from '@/lib/messages.service';

export function useChatMessages(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [limit, setLimit] = useState(20);
  const lastRoomId = useRef<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Subscribe to messages (polling)
    const unsubscribe = subscribeToMessages(roomId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
      // If we got fewer than the limit, there are no more messages (simplistic check for polling)
      if (newMessages.length < limit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    }, limit);

    return () => {
      unsubscribe();
    };
  }, [roomId, limit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setLimit(prev => prev + 20);
    }
  }, [loading, hasMore]);

  const sendMessage = useCallback(async (roomId: string, text: string, metadata?: any) => {
    await apiSendMessage(roomId, text, metadata);
  }, []);

  const sendMedia = useCallback(async (roomId: string, mediaUrl: string, type: any, options?: any) => {
    await apiSendMedia(roomId, mediaUrl, type, options);
  }, []);

  return {
    messages,
    loading,
    hasMore,
    loadMore,
    sendMessage,
    sendMedia,
  };
}
