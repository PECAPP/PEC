import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Users, X } from "lucide-react";
import { collection, getDocs, query, where } from '@/lib/dataClient';

import { createGroupRoom } from "@/lib/chatRooms.service";
import { toast } from "sonner";

interface User {
  uid: string;
  fullName: string;
  email: string;
  role: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (roomId: string) => void;
  currentUser: {
    uid: string;
    organizationId: string;
  };
}

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated, currentUser }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    setFetchingUsers(true);
    try {
      const usersRef = collection(({} as any), "users");
      const q = query(usersRef, where("organizationId", "==", currentUser.organizationId));
      const snap = await getDocs(q);
      const usersList = snap.docs
        .map(doc => ({ uid: doc.id, ...doc.data() } as User))
        .filter(u => u.uid !== currentUser.uid); // Exclude self
      setAllUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setFetchingUsers(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Group title is required");
      return;
    }

    setLoading(true);
    try {
      const room = await createGroupRoom({
        title,
        description,
        organizationId: currentUser.organizationId,
        creatorId: currentUser.uid,
        members: [...selectedUsers, currentUser.uid],
        admins: [currentUser.uid]
      });
      
      toast.success("Group created successfully");
      onGroupCreated(room.id);
      onOpenChange(false);
      // Reset state
      setTitle("");
      setDescription("");
      setSelectedUsers([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 py-4 overflow-hidden flex flex-col">
          <div className="space-y-2">
            <Label htmlFor="title">Group Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. Project Alpha Team" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="What is this group about?" 
              className="resize-none h-20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <Label>Add Members ({selectedUsers.length} selected)</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <ScrollArea className="h-[280px] border rounded-md">
              <div className="p-2">
                {fetchingUsers ? (
                  <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                    Loading users...
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="space-y-1">
                  {filteredUsers.map(user => (
                    <div 
                      key={user.uid} 
                      className="flex items-center space-x-3 p-2 hover:bg-secondary/50 rounded-md cursor-pointer transition-colors"
                      onClick={() => toggleUser(user.uid)}
                    >
                      <Checkbox 
                        checked={selectedUsers.includes(user.uid)} 
                        onCheckedChange={() => toggleUser(user.uid)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none truncate">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
