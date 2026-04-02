'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Megaphone, Pin, Trash2, Calendar, User, Tag, Plus, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

import api from '@/lib/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MediaUpload, UploadedMedia } from '@/components/clubs/MediaUpload';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type NoticeMedia = {
  id?: string;
  url: string;
  kind: 'image' | 'audio' | 'video' | 'file';
  name?: string;
  mimeType?: string;
  sizeBytes?: number;
};

type NoticeItem = {
  id: string;
  title: string;
  content: string;
  category: 'news' | 'update' | 'event' | 'alert';
  important: boolean;
  pinned: boolean;
  media: NoticeMedia[];
  authorName: string;
  publishedAt: string;
};

const categories: Array<NoticeItem['category']> = ['news', 'update', 'event', 'alert'];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NoticeboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<NoticeItem[]>([]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeItem['category']>('update');
  const [important, setImportant] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [media, setMedia] = useState<NoticeMedia[]>([]);
  const [posting, setPosting] = useState(false);

  const isAdmin = useMemo(() => user?.role === 'college_admin', [user?.role]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/noticeboard', { params: { limit: 200, offset: 0 } });
      setNotices(res.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (!['student', 'faculty', 'college_admin'].includes(user.role || '')) {
      router.replace('/dashboard');
      return;
    }
    void loadNotices();
  }, [authLoading, user, router]);

  const handleMediaAdd = (uploaded: UploadedMedia) => {
    void (async () => {
      try {
        const dataUrl = await fileToDataUrl(uploaded.file);
        setMedia((prev) => [
          ...prev,
          {
            id: uploaded.id,
            url: dataUrl,
            kind: uploaded.kind,
            name: uploaded.name,
            mimeType: uploaded.mimeType,
            sizeBytes: uploaded.file.size,
          },
        ]);
      } catch (error) {
        console.error(error);
        toast.error('Failed to attach media');
      }
    })();
  };

  const handleMediaRemove = (id: string) => {
    setMedia((prev) => prev.filter((item) => item.id !== id));
  };

  const createNotice = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast.error('Required fields: Title and Content');
      return;
    }

    try {
      setPosting(true);
      await api.post('/noticeboard', {
        title: trimmedTitle,
        content: trimmedContent,
        category,
        important,
        pinned,
        media: media.map((item) => ({
          url: item.url,
          kind: item.kind,
          name: item.name,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
        })),
      });
      toast.success('Notice published successfully');
      setTitle('');
      setContent('');
      setCategory('update');
      setImportant(false);
      setPinned(false);
      setMedia([]);
      await loadNotices();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error?.message || 'Failed to publish notice');
    } finally {
      setPosting(false);
    }
  };

  const removeNotice = async (id: string) => {
    if (!confirm('Are you sure you want to remove this notice?')) return;
    try {
      await api.delete(`/noticeboard/${id}`);
      toast.success('Notice removed');
      await loadNotices();
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to remove notice');
    }
  };

  const togglePin = async (id: string, nextPinned: boolean) => {
    try {
      await api.patch(`/noticeboard/${id}/pin`, { pinned: nextPinned });
      toast.success(nextPinned ? 'Notice pinned' : 'Notice unpinned');
      await loadNotices();
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to update notice status');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 animate-in fade-in">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing Noticeboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Institutional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-5">
           <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden group">
             <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
             <Megaphone className="w-8 h-8 text-primary shadow-glow relative z-10" />
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-foreground">Noticeboard</h1>
             <p className="text-sm text-muted-foreground font-medium italic mt-1 font-display">Campus-wide announcements and academic updates</p>
           </div>
        </div>
        {isAdmin && (
           <Button 
             className="h-10 rounded-xl px-6 font-bold text-[10px] uppercase tracking-widest gap-2 bg-primary shadow-glow transition-all"
             onClick={() => document.getElementById('post-notice-form')?.scrollIntoView({ behavior: 'smooth' })}
           >
             <Plus className="w-4 h-4" /> New Announcement
           </Button>
        )}
      </div>

      {isAdmin && (
        <div id="post-notice-form" className="card-elevated p-6 bg-card/60 backdrop-blur-sm border-primary/10 space-y-4">
          <div className="flex items-center gap-3">
             <Settings2 className="w-5 h-5 text-primary" />
             <h2 className="text-lg font-bold tracking-tight">Create Announcement</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Title</Label>
              <Input
                placeholder="Enter notice title"
                className="h-11 rounded-xl bg-background border-border/60 font-bold px-4 text-sm"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Category</Label>
              <select
                className="h-11 w-full rounded-xl border border-border/60 bg-background px-4 text-xs font-bold uppercase tracking-wider focus:ring-primary/20"
                value={category}
                onChange={(event) => setCategory(event.target.value as NoticeItem['category'])}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>{item.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Content</Label>
            <Textarea
              rows={3}
              placeholder="Write the announcement details..."
              className="rounded-xl bg-background border-border/60 font-medium p-4 resize-none text-sm"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-border/10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Switch id="notice-important" checked={important} onCheckedChange={setImportant} />
                <Label htmlFor="notice-important" className="text-[10px] font-bold uppercase tracking-widest opacity-80">High Priority</Label>
              </div>

              <div className="flex items-center gap-3">
                <Switch id="notice-pinned" checked={pinned} onCheckedChange={setPinned} />
                <Label htmlFor="notice-pinned" className="text-[10px] font-bold uppercase tracking-widest opacity-80">Pin to Top</Label>
              </div>
            </div>

            <MediaUpload onMediaAdd={handleMediaAdd} onMediaRemove={handleMediaRemove} />
          </div>

          <div className="flex justify-end pt-2">
            <Button 
              onClick={createNotice} 
              disabled={posting}
              className="h-11 px-10 rounded-xl bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest shadow-glow hover:scale-[1.02] transition-all"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4 mr-2" />}
              Publish Announcement
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {notices.map((notice) => (
            <motion.div
              layout
              key={notice.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "card-elevated p-6 bg-card/90 backdrop-blur-sm border-border hover:border-primary/40 transition-all group",
                notice.important && "border-l-4 border-l-destructive shadow-lg shadow-destructive/5"
              )}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={cn(
                      "px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider",
                      notice.category === 'alert' ? "bg-destructive/10 text-destructive" :
                      notice.category === 'event' ? "bg-primary/10 text-primary" :
                      "bg-muted/80 text-muted-foreground"
                    )}>
                      {notice.category}
                    </Badge>
                    {notice.pinned && (
                      <Badge variant="secondary" className="px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-primary/20 text-primary">
                        <Pin className="h-3 w-3 mr-1.5" /> Pinned
                      </Badge>
                    )}
                    {notice.important && (
                      <Badge className="px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20">
                         High Priority
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {notice.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium font-sans">
                    {notice.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-3 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 border-t border-border/10">
                     <div className="flex items-center gap-2">
                       <User className="w-3 h-3 text-primary/60" />
                       Authored by <span className="text-foreground/80">{notice.authorName}</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3 text-primary/60" />
                       {new Date(notice.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                     </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => togglePin(notice.id, !notice.pinned)}
                      className="h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all"
                    >
                      {notice.pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeNotice(notice.id)}
                      className="h-10 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/5 transition-all"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                )}
              </div>

              {notice.media.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                  {notice.media.map((item, index) => (
                    <div key={`${notice.id}-${index}`} className="group/media relative aspect-video rounded-xl overflow-hidden border border-border/40 bg-muted/20 hover:border-primary/30 transition-all shadow-sm">
                      {item.kind === 'image' ? (
                        <a href={item.url} target="_blank" rel="noreferrer" className="block w-full h-full">
                          <Image
                            src={item.url}
                            alt={item.name || 'Notice attachment'}
                            fill
                            unoptimized
                            className="object-cover group-hover/media:scale-110 transition-transform duration-500"
                          />
                        </a>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-2 text-center bg-background/40">
                           <a href={item.url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5">
                              <Tag className="w-4 h-4 text-primary" />
                              <span className="text-[8px] font-bold uppercase tracking-widest text-primary truncate max-w-full px-1">{item.name || 'View'}</span>
                           </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {notices.length === 0 && (
          <div className="py-24 text-center border-2 border-dashed border-primary/10 rounded-3xl bg-primary/[0.01] flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
              <Megaphone className="w-8 h-8 text-primary/40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-foreground/80">No Active Announcements</h3>
              <p className="text-sm text-center text-muted-foreground font-medium italic max-w-sm">The noticeboard is currently synchronized but empty. Check back later for campus updates.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
