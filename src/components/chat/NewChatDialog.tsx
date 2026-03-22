import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { findUserByEmail, createOrFindDMRoom } from "@/lib/chatRooms.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated: (roomId: string) => void;
}

export function NewChatDialog({ open, onOpenChange, onRoomCreated }: Props) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateChat = async () => {
    if (!user || !email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    if (email.toLowerCase() === user.email?.toLowerCase()) {
      toast.error("You cannot start a chat with yourself");
      return;
    }

    setIsLoading(true);

    try {
      // Find user by email
      const foundUser = await findUserByEmail(email.trim());

      if (!foundUser) {
        toast.error("No user found with this email address");
        setIsLoading(false);
        return;
      }

      // Create or find DM room
      const dmRoom = await createOrFindDMRoom(
        user.uid,
        foundUser.uid as string,
        user.organizationId
      );

      toast.success(`Chat with ${foundUser.fullName || email} opened!`);
      onRoomCreated(dmRoom.id);
      onOpenChange(false);
      setEmail("");
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Failed to create chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreateChat();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a New Chat</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to chat with
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
              type="email"
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleCreateChat} disabled={isLoading || !email.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              "Start Chat"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
