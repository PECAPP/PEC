import { useState, useEffect } from "react";
import { Search, Loader2, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { createGroupRoom } from "@/lib/chatRooms.service";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (roomId: string) => void;
  currentUser: { uid: string; organizationId: string };
}

export function CreateGroupDialog({ open, onOpenChange, onGroupCreated, currentUser }: Props) {
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (search.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const res = await api.get("/chat/users", { params: { q: search } });
        setSearchResults(res.data?.data || res.data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleUser = (user: any) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a group name");
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    setIsCreating(true);
    try {
      const room = await createGroupRoom(
        name.trim(),
        selectedUsers.map((u) => u.id)
      );
      toast.success(`Group "${name}" created!`);
      onGroupCreated(room.id);
      window.dispatchEvent(new Event("chat-rooms-updated"));
      onOpenChange(false);
      reset();
    } catch (error) {
      toast.error("Failed to create group");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const reset = () => {
    setName("");
    setSearch("");
    setSelectedUsers([]);
    setSearchResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a private space for your team or project.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Group Name</label>
            <Input
              placeholder="e.g. Project Alpha"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Add Participants</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                disabled={isCreating}
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedUsers.map((u) => (
                  <Badge key={u.id} variant="secondary" className="gap-1">
                    {u.name || u.email}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleToggleUser(u)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            <div className="max-h-40 overflow-y-auto border rounded-md mt-2">
              {isSearching ? (
                <div className="p-4 flex justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <button
                    key={user.id}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-secondary text-sm transition-colors"
                    onClick={() => handleToggleUser(user)}
                  >
                    <div className="text-left">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {selectedUsers.find((u) => u.id === user.id) && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))
              ) : search.length >= 2 ? (
                <p className="p-4 text-center text-xs text-muted-foreground">No users found</p>
              ) : null}
            </div>
          </div>

          <Button onClick={handleCreate} disabled={isCreating || !name.trim() || selectedUsers.length === 0}>
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Group"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
