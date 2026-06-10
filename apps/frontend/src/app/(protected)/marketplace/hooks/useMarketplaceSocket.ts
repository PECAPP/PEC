import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useMarketplaceSocket(activeChatId: string | null) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;

    // Use internal API URL if defined, else fallback to standard port
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    const socket = io(`${url}/marketplace-chat`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('newMessage', (msg: any) => {
      setLastMessage(msg);
    });

    socket.on('typing', (payload: { chatId: string; userId: string; isTyping: boolean }) => {
      if (payload.chatId === activeChatId) {
        setTypingUsers(prev => ({ ...prev, [payload.userId]: payload.isTyping }));
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user, activeChatId]);

  // Join chat when activeChatId changes
  useEffect(() => {
    if (activeChatId && socketRef.current?.connected) {
      socketRef.current.emit('joinChat', activeChatId);
    }
    return () => {
      if (activeChatId && socketRef.current?.connected) {
        socketRef.current.emit('leaveChat', activeChatId);
      }
    };
  }, [activeChatId, isConnected]);

  const emitTyping = useCallback((isTyping: boolean) => {
    if (activeChatId && socketRef.current?.connected) {
      socketRef.current.emit('typing', { chatId: activeChatId, isTyping });
    }
  }, [activeChatId]);

  return { socket: socketRef.current, isConnected, lastMessage, typingUsers, emitTyping };
}
