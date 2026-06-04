import { useState, useRef, useEffect, KeyboardEvent, forwardRef, useImperativeHandle } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { getFileType, uploadMedia, validateFileSize } from '@/lib/cloudinary.service';
import { sendMediaMessage } from '@/lib/messages.service';
import { fetchChatUsers } from '@/lib/chatRooms.service';

// Generate consistent color for user based on their ID
const getUserColor = (userId: string) => {
  const colors = [
    '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#FF9800', '#FF5722', '#795548',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface ChatInputProps {
  onSend: (message: string, metadata?: { mentions?: string[]; parentId?: string; replyTo?: { text: string; senderName: string } }) => void;
  disabled?: boolean;
  placeholder?: string;
  roomId?: string; // For media upload
  replyingTo?: { id: string; text: string; senderName: string } | null;
  onCancelReply?: () => void;
}

export interface ChatInputRef {
  focus: () => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  replyingTo = null,
  onCancelReply,
  roomId = ''
}, ref) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [allUsers, setAllUsers] = useState<{ uid: string; fullName: string }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    }
  }));

  useEffect(() => {
    if (!user?.uid) return;
    fetchUsers();
  }, [user?.uid]);

  const fetchUsers = async () => {
    try {
      const users = (await fetchChatUsers()).filter((u) => u.uid !== user?.uid);
      console.log('Fetched users for mentions:', users.length);
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users for mentions:', error);
    }
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      // Find mentions in text
      const mentions = allUsers
        .filter(u => trimmedMessage.includes(`@${u.fullName}`))
        .map(u => u.uid);

      onSend(trimmedMessage, { 
        mentions: mentions.length > 0 ? mentions : undefined,
        parentId: replyingTo?.id,
        replyTo: replyingTo ? { text: replyingTo.text, senderName: replyingTo.senderName } : undefined
      });
      setMessage('');
      if (onCancelReply) onCancelReply();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleInputChange = (val: string) => {
    setMessage(val);
    const lastAt = val.lastIndexOf('@');
    if (lastAt !== -1 && lastAt >= val.lastIndexOf(' ')) {
      const query = val.substring(lastAt + 1);
      setMentionSearch(query);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (u: { uid: string; fullName: string }) => {
    const lastAt = message.lastIndexOf('@');
    const cursor = textareaRef.current?.selectionEnd || message.length;
    const newVal = message.substring(0, lastAt) + `@${u.fullName} ` + message.substring(cursor);
    setMessage(newVal);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const isEmpty = message.trim().length === 0;
  const filteredMentionUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(mentionSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="flex flex-col w-full relative">
      {/* Reply Preview */}
      {replyingTo && (
        <div className="bg-secondary/30 border-b border-border/50">
          <div className="px-4 py-2 flex justify-between items-center">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div className="w-1 h-10 bg-primary rounded-full"></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary">Replying to {replyingTo.senderName}</p>
                <p className="text-sm text-muted-foreground truncate">{replyingTo.text}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted transition-all" onClick={onCancelReply}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mention Dropdown */}
      {showMentions && filteredMentionUsers.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-card border border-border shadow-xl rounded-xl overflow-hidden animate-scale-in z-50">
          <ScrollArea className="h-48">
            <div className="p-2 space-y-1">
              {filteredMentionUsers.map(u => (
                <button
                  key={u.uid}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent text-left rounded-lg transition-colors"
                  onClick={() => insertMention(u)}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: getUserColor(u.uid) }}
                  >
                    {u.fullName[0]}
                  </div>
                  <span className="text-sm font-medium">{u.fullName}</span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="chat-input-area bg-background border-t border-border">
        <div className="w-full py-2">
          <div className="flex gap-2 items-end px-2">
            {/* Attachment Button */}
            {roomId && (
              <>
                <input
                  type="file"
                  id={`file-upload-${roomId}`}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!user?.uid) {
                        toast.error('You must be signed in to upload files');
                        e.target.value = '';
                        return;
                      }

                      if (!validateFileSize(file)) {
                        toast.error('File exceeds the allowed size limit');
                        e.target.value = ''; // Reset input
                        return;
                      }

                      // Upload file
                      const loadingToast = toast.loading('Uploading file...');
                      try {
                        const fileUrl = await uploadMedia(file, user.uid);
                        const fileType = getFileType(file.type);

                        // Send media message
                        await sendMediaMessage(roomId, fileUrl, fileType, {
                          fileName: file.name,
                          fileSize: file.size
                        });

                        toast.success('File sent successfully', { id: loadingToast });
                      } catch (error) {
                        console.error('File upload error:', error);
                        toast.error('Failed to upload file', { id: loadingToast });
                      }
                      
                      e.target.value = ''; // Reset input
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 shrink-0 rounded-full hover:bg-accent transition-all"
                  onClick={() => document.getElementById(`file-upload-${roomId}`)?.click()}
                  title="Attach file (max 10MB)"
                >
                  <Paperclip className="w-5 h-5 text-muted-foreground" />
                </Button>
              </>
            )}

            <div className="flex-1 bg-secondary/50 rounded-3xl border border-border/50 px-4 py-2 flex items-center gap-2">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 min-h-[28px] max-h-[120px] resize-none bg-transparent border-0 px-0 py-1 text-[15px] text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none"
                rows={1}
              />
            </div>
            
            <Button
              onClick={handleSend}
              disabled={isEmpty || disabled}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
