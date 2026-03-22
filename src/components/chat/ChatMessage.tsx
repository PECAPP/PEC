import { cn } from '@/lib/utils';
import { Download, FileText, Star, Trash2, Copy, MoreVertical, Reply } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '@/lib/messages.service';
import { deleteMessage, toggleStarMessage } from '@/lib/messages.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { useState } from 'react';
import { ImageLightbox } from '@/components/chat/ImageLightbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

// Generate consistent color for user based on their ID
const getUserColor = (userId: string) => {
  const colors = [
    '#E91E63', // Pink
    '#9C27B0', // Purple
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#2196F3', // Blue
    '#00BCD4', // Cyan
    '#009688', // Teal
    '#4CAF50', // Green
    '#8BC34A', // Light Green
    '#FF9800', // Orange
    '#FF5722', // Deep Orange
    '#795548', // Brown
  ];
  
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  isOwn: boolean;
  type?: "text" | "image" | "video" | "file";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  starredBy?: string[];
  deletedAt?: any;
  replyTo?: { text: string; senderName: string };
  mentions?: string[];
  parentId?: string;
}

interface ChatMessageProps {
  message: Message;
  showSenderName?: boolean;
  roomId?: string;
  onReply?: (message: Message) => void;
  onReplyClick?: () => void;
}

export function ChatMessage({ message, showSenderName = true, roomId = '', onReply = () => {}, onReplyClick }: ChatMessageProps) {
  const { user } = useAuth();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const isStarred = message.starredBy?.includes(user?.uid || "") || false;
  const userRole = user?.role as string;
  const isAdmin = userRole === "admin" || userRole === "college_admin";
  const canDelete = message.isOwn || isAdmin; // Owner or admin can delete
  const canStar = !!roomId; // Anyone can star if roomId exists
  const canCopy = !!message.content; // Can copy if there's text

  const formattedTime = message.timestamp.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const mb = bytes / 1024 / 1024;
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  const handleDelete = async () => {
    if (!roomId) return;
    try {
      await deleteMessage(roomId, message.id, true);
      toast.success("Message deleted");
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  const handleStar = async () => {
    if (!user || !roomId) return;
    try {
      await toggleStarMessage(roomId, message.id, user.uid, !isStarred);
      toast.success(isStarred ? "Removed from starred" : "Added to starred");
    } catch (error) {
      toast.error("Failed to star message");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  };

  if (message.deletedAt) {
    return (
      <div className={cn('flex flex-col gap-1', message.isOwn ? 'items-end' : 'items-start')}>
        <div className="chat-bubble bg-muted/50 italic text-muted-foreground opacity-60">
          <p className="text-sm">This message was deleted</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex mb-4 group',
        message.isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      <div className="flex flex-col gap-1.5 max-w-[85%] md:max-w-[80%] px-3">
        {showSenderName && !message.isOwn && (
          <Link 
            to={`/users/${message.senderId}`} 
            className="text-xs font-bold px-2 hover:underline transition-colors"
            style={{ color: getUserColor(message.senderId) }}
          >
            {message.senderName}
          </Link>
        )}
        
        <div className="relative">
          <div
            className={cn(
              'rounded-2xl px-4 py-2.5 shadow-md transition-all duration-200',
              message.isOwn 
                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md' 
                : 'bg-card border border-border text-foreground rounded-bl-md hover:shadow-lg'
            )}
          >
            {/* Reply Reference */}
            {message.replyTo && (
              <div 
                className="mb-2.5 p-2.5 bg-background/30 backdrop-blur-sm rounded-lg border-l-3 border-primary text-xs cursor-pointer hover:bg-background/40 transition-colors"
                onClick={onReplyClick}
              >
                <p className="font-semibold text-primary text-[11px] mb-0.5">↩️ {message.replyTo.senderName}</p>
                <p className="truncate opacity-90">{message.replyTo.text}</p>
              </div>
            )}

            {/* Media Content */}
            {message.type === "image" && message.mediaUrl && (
              <img 
                src={message.mediaUrl} 
                alt="Shared image" 
                className="rounded-lg mb-2 max-w-full cursor-pointer hover:opacity-90"
                onClick={() => setLightboxImage(message.mediaUrl!)}
              />
            )}

            {message.type === "video" && message.mediaUrl && (
              <video 
                src={message.mediaUrl} 
                controls 
                className="rounded-lg mb-2 max-w-xs"
              />
            )}

            {message.type === "file" && message.mediaUrl && (
              <a
                href={message.mediaUrl}
                download={message.fileName || "download"}
                className="flex items-center gap-3 p-3 bg-background/10 rounded-xl mb-2 hover:bg-background/20 hover:scale-[1.02] transition-all cursor-pointer border border-border/50"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{message.fileName || "File"}</p>
                  <p className="text-xs opacity-70">{formatFileSize(message.fileSize)}</p>
                </div>
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Download className="w-4 h-4 text-primary" />
                </div>
              </a>
            )}

            {/* Text Content with Mention Highlighting */}
            {message.content && (
              <p className="text-[15px] leading-relaxed break-words">
                {message.content.split(/(@\w+(?:\s\w+)?)/g).map((part, i) => {
                  if (part.startsWith('@')) {
                    return (
                      <span 
                        key={i} 
                        className={cn(
                          "font-semibold px-1.5 py-0.5 rounded mx-0.5",
                          message.isOwn 
                            ? "bg-primary-foreground/20 text-primary-foreground" 
                            : "bg-primary/15 text-primary"
                        )}
                      >
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
              </p>
            )}
          </div>

          {/* Message Actions */}
          {roomId && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200",
              message.isOwn ? "-left-9" : "-right-9"
            )}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background hover:scale-110 transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <Reply className="w-4 h-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  
                  {canCopy && (
                    <DropdownMenuItem onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </DropdownMenuItem>
                  )}
                  
                  {canStar && (
                    <DropdownMenuItem onClick={handleStar}>
                      <Star className={`w-4 h-4 mr-2 ${isStarred ? "fill-yellow-400" : ""}`} />
                      {isStarred ? "Unstar" : "Star"}
                    </DropdownMenuItem>
                  )}

                  {canDelete && (
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <span className={cn('text-[10px] text-muted-foreground px-1', message.isOwn ? 'text-right' : 'text-left')}>
          {formattedTime}
          {isStarred && <Star className="w-3 h-3 inline ml-1 fill-yellow-400" />}
        </span>
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <ImageLightbox
          imageUrl={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
}
