import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, sendMessage as apiSendMessage, sendMediaMessage as apiSendMedia, toChatMessage } from '@/lib/messages.service';
import { useSocket } from '@/providers/socket-provider';
import api from '@pec/api';

export function useChatMessages(roomId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [limit, setLimit] = useState(20);
  const _lastRoomId = useRef<string | null>(null);

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages/${roomId}`, { params: { limit } });
        if (!isMounted) return;
        const data = res.data && typeof res.data === 'object' && 'data' in res.data ? (res.data as any).data : res.data;
        const mapped = Array.isArray(data) ? data.map(toChatMessage) : [];
        setMessages(mapped);
        setHasMore(mapped.length >= limit);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();

    // Socket event listeners
    if (socket && isConnected) {
      const handleNewMessage = (msg: any) => {
        if (msg.chatRoomId === roomId) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, toChatMessage(msg)];
          });
        }
      };

      const handleMessageDeleted = ({ messageId, roomId: eventRoomId }: { messageId: string, roomId: string }) => {
        if (eventRoomId === roomId) {
          setMessages(prev => prev.filter(m => m.id !== messageId));
        }
      };

      const handleMessageEdited = (msg: any) => {
        if (msg.chatRoomId === roomId) {
          setMessages(prev => prev.map(m => m.id === msg.id ? toChatMessage(msg) : m));
        }
      };

      socket.on('newMessage', handleNewMessage);
      socket.on('messageDeleted', handleMessageDeleted);
      socket.on('messageEdited', handleMessageEdited);

      return () => {
        isMounted = false;
        socket.off('newMessage', handleNewMessage);
        socket.off('messageDeleted', handleMessageDeleted);
        socket.off('messageEdited', handleMessageEdited);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [roomId, limit, socket, isConnected]);

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

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    await api.patch(`/chat/message/${messageId}`, { content: newContent });
  }, []);

  return {
    messages,
    loading,
    hasMore,
    loadMore,
    sendMessage,
    sendMedia,
    editMessage,
  };
}
