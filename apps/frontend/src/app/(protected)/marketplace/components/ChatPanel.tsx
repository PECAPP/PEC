import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Search, ChevronDown, IndianRupee, Loader2, MessageCircle } from 'lucide-react';
import { Button, Input, Badge, Textarea, Dialog, DialogContent, DialogTitle } from '@pec/ui';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Listing, Chat, ChatMessage } from '../types';
import api from '@pec/api';

export default function ChatPanel({
  open,
  onClose,
  listing,
  currentUserId,
  chats,
  onChatsRefresh,
}: {
  open: boolean;
  onClose: () => void;
  listing: Listing | null;
  currentUserId: string;
  chats: Chat[];
  onChatsRefresh: () => void;
}) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [msgText, setMsgText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // When a listing is passed, auto-open that chat
  useEffect(() => {
    if (listing && open) {
      openChatForListing(listing.id);
    }
  }, [listing, open]);

  useEffect(() => {
    if (!open) {
      setActiveChatId(null);
      setMessages([]);
      setSearchQuery('');
    }
  }, [open]);

  const openChatForListing = async (listingId: string) => {
    setLoadingChat(true);
    try {
      const res = await api.post(`/marketplace/chats/listing/${listingId}`, {});
      const raw = (res as any).data;
      const chat = raw?.data ?? raw;
      setActiveChatId(chat.id);
      await loadMessages(chat.id);
      onChatsRefresh();
    } catch {
      toast.error('Failed to open chat');
    } finally {
      setLoadingChat(false);
    }
  };

  const openExistingChat = async (chatId: string) => {
    setActiveChatId(chatId);
    await loadMessages(chatId);
  };

  const loadMessages = async (chatId: string) => {
    try {
      const res = await api.get(`/marketplace/chats/${chatId}/messages`);
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const handleSend = async () => {
    if (!msgText.trim() || !activeChatId) return;
    setSending(true);
    try {
      const res = await api.post(`/marketplace/chats/${activeChatId}/messages`, {
        text: msgText.trim(),
      });
      const raw = (res as any).data;
      const newMsg = raw?.data ?? raw;
      setMessages((prev) => [...prev, newMsg]);
      setMsgText('');
      onChatsRefresh();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const safeChats = Array.isArray(chats) ? chats : [];

  // Filter chats by search query
  const filteredChats = safeChats.filter((chat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const otherName = chat.buyer.id === currentUserId ? 'Seller' : chat.buyer.name;
    return chat.listing.title.toLowerCase().includes(q) || otherName.toLowerCase().includes(q);
  });

  const activeChat = safeChats.find((c) => c.id === activeChatId);

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-full max-w-4xl h-[100dvh] md:h-[800px] max-h-screen md:max-h-[85vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-none md:border border-border/50 shadow-2xl rounded-none md:rounded-2xl flex flex-col md:flex-row gap-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Marketplace Chats</DialogTitle>

        {/* Left Pane: Chat List */}
        <div
          className={cn(
            'w-full md:w-[350px] shrink-0 h-full flex-col border-r border-border/40 bg-card/30',
            activeChatId ? 'hidden md:flex' : 'flex'
          )}
        >
          <div className="p-4 border-b border-border/40 shrink-0 space-y-3 bg-background/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg tracking-tight">Messages</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                className="pl-9 h-10 rounded-xl bg-background/50 border-border/60 focus:bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
            {filteredChats.length === 0 ? (
              <div className="text-center text-sm font-medium text-muted-foreground p-8">
                {searchQuery ? 'No matching chats found.' : 'No conversations yet.'}
              </div>
            ) : (
              filteredChats.map((chat) => {
                const lastMsg = chat.messages[0];
                const isActive = chat.id === activeChatId;
                const otherPersonName =
                  chat.buyer.id === currentUserId ? 'Seller' : chat.buyer.name;
                const avatarLetter = otherPersonName.charAt(0).toUpperCase();

                return (
                  <button
                    key={chat.id}
                    onClick={() => openExistingChat(chat.id)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left',
                      isActive ? 'bg-primary/10 shadow-sm' : 'hover:bg-muted/60'
                    )}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0',
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                    >
                      {avatarLetter}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm font-bold truncate',
                            isActive ? 'text-primary' : 'text-foreground'
                          )}
                        >
                          {chat.listing.title}
                        </p>
                        {lastMsg && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 opacity-60">
                            {new Date(chat.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-muted-foreground truncate mt-0.5">
                        <span className="text-foreground/70">{otherPersonName}:</span>{' '}
                        {lastMsg ? lastMsg.text : 'No messages'}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[9px] uppercase tracking-wider font-bold h-4 px-1.5 bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          ₹ {chat.listing.price.toLocaleString('en-IN')}
                        </Badge>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat */}
        <div
          className={cn(
            'flex-1 min-w-0 h-full flex-col bg-background/50 relative',
            !activeChatId ? 'hidden md:flex' : 'flex'
          )}
        >
          {activeChatId && activeChat ? (
            <>
              {/* Active Chat Header */}
              <div className="px-4 md:px-5 py-3 md:py-4 border-b border-border/40 shrink-0 flex items-center gap-3 bg-card/40 backdrop-blur-md">
                <button
                  className="md:hidden p-2 -ml-2 rounded-xl hover:bg-muted/80 text-muted-foreground"
                  onClick={() => setActiveChatId(null)}
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate text-foreground leading-tight">
                    {activeChat.listing.title}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-0.5">
                    {activeChat.buyer.id === currentUserId
                      ? 'Chatting with Seller'
                      : `Chatting with ${activeChat.buyer.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                  <IndianRupee className="w-4 h-4" />
                  <span className="font-bold tracking-tight">
                    {activeChat.listing.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-xl shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
                {loadingChat ? (
                  <div className="flex-1 h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
                    <MessageCircle className="w-12 h-12 text-muted-foreground" />
                    <p className="text-sm font-medium">Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div key={msg.id} className={cn('flex gap-3', isMe && 'flex-row-reverse')}>
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm',
                            isMe
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          )}
                        >
                          {msg.sender.name.charAt(0).toUpperCase()}
                        </div>
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm',
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-tr-sm shadow-glow'
                              : 'bg-card border border-border/40 rounded-tl-sm text-foreground'
                          )}
                        >
                          {msg.text}
                          <div
                            className={cn(
                              'text-[9px] uppercase tracking-widest mt-1.5 font-bold',
                              isMe
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground opacity-70'
                            )}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Area */}
              <div className="p-3 md:p-4 bg-card/40 backdrop-blur-md border-t border-border/40 shrink-0">
                <div className="flex items-end gap-2 relative">
                  <Textarea
                    placeholder="Type your message..."
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="w-full min-h-[52px] max-h-[120px] rounded-2xl resize-none bg-background/80 border-border/60 focus:ring-primary/20 p-3.5 pr-14 text-sm font-medium"
                    rows={1}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={sending || !msgText.trim()}
                    className="absolute right-2 bottom-2 h-9 w-9 rounded-xl bg-primary shadow-glow transition-all"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageCircle className="w-4 h-4 fill-current" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50 relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4"
              >
                <X className="w-5 h-5" />
              </Button>
              <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-bold text-xl text-foreground">Your Messages</h3>
              <p className="text-sm font-medium text-muted-foreground mt-2 max-w-[250px]">
                Select a conversation from the sidebar to view your messages.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
