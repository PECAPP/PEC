import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, Menu, ArrowLeft, Info } from "lucide-react";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatInfoDialog } from "@/components/chat/ChatInfoDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/hooks/useAuth";
import { useChatRooms } from "@/hooks/useChatRooms";
import { useChatMessages } from "@/hooks/useChatMessages";

export default function ChatPage() {
  const { user } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  // rooms from Firestore
  const { rooms, loading: roomsLoading } = useChatRooms(user);

  // Read room from URL query params
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const roomFromUrl = queryParams.get('room');
  
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(roomFromUrl || "general");
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null);

  // Update selected room if URL changes
  useEffect(() => {
    if (roomFromUrl) setSelectedRoomId(roomFromUrl);
  }, [roomFromUrl]);

  // messages from Firestore (realtime)
  const {
    messages,
    loading: messagesLoading,
    sendMessage
  } = useChatMessages(selectedRoomId);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const inputRef = useRef<any>(null);

  // auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input when user starts typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input/textarea already, or if pressing special keys
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

      // Focus the input if a regular character is typed
      if (e.key.length === 1 && inputRef.current) {
        inputRef.current.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Function to scroll to a specific message
  const scrollToMessage = (messageId: string) => {
    const element = messageRefs.current[messageId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Highlight the message briefly
      element.style.backgroundColor = 'var(--primary)';
      element.style.opacity = '0.2';
      setTimeout(() => {
        element.style.backgroundColor = '';
        element.style.opacity = '';
      }, 1000);
    }
  };

  if (!user) return null;

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    setShowChatOnMobile(true); // On mobile, show the chat when a room is selected
  };

  const handleBackToList = () => {
    setShowChatOnMobile(false); // On mobile, go back to the room list
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-background">
      {/* Sidebar - hidden on mobile when chat is showing */}
      <div className={`${showChatOnMobile ? 'hidden lg:block' : 'block'} lg:block w-full lg:w-auto`}>
        <ChatSidebar
          rooms={rooms}
          selectedRoom={selectedRoomId ?? ""}
          onRoomChange={handleRoomSelect}
          userRole={user.role}
          userId={user.uid}
          loading={roomsLoading}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main chat area - hidden on mobile when showing room list */}
      <div className={`${showChatOnMobile ? 'flex' : 'hidden lg:flex'} flex-1 flex-col chat-main`}>
        {/* Chat header */}
        <div className="chat-navbar">
          <div className="flex items-center gap-3">
            {/* Mobile back button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={handleBackToList}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {selectedRoom && (
              <>
                <button
                  onClick={() => setIsInfoDialogOpen(true)}
                  className="flex items-center gap-2 hover:bg-secondary/50 px-3 py-2 rounded-lg transition-colors flex-1"
                >
                  <div className="flex-1 text-left">
                    <h2 className="text-lg font-semibold">{selectedRoom.title}</h2>
                    <div className="sm:block hidden">
                      <span className="text-xs text-muted-foreground">
                        {selectedRoom.type === "general" && "Everyone can view"}
                        {selectedRoom.type === "semester" &&
                          `Semester ${selectedRoom.semester} students`}
                        {selectedRoom.type === "department" &&
                          `${selectedRoom.department} department`}
                        {selectedRoom.type === "dm" && "Direct message"}
                      </span>
                    </div>
                  </div>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="chat-messages bg-gradient-to-b from-background/50 to-background">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 mb-6 shadow-inner">
                <MessageCircle className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">No messages yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Be the first to start the conversation! Say hi to get things going.
              </p>
            </div>
          ) : (
            <>
              {messages.map(msg => (
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
                      parentId: msg.parentId
                    }}
                    showSenderName={msg.senderId !== user.uid}
                    roomId={selectedRoomId}
                    onReply={(m) => setReplyingTo({ id: m.id, text: m.content, senderName: m.senderName })}
                    onReplyClick={() => msg.parentId && scrollToMessage(msg.parentId)}
                  />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* INPUT */}
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

      {/* Chat Info Dialog */}
      <ChatInfoDialog
        open={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
        room={selectedRoom || null}
        onRoomSelect={setSelectedRoomId}
      />
    </div>
  );
}
