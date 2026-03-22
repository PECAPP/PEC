import { Trash2, Star, Copy, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteMessage, toggleStarMessage } from "@/lib/messages.service";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";

interface Props {
  messageId: string;
  roomId: string;
  senderId: string;
  text: string;
  isStarred: boolean;
  onAction?: () => void;
}

export function MessageActions({
  messageId,
  roomId,
  senderId,
  text,
  isStarred,
  onAction
}: Props) {
  const { user } = useAuth();
  
  const isOwnMessage = user?.uid === senderId;
  const userRole = user?.role as string;
  const isAdmin = userRole === "admin" || userRole === "college_admin";
  const canDelete = isOwnMessage || isAdmin;

  const handleDelete = async () => {
    try {
      await deleteMessage(roomId, messageId, true);
      toast.success("Message deleted");
      onAction?.();
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleStar = async () => {
    if (!user) return;
    try {
      await toggleStarMessage(roomId, messageId, user.uid, !isStarred);
      toast.success(isStarred ? "Removed from starred" : "Added to starred");
      onAction?.();
    } catch (error) {
      toast.error("Failed to star message");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleStar}>
          <Star className={`w-4 h-4 mr-2 ${isStarred ? "fill-yellow-400" : ""}`} />
          {isStarred ? "Unstar" : "Star"}
        </DropdownMenuItem>

        {canDelete && (
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
