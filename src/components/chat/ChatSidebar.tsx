import { Hash, Users, Building2, Search, Menu, Plus, MessageCircle } from "lucide-react";
import { ChatRoom } from "@/types/chat";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { CreateGroupDialog } from "@/components/chat/CreateGroupDialog";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Props {
  rooms: ChatRoom[];
  selectedRoom: string;
  onRoomChange: (id: string) => void;
  loading?: boolean;
  userRole: UserRole;
  userId?: string; // NEW: for DM name display
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function ChatSidebar({
  rooms,
  selectedRoom,
  onRoomChange,
  loading,
  userRole,
  userId,
  isMobileOpen = false,
  onMobileClose,
}: Props) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const isStudent = userRole === "student";
  const isChatAdmin = userRole === "college_admin";

  // Helper: Get display title for DMs (show other person's name)
  const getRoomDisplayTitle = (room: ChatRoom): string => {
    if (room.type === "dm" && room.participants && room.participantNames && userId) {
      const otherUserId = room.participants.find(id => id !== userId);
      if (otherUserId && room.participantNames[otherUserId]) {
        return String(room.participantNames[otherUserId]);
      }
    }
    return room.title ?? "";
  };

  // Filter rooms based on search
  const filteredRooms = rooms.filter((room) =>
    room && getRoomDisplayTitle(room).toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  const dmRooms = filteredRooms.filter((r) => r.type === "dm");
  const communityRooms = filteredRooms.filter((r) => r.type === "general");
  const departmentRooms = filteredRooms.filter((r) => r.type === "department");
  const clubRooms =
    userRole === "faculty"
      ? []
      : filteredRooms.filter((r) => r.type === "club");
  const groupRooms = filteredRooms.filter(
    (r) => r.type === "group" || r.type === "semester"
  );

  const handleRoomClick = (roomId: string) => {
    onRoomChange(roomId);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const getRoomIcon = (type: string) => {
    switch (type) {
      case "general":
        return Users;
      case "department":
        return Building2;
      case "semester":
        return Hash;
      case "group":
        return Users;
      case "dm":
        return MessageCircle;
      default:
        return Hash;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className="chat-sidebar w-full lg:w-80 bg-card border-r border-border flex flex-col h-full"
      >
        {/* Search header */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {!isChatAdmin && (
              <>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setIsCreateGroupOpen(true)}
                  title="Create new group"
                >
                  <Users className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="default"
                  onClick={() => setIsNewChatOpen(true)}
                  title="Start new DM"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Rooms list */}
        <div className="flex-1 overflow-y-auto chat-sidebar-list">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
              Loading chats...
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {/* Direct Messages */}
              {dmRooms.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Direct Messages
                  </div>
                  {dmRooms.map((room) => {
                    const Icon = MessageCircle;
                    return (
                      <button
                        key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        className={cn(
                          "chat-room-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left",
                          selectedRoom === room.id
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate text-sm">{getRoomDisplayTitle(room)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Community */}
              {communityRooms.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Community
                  </div>
                  {communityRooms.map((room) => {
                    const Icon = getRoomIcon(room.type);
                    return (
                      <button
                        key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        className={cn(
                          "chat-room-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left",
                          selectedRoom === room.id
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate text-sm">{room.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Department Groups */}
              {departmentRooms.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Department Groups
                  </div>
                  {departmentRooms.map((room) => {
                    const Icon = getRoomIcon(room.type);
                    return (
                      <button
                        key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        className={cn(
                          "chat-room-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left",
                          selectedRoom === room.id
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                        )}
                      >
                          <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate text-sm">{room.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Club Groups */}
              {clubRooms.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Club Groups
                  </div>
                  {clubRooms.map((room) => {
                    const Icon = getRoomIcon(room.type);
                    return (
                      <button
                        key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        className={cn(
                          "chat-room-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left",
                          selectedRoom === room.id
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate text-sm">{room.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Groups */}
              {groupRooms.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                    Groups
                  </div>
                  {groupRooms.map((room) => {
                    const Icon = getRoomIcon(room.type);
                    return (
                      <button
                        key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        className={cn(
                          "chat-room-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left",
                          selectedRoom === room.id
                            ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                            : "text-foreground/70 hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate text-sm">{room.title}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {filteredRooms.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                  <p className="text-sm text-muted-foreground">No chats found</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-xs text-primary mt-2 hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Debug/Role Indicator */}
        <div className="p-2 border-t border-border bg-muted/20">
          <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-mono">
            {userRole || "Guest"} View
          </p>
        </div>
      </aside>

      {/* New Chat Dialog */}
      <NewChatDialog
        open={isNewChatOpen}
        onOpenChange={setIsNewChatOpen}
        onRoomCreated={onRoomChange}
      />

      {/* Create Group Dialog */}
      {user && (
        <CreateGroupDialog
          open={isCreateGroupOpen}
          onOpenChange={setIsCreateGroupOpen}
          onGroupCreated={onRoomChange}
          currentUser={{
            uid: user.uid,
            organizationId: user.organizationId
          }}
        />
      )}
    </>
  );
}
