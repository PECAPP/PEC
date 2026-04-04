'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  X,
  Heart,
  MessageCircle,
  ChevronDown,
  Tag,
  Package,
  Loader2,
  BookOpen,
  Laptop,
  Sofa,
  Shirt,
  Trophy,
  PenTool,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Edit2,
  Trash2,
  Eye,
  IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Seller {
  id: string;
  name: string;
  avatar?: string;
  studentProfile?: { phone?: string };
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: string;
  sellerId: string;
  seller: Seller;
  _count?: { bookmarks: number };
  createdAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}

interface Chat {
  id: string;
  listingId: string;
  buyerId: string;
  listing: { id: string; title: string; images: string[]; price: number; sellerId: string };
  buyer: { id: string; name: string; avatar?: string };
  messages: ChatMessage[];
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'Books', label: 'Books', icon: BookOpen },
  { value: 'Electronics', label: 'Electronics', icon: Laptop },
  { value: 'Furniture', label: 'Furniture', icon: Sofa },
  { value: 'Clothing', label: 'Clothing', icon: Shirt },
  { value: 'Sports', label: 'Sports', icon: Trophy },
  { value: 'Stationery', label: 'Stationery', icon: PenTool },
  { value: 'Other', label: 'Other', icon: Package },
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Used', 'Poor'];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const CONDITION_COLORS: Record<string, string> = {
  New: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  'Like New': 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  Good: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  Used: 'bg-orange-500/15 text-orange-600 border-orange-500/20',
  Poor: 'bg-red-500/15 text-red-600 border-red-500/20',
};

// ─── ProductCard ──────────────────────────────────────────────────────────────

function ProductCard({
  listing,
  isBookmarked,
  currentUserId,
  onBookmark,
  onChat,
  onView,
  onEdit,
  onDelete,
}: {
  listing: Listing;
  isBookmarked: boolean;
  currentUserId: string;
  onBookmark: (id: string) => void;
  onChat: (listing: Listing) => void;
  onView: (listing: Listing) => void;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
}) {
  const isMine = listing.sellerId === currentUserId;
  const imgSrc = listing.images[0] || '/placeholder-product.png';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-200"
    >
      {/* Image */}
      <div
        className="relative aspect-[4/3] bg-muted cursor-pointer overflow-hidden"
        onClick={() => onView(listing)}
      >
        <img
          src={imgSrc}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category)}`;
          }}
        />
        {listing.status === 'Sold' && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge className="bg-red-500 text-white text-sm px-3 py-1">SOLD</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge
            variant="outline"
            className={cn('text-xs border', CONDITION_COLORS[listing.condition] ?? '')}
          >
            {listing.condition}
          </Badge>
        </div>
        {!isMine && (
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark(listing.id); }}
            className="absolute top-2 left-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart
              className={cn('w-4 h-4 transition-colors', isBookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground')}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-medium text-sm leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={() => onView(listing)}
          >
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-primary font-bold">
          <IndianRupee className="w-3.5 h-3.5" />
          <span className="text-base">{listing.price.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="w-3 h-3" />
          {listing.category}
          <span className="text-border">·</span>
          <span className="truncate">{listing.seller.name}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {isMine ? (
            <>
              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => onEdit(listing)}>
                <Edit2 className="w-3 h-3 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => onDelete(listing.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => onView(listing)}>
                <Eye className="w-3 h-3 mr-1" /> View
              </Button>
              {listing.status !== 'Sold' && (
                <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => onChat(listing)}>
                  <MessageCircle className="w-3 h-3 mr-1" /> Chat
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── ListingFormDialog ────────────────────────────────────────────────────────

function ListingFormDialog({
  open,
  onClose,
  onSuccess,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existing?: Listing | null;
}) {
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    price: existing?.price?.toString() ?? '',
    category: existing?.category ?? '',
    condition: existing?.condition ?? '',
    images: existing?.images?.join('\n') ?? '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: existing?.title ?? '',
        description: existing?.description ?? '',
        price: existing?.price?.toString() ?? '',
        category: existing?.category ?? '',
        condition: existing?.condition ?? '',
        images: existing?.images?.join('\n') ?? '',
      });
    }
  }, [open, existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category || !form.condition) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        condition: form.condition,
        images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
      };
      if (existing) {
        await api.patch(`/marketplace/listings/${existing.id}`, payload);
        toast.success('Listing updated!');
      } else {
        await api.post('/marketplace/listings', payload);
        toast.success('Listing created!');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit Listing' : 'Create New Listing'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title *</label>
            <Input
              placeholder="e.g. Physics textbook by H.C. Verma"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Category *</label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Condition *</label>
              <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Price (₹) *</label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 250"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              rows={3}
              placeholder="Describe your item — condition details, reason for selling, etc."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Image URLs (one per line)</label>
            <Textarea
              rows={2}
              placeholder="https://example.com/image.jpg"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">Paste direct image links. Use Cloudinary or Imgur for uploads.</p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {existing ? 'Update' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── ListingDetailDialog ──────────────────────────────────────────────────────

function ListingDetailDialog({
  listing,
  isBookmarked,
  currentUserId,
  onClose,
  onBookmark,
  onChat,
}: {
  listing: Listing | null;
  isBookmarked: boolean;
  currentUserId: string;
  onClose: () => void;
  onBookmark: (id: string) => void;
  onChat: (listing: Listing) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  if (!listing) return null;
  const isMine = listing.sellerId === currentUserId;
  const images = listing.images.length > 0 ? listing.images : [`https://placehold.co/600x400/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category)}`];

  return (
    <Dialog open={!!listing} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Image Carousel */}
        <div className="relative bg-muted aspect-video overflow-hidden rounded-t-lg">
          <img
            src={images[imgIdx]}
            alt={listing.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/600x400/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category)}`;
            }}
          />
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={cn('w-2 h-2 rounded-full transition-colors', i === imgIdx ? 'bg-white' : 'bg-white/50')}
                />
              ))}
            </div>
          )}
          {listing.status === 'Sold' && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Badge className="bg-red-500 text-white text-lg px-4 py-1.5">SOLD</Badge>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">{listing.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn('text-xs', CONDITION_COLORS[listing.condition] ?? '')}>
                  {listing.condition}
                </Badge>
                <Badge variant="secondary" className="text-xs">{listing.category}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-1 text-2xl font-bold text-primary shrink-0">
              <IndianRupee className="w-5 h-5" />
              {listing.price.toLocaleString('en-IN')}
            </div>
          </div>

          {listing.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
          )}

          {/* Seller Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
              {listing.seller.avatar ? (
                <img src={listing.seller.avatar} alt={listing.seller.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                listing.seller.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{listing.seller.name}</p>
              {listing.seller.studentProfile?.phone && (
                <p className="text-xs text-muted-foreground">📞 {listing.seller.studentProfile.phone}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isMine && listing.status !== 'Sold' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onBookmark(listing.id)}
              >
                <Heart className={cn('w-4 h-4 mr-2', isBookmarked ? 'fill-red-500 text-red-500' : '')} />
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
              <Button className="flex-1" onClick={() => { onChat(listing); onClose(); }}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────

function ChatPanel({
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // When a listing is passed, auto-open that chat
  useEffect(() => {
    if (listing && open) {
      openChatForListing(listing.id);
    }
  }, [listing, open]);

  const openChatForListing = async (listingId: string) => {
    setLoadingChat(true);
    try {
      const res = await api.post(`/marketplace/chats/listing/${listingId}`, {});
      const chat = (res as any).data;
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
      setMessages((res as any).data ?? []);
    } catch {
      toast.error('Failed to load messages');
    }
  };

  const handleSend = async () => {
    if (!msgText.trim() || !activeChatId) return;
    setSending(true);
    try {
      const res = await api.post(`/marketplace/chats/${activeChatId}/messages`, { text: msgText.trim() });
      const newMsg = (res as any).data;
      setMessages((prev) => [...prev, newMsg]);
      setMsgText('');
      onChatsRefresh();
    } catch {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-screen w-[380px] max-w-[95vw] bg-background border-l border-border shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {activeChatId && (
                <button onClick={() => { setActiveChatId(null); setMessages([]); }} className="p-1 hover:bg-muted rounded">
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </button>
              )}
              <h3 className="font-semibold text-sm">
                {activeChatId
                  ? activeChat
                    ? activeChat.listing.title.slice(0, 30) + (activeChat.listing.title.length > 30 ? '...' : '')
                    : 'Chat'
                  : 'Messages'}
              </h3>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {loadingChat ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : activeChatId ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map((msg) => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={cn('flex gap-2', isMe && 'flex-row-reverse')}>
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold shrink-0">
                        {msg.sender.name.charAt(0)}
                      </div>
                      <div className={cn('max-w-[75%] rounded-2xl px-3 py-2 text-sm', isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm')}>
                        {msg.text}
                        <div className={cn('text-[10px] mt-1', isMe ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2 shrink-0">
                <Input
                  placeholder="Type a message…"
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleSend} disabled={sending || !msgText.trim()}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send'}
                </Button>
              </div>
            </>
          ) : (
            /* Chat List */
            <div className="flex-1 overflow-y-auto">
              {chats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground p-6 text-center">
                  <MessageCircle className="w-10 h-10" />
                  <p className="text-sm">No conversations yet.</p>
                  <p className="text-xs">Browse listings and click "Chat" to start a conversation.</p>
                </div>
              ) : (
                chats.map((chat) => {
                  const lastMsg = chat.messages[0];
                  const otherPerson = chat.buyer.id === currentUserId
                    ? null
                    : chat.buyer;
                  return (
                    <button
                      key={chat.id}
                      onClick={() => openExistingChat(chat.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 text-left"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold shrink-0">
                        {chat.buyer.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-sm font-medium truncate">{chat.listing.title}</p>
                          {lastMsg && (
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {lastMsg ? lastMsg.text : 'No messages yet'}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <IndianRupee className="w-3 h-3 text-primary" />
                          <span className="text-xs text-primary font-medium">{chat.listing.price.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { user, loading: authLoading } = useAuth();

  const [tab, setTab] = useState<'browse' | 'my-listings' | 'saved'>('browse');
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [chats, setChats] = useState<Chat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('createdAt_desc');
  const [showFilters, setShowFilters] = useState(false);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [viewingListing, setViewingListing] = useState<Listing | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatListing, setChatListing] = useState<Listing | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = sortOption.split('_');
      const params: Record<string, any> = { sortBy, sortOrder, limit: 40, offset: 0 };
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      if (filterCondition) params.condition = filterCondition;
      if (filterMinPrice) params.minPrice = filterMinPrice;
      if (filterMaxPrice) params.maxPrice = filterMaxPrice;

      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/marketplace/listings?${query}`);
      const { data, meta } = res as any;
      setListings(data ?? []);
      setTotal(meta?.total ?? 0);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterCondition, filterMinPrice, filterMaxPrice, sortOption]);

  const fetchMyListings = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/listings/my');
      setMyListings((res as any).data ?? []);
    } catch {
      // silent
    }
  }, []);

  const fetchSavedListings = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/bookmarks');
      setSavedListings((res as any).data ?? []);
    } catch {
      // silent
    }
  }, []);

  const fetchBookmarkedIds = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/bookmarks/ids');
      setBookmarkedIds(new Set((res as any).data ?? []));
    } catch {
      // silent
    }
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/chats');
      setChats((res as any).data ?? []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchListings();
      fetchBookmarkedIds();
      fetchChats();
    }
  }, [authLoading, user, fetchListings, fetchBookmarkedIds, fetchChats]);

  useEffect(() => {
    if (tab === 'my-listings') fetchMyListings();
    if (tab === 'saved') fetchSavedListings();
  }, [tab, fetchMyListings, fetchSavedListings]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { fetchListings(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleBookmark = async (id: string) => {
    try {
      const res = await api.post(`/marketplace/bookmarks/${id}`, {});
      const { bookmarked } = (res as any).data;
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (bookmarked) next.add(id); else next.delete(id);
        return next;
      });
      toast.success(bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
      if (tab === 'saved') fetchSavedListings();
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/marketplace/listings/${id}`);
      toast.success('Listing deleted');
      fetchMyListings();
      fetchListings();
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      await api.patch(`/marketplace/listings/${id}`, { status: 'Sold' });
      toast.success('Marked as sold');
      fetchMyListings();
      fetchListings();
    } catch {
      toast.error('Failed to update listing');
    }
  };

  const openChat = (listing: Listing) => {
    setChatListing(listing);
    setChatOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentUserId = (user as any)?.id ?? '';
  const activeListings = tab === 'browse' ? listings : tab === 'my-listings' ? myListings : savedListings;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Campus Marketplace</h1>
                <p className="text-xs text-muted-foreground">Buy & Sell within PEC</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="relative"
                onClick={() => { setChatListing(null); setChatOpen(true); }}
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Chats
                {chats.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                    {chats.length > 9 ? '9+' : chats.length}
                  </span>
                )}
              </Button>
              <Button size="sm" onClick={() => { setEditingListing(null); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-1.5" />
                Sell Item
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="h-9">
                <TabsTrigger value="browse" className="text-sm">Browse</TabsTrigger>
                <TabsTrigger value="my-listings" className="text-sm">My Listings</TabsTrigger>
                <TabsTrigger value="saved" className="text-sm">
                  <Heart className="w-3.5 h-3.5 mr-1" />
                  Saved
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">

          {/* Search + Filters (browse tab only) */}
          {tab === 'browse' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listings…"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setShowFilters((v) => !v)}
                  className="shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1 border border-border rounded-md p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn('p-1 rounded', viewMode === 'grid' && 'bg-muted')}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn('p-1 rounded', viewMode === 'list' && 'bg-muted')}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                      <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <Select value={filterCondition} onValueChange={setFilterCondition}>
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Condition</SelectItem>
                          {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-1">
                        <Input placeholder="Min ₹" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)} className="w-20 h-8 text-xs" type="number" min="0" />
                        <span className="text-muted-foreground text-xs">–</span>
                        <Input placeholder="Max ₹" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)} className="w-20 h-8 text-xs" type="number" min="0" />
                      </div>

                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-44 h-8 text-xs">
                          <ArrowUpDown className="w-3 h-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SORT_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          setFilterCategory(''); setFilterCondition('');
                          setFilterMinPrice(''); setFilterMaxPrice('');
                          setSortOption('createdAt_desc');
                        }}
                      >
                        <X className="w-3 h-3 mr-1" /> Clear
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setFilterCategory(filterCategory === cat.value ? '' : cat.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
                        filterCategory === cat.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted',
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">{total} listing{total !== 1 && 's'} found</p>
            </div>
          )}

          {/* My Listings – status tabs */}
          {tab === 'my-listings' && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{myListings.length} listing{myListings.length !== 1 && 's'}</p>
              <Button size="sm" onClick={() => { setEditingListing(null); setFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-1.5" /> New Listing
              </Button>
            </div>
          )}

          {/* Grid / List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : activeListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <ShoppingBag className="w-12 h-12" />
              <div className="text-center">
                <p className="font-medium">
                  {tab === 'browse' ? 'No listings found' : tab === 'my-listings' ? "You haven't listed anything yet" : 'No saved listings'}
                </p>
                <p className="text-sm mt-1">
                  {tab === 'browse'
                    ? 'Try adjusting your filters or search query'
                    : tab === 'my-listings'
                    ? 'Click "New Listing" to start selling'
                    : 'Browse and save items you like'}
                </p>
              </div>
              {tab !== 'browse' && (
                <Button size="sm" onClick={() => { if (tab === 'my-listings') { setEditingListing(null); setFormOpen(true); } else setTab('browse'); }}>
                  {tab === 'my-listings' ? 'Create Listing' : 'Browse Listings'}
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              layout
              className={cn(
                'gap-4',
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'flex flex-col',
              )}
            >
              <AnimatePresence mode="popLayout">
                {activeListings.map((listing) =>
                  viewMode === 'grid' ? (
                    <ProductCard
                      key={listing.id}
                      listing={listing}
                      isBookmarked={bookmarkedIds.has(listing.id)}
                      currentUserId={currentUserId}
                      onBookmark={handleBookmark}
                      onChat={openChat}
                      onView={setViewingListing}
                      onEdit={(l) => { setEditingListing(l); setFormOpen(true); }}
                      onDelete={handleDelete}
                    />
                  ) : (
                    /* List view row */
                    <motion.div
                      key={listing.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-4 bg-card border border-border rounded-xl p-3 hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div
                        className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted cursor-pointer"
                        onClick={() => setViewingListing(listing)}
                      >
                        <img
                          src={listing.images[0] || `https://placehold.co/64x64/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category[0])}`}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/64x64/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category[0])}`;
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate cursor-pointer hover:text-primary" onClick={() => setViewingListing(listing)}>{listing.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-primary font-bold text-sm flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{listing.price.toLocaleString('en-IN')}</span>
                          <Badge variant="outline" className={cn('text-[10px] h-4', CONDITION_COLORS[listing.condition] ?? '')}>{listing.condition}</Badge>
                          <Badge variant="secondary" className="text-[10px] h-4">{listing.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{listing.seller.name}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {listing.sellerId !== currentUserId ? (
                          <>
                            <button onClick={() => handleBookmark(listing.id)} className="p-1.5 hover:bg-muted rounded">
                              <Heart className={cn('w-4 h-4', bookmarkedIds.has(listing.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
                            </button>
                            {listing.status !== 'Sold' && (
                              <Button size="sm" className="h-7 text-xs" onClick={() => openChat(listing)}>
                                <MessageCircle className="w-3 h-3 mr-1" /> Chat
                              </Button>
                            )}
                          </>
                        ) : (
                          <div className="flex gap-1">
                            {listing.status === 'Available' && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMarkSold(listing.id)}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Sold
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingListing(listing); setFormOpen(true); }}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(listing.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Dialogs & Panels */}
      <ListingFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingListing(null); }}
        onSuccess={() => { fetchListings(); fetchMyListings(); }}
        existing={editingListing}
      />

      <ListingDetailDialog
        listing={viewingListing}
        isBookmarked={viewingListing ? bookmarkedIds.has(viewingListing.id) : false}
        currentUserId={currentUserId}
        onClose={() => setViewingListing(null)}
        onBookmark={handleBookmark}
        onChat={openChat}
      />

      <ChatPanel
        open={chatOpen}
        onClose={() => { setChatOpen(false); setChatListing(null); }}
        listing={chatListing}
        currentUserId={currentUserId}
        chats={chats}
        onChatsRefresh={fetchChats}
      />
    </div>
  );
}
