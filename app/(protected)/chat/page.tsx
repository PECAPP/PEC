'use client';

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import { MessageCircle, ArrowLeft, Info } from "lucide-react";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatInfoDialog } from "@/components/chat/ChatInfoDialog";
import { Button } from "@/components/ui/button";
import { EmptyState, StatePanel } from "@/components/common/AsyncState";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useChatRooms } from "@/hooks/useChatRooms";
import { useChatMessages } from "@/hooks/useChatMessages";

export default function ChatPage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  const { rooms, loading: roomsLoading } = useChatRooms(user);

  const searchParams = useSearchParams();
  const roomFromUrl = searchParams.get('room');

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(roomFromUrl || null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null);

  useEffect(() => {
    if (roomFromUrl) {
      setSelectedRoomId(roomFromUrl);
      return;
    }

    if (!roomsLoading && selectedRoomId && !rooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(rooms.length > 0 ? rooms[0].id : null);
      return;
    }

    if (!selectedRoomId && rooms.length > 0) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [roomFromUrl, rooms, roomsLoading, selectedRoomId]);

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    loadMore,
    hasMore,
  } = useChatMessages(selectedRoomId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const inputRef = useRef<any>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  useEffect(() => {
    const behavior = messagesLoading ? "auto" : "smooth";
    if (!isAutoScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    }
  }, [messages, messagesLoading, isAutoScrolling]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && hasMore && !messagesLoading) {
      setIsAutoScrolling(true);
      loadMore();
    } else {
      setIsAutoScrolling(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        ['Escape', 'Tab', 'Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)
      ) {
        return;
      }

      if (e.key.length === 1 && inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const scrollToMessage = (messageId: string) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.style.backgroundColor = 'var(--primary)';
      element.style.opacity = '0.2';
      setTimeout(() => {
        element.style.backgroundColor = '';
        element.style.opacity = '';
      }, 1000);
    }
  };

  if (!user) return null;

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setShowChatOnMobile(true);
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] bg-background md:rounded-md md:border md:border-border overflow-hidden">
      <div className={`${showChatOnMobile ? 'hidden lg:block' : 'block'} lg:block w-full lg:w-auto`}>
        <ChatSidebar
          rooms={rooms}
          selectedRoom={selectedRoomId ?? ""}
          onRoomChange={handleRoomSelect}
          userRole={(user.role as any) || 'student'}
          userId={user.uid}
          loading={roomsLoading}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      <div className={`${showChatOnMobile ? 'flex' : 'hidden lg:flex'} flex-1 flex-col chat-main`}>
        <div className="chat-navbar">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={handleBackToList}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {selectedRoom && (
              <button
                onClick={() => setIsInfoDialogOpen(true)}
                className="flex items-center gap-2 hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors flex-1"
              >
                <div className="flex-1 text-left">
                  <h2 className="text-lg font-semibold">{selectedRoom.title}</h2>
                  <div className="sm:block hidden">
                    <span className="text-xs text-muted-foreground">
                      {selectedRoom.type === "general" && "Everyone can view"}
                      {selectedRoom.type === "semester" && `Semester ${selectedRoom.semester} students`}
                      {selectedRoom.type === "department" && `${selectedRoom.department} department`}
                      {selectedRoom.type === "dm" && "Direct message"}
                      {selectedRoom.type === "group" && "Private group"}
                    </span>
                  </div>
                </div>
                <Info className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="chat-messages bg-background overflow-y-auto" onScroll={handleScroll}>
          {messagesLoading ? (
            <div className="h-full flex items-center justify-center p-4">
              <StatePanel
                title="Loading messages"
                description="Fetching latest conversation…"
                className="w-full max-w-sm"
              />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <EmptyState
                title="No messages yet"
                description="Start the conversation by sending the first message."
                className="w-full max-w-sm"
              />
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} ref={(el) => { messageRefs.current[msg.id] = el; }}>
                  <ChatMessage
                    message={{
                      id: msg.id,
                      content: msg.text,
                      senderId: msg.senderId,
                      senderName: msg.senderId === user.uid ? "You" : (msg.senderName || "Unknown User"),
                      timestamp: msg.createdAt?.toDate?.() ?? new Date(),
                      isOwn: msg.senderId === user.uid,
                      type: msg.type || "text",
                      mediaUrl: msg.mediaUrl,
                      fileName: msg.fileName,
                      fileSize: msg.fileSize,
                      mentions: msg.mentions,
                      replyTo: msg.replyTo,
                      parentId: msg.parentId,
                      starredBy: msg.starredBy,
                      deletedAt: msg.deletedAt,
                    }}
                    showSenderName={msg.senderId !== user.uid}
                    roomId={selectedRoomId || ''}
                    onReply={(message) =>
                      setReplyingTo({
                        id: message.id,
                        text: message.content,
                        senderName: message.senderName,
                      })
                    }
                    onReplyClick={() => msg.parentId && scrollToMessage(msg.parentId)}
                  />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {selectedRoomId && (
          <ChatInput
            ref={inputRef}
            onSend={(text, metadata) => sendMessage(selectedRoomId, text, metadata)}
            placeholder={`Message #${selectedRoom?.title ?? "chat"}...`}
            roomId={selectedRoomId}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        )}
      </div>

      <ChatInfoDialog
        open={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
        room={selectedRoom || null}
        onRoomSelect={setSelectedRoomId}
      />
    </div>
  );
}
