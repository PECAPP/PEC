import { useState, useEffect } from "react";
import { 
  Users, 
  Crown, 
  UserPlus, 
  UserMinus, 
  Edit, 
  X,
  Mail,
  Calendar,
  Hash,
  MessageCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatRoom } from "@/types/chat";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { 
  getMembersForGroup,
  addMemberToGroup, 
  removeMemberFromGroup,
  makeUserAdmin,
  removeUserAdmin,
  updateGroupInfo
} from "@/lib/chatManagement.service";
import { createOrFindDMRoom, deleteChatRoom } from "@/lib/chatRooms.service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: ChatRoom | null;
  onRoomSelect?: (roomId: string) => void; // NEW: Callback to switch to a DM
}

export function ChatInfoDialog({ open, onOpenChange, room, onRoomSelect }: Props) {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const isDM = room?.type === "dm";
  const userRole = user?.role as string;
  const isAdmin = room?.admins?.includes(user?.uid || "") || userRole === "admin" || userRole === "college_admin";
  const canDeleteRoom = !!room && (isDM || (room.type === "group" && !room.isSystem && isAdmin));

  useEffect(() => {
    if (room && open && !isDM) {
      loadMembers();
    }
    if (room) {
      setEditTitle(room.title);
      setEditDescription(room.description || "");
    }
  }, [room, open]);

  const loadMembers = async () => {
    if (!room) return;
    setIsLoading(true);
    try {
      const memberData = await getMembersForGroup(room);
      // Sort members alphabetically by name
      const sortedMembers = memberData.sort((a, b) => {
        const nameA = a.fullName || a.email || "";
        const nameB = b.fullName || b.email || "";
        return nameA.localeCompare(nameB);
      });
      setMembers(sortedMembers);
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!room || !newMemberEmail.trim()) return;
    
    setIsLoading(true);
    try {
      await addMemberToGroup(room.id, newMemberEmail);
      toast.success("Member added successfully");
      setNewMemberEmail("");
      await loadMembers();
    } catch (error: any) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!room) return;
    
    try {
      await removeMemberFromGroup(room.id, userId);
      toast.success("Member removed");
      await loadMembers();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    if (!room) return;
    
    try {
      if (isCurrentlyAdmin) {
        await removeUserAdmin(room.id, userId);
        toast.success("Admin removed");
      } else {
        await makeUserAdmin(room.id, userId);
        toast.success("User promoted to admin");
      }
      await loadMembers();
    } catch (error) {
      toast.error("Failed to update admin status");
    }
  };

  const handleSaveInfo = async () => {
    if (!room) return;
    
    try {
      await updateGroupInfo(room.id, {
        title: editTitle,
        description: editDescription
      });
      toast.success("Group info updated");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update group info");
    }
  };

  const handleMemberClick = async (member: any) => {
    if (!user || member.uid === user.uid) return; // Don't DM yourself
    
    try {
      const dmRoom = await createOrFindDMRoom(
        user.uid,
        member.uid,
        user.organizationId
      );
      
      toast.success(`Opening chat with ${member.fullName}`);
      if (onRoomSelect) {
       onRoomSelect(dmRoom.id);
      }
      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error("Error opening DM:", error);
      toast.error("Failed to open chat");
    }
  };

  const handleDeleteRoom = async () => {
    if (!room || isLoading) return;

    const label = isDM ? "this direct message" : "this group";
    const confirmed = window.confirm(`Delete ${label}? This action cannot be undone.`);
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await deleteChatRoom(room.id);
      window.dispatchEvent(new Event("chat-rooms-updated"));
      toast.success(isDM ? "Direct message deleted" : "Group deleted");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete room");
    } finally {
      setIsLoading(false);
    }
  };

  if (!room) return null;

  const getRoomIcon = () => {
    switch (room.type) {
      case "dm":
        return <MessageCircle className="w-5 h-5" />;
      case "general":
        return <Users className="w-5 h-5" />;
      case "semester":
        return <Hash className="w-5 h-5" />;
      case "department":
        return <Users className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              {getRoomIcon()}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              ) : (
                <DialogTitle>{room.title}</DialogTitle>
              )}
              {!isDM && (
                <p className="text-sm text-muted-foreground mt-1">
                  {members.length} {members.length === 1 ? "member" : "members"}
                </p>
              )}
            </div>
            {isAdmin && !isDM && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </DialogHeader>

        {isDM ? (
          // DM Info
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <h3 className="font-medium mb-2">Chat Info</h3>
              <p className="text-sm text-muted-foreground">
                This is a private conversation between you and another user.
              </p>
            </div>
            {canDeleteRoom && (
              <Button variant="destructive" className="w-full" onClick={handleDeleteRoom}>
                Delete Chat
              </Button>
            )}
          </div>
        ) : (
          // Group Info & Management
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              {isAdmin && <TabsTrigger value="settings">Settings</TabsTrigger>}
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div>
                <label className="text-sm font-medium">Description</label>
                {isEditing ? (
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Add a group description..."
                    className="mt-2"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {room.description || "No description"}
                  </p>
                )}
              </div>

              {room.type === "semester" && (
                <div>
                  <label className="text-sm font-medium">Semester</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Semester {room.semester}
                  </p>
                </div>
              )}

              {room.type === "department" && (
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {room.department}
                  </p>
                </div>
              )}

              {isEditing && (
                <Button onClick={handleSaveInfo} className="w-full">
                  Save Changes
                </Button>
              )}
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              <div className="space-y-2">
                {isLoading ? (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Loading members...
                  </p>
                ) : (
                  members.map((member) => {
                    const isMemberAdmin = room.admins?.includes(member.uid);
                    const isCurrentUser = member.uid === user?.uid;
                    
                    return (
                      <div
                        key={member.uid}
                        onClick={() => handleMemberClick(member)}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {member.fullName?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {member.fullName || "Unknown User"}
                              {isCurrentUser && " (You)"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                          {isMemberAdmin && (
                            <Badge variant="secondary" className="ml-2">
                              <Crown className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>

                        {isAdmin && !isCurrentUser && (
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAdmin(member.uid, isMemberAdmin)}
                            >
                              {isMemberAdmin ? "Remove Admin" : "Make Admin"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.uid)}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="settings" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Add Member</h3>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter email address..."
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                    />
                    <Button onClick={handleAddMember} disabled={isLoading}>
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {canDeleteRoom && (
                  <Button variant="destructive" className="w-full" onClick={handleDeleteRoom}>
                    Delete Group
                  </Button>
                )}
              </TabsContent>
            )}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
