'use client';
import { Button, Input, Textarea, Badge, Switch, Label, formatDate, AppShellSkeleton, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, PageBanner } from "@pec/ui";


import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Loader2,
  Megaphone,
  Pin,
  Trash2,
  Calendar,
  User,
  Tag,
  Plus,
  Settings2,
  Edit2,
} from 'lucide-react';
import { toast } from 'sonner';

import api from "@pec/api";
import { useAuth } from '@/features/auth/hooks/useAuth';

import { MediaUpload, UploadedMedia } from '@/features/clubs/MediaUpload';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '@/providers/socket-provider';

import { NoticeMedia, NoticeItem } from './types';

const categories: Array<NoticeItem['category']> = ['news', 'update', 'event', 'alert'];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NoticeboardClient({ initialNotices, session }: { initialNotices: NoticeItem[], session: any }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeItem['category']>('update');
  const [priorityLevel, setPriorityLevel] = useState<number>(2);
  const [pinned, setPinned] = useState(false);
  const [media, setMedia] = useState<NoticeMedia[]>([]);
  const [posting, setPosting] = useState(false);

  // Edit states
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState<NoticeItem['category']>('update');
  const [editPriorityLevel, setEditPriorityLevel] = useState<number>(2);
  const [editPinned, setEditPinned] = useState(false);
  const [editMedia, setEditMedia] = useState<NoticeMedia[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (socket && isConnected) {
      const handleNewNotice = (notice: NoticeItem) => {
        setNotices(prev => {
          if (prev.some(n => n.id === notice.id)) return prev;
          return [notice, ...prev].sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            if (a.priorityLevel !== b.priorityLevel) return b.priorityLevel - a.priorityLevel;
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          });
        });
      };

      const handleNoticeUpdated = (notice: NoticeItem) => {
        setNotices(prev => {
          return prev.map(n => n.id === notice.id ? notice : n).sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            if (a.priorityLevel !== b.priorityLevel) return b.priorityLevel - a.priorityLevel;
            return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
          });
        });
      };

      const handleNoticeDeleted = ({ id }: { id: string }) => {
        setNotices(prev => prev.filter(n => n.id !== id));
      };

      socket.on('newNotice', handleNewNotice);
      socket.on('noticeUpdated', handleNoticeUpdated);
      socket.on('noticeDeleted', handleNoticeDeleted);

      return () => {
        socket.off('newNotice', handleNewNotice);
        socket.off('noticeUpdated', handleNoticeUpdated);
        socket.off('noticeDeleted', handleNoticeDeleted);
      };
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    if (!['student', 'faculty', 'college_admin', 'super_admin'].includes(user.role || '')) {
      router.replace('/dashboard');
      return;
    }
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
        important: priorityLevel === 3,
        priorityLevel,
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
      setPriorityLevel(2);
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

  const openEditModal = (notice: NoticeItem) => {
    setEditingNotice(notice);
    setEditTitle(notice.title);
    setEditContent(notice.content);
    setEditCategory(notice.category);
    setEditPriorityLevel(notice.priorityLevel);
    setEditPinned(notice.pinned);
    setEditMedia(notice.media || []);
  };

  const saveEdit = async () => {
    if (!editingNotice) return;
    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      toast.error('Required fields: Title and Content');
      return;
    }

    try {
      setSavingEdit(true);
      await api.patch(`/noticeboard/${editingNotice.id}`, {
        title: trimmedTitle,
        content: trimmedContent,
        category: editCategory,
        important: editPriorityLevel === 3,
        priorityLevel: editPriorityLevel,
        pinned: editPinned,
        mediaJson: editMedia.length > 0 ? JSON.stringify(editMedia.map((item) => ({
          url: item.url,
          kind: item.kind,
          name: item.name,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
        }))) : null,
      });
      toast.success('Notice updated successfully');
      setEditingNotice(null);
      await loadNotices();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error?.message || 'Failed to update notice');
    } finally {
      setSavingEdit(false);
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
        <AppShellSkeleton />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Syncing Noticeboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Institutional Header */}
      <PageBanner
        title="Noticeboard"
        subtitle="Campus-wide announcements and academic updates"
        badgeText="Communications"
        icon={<Megaphone className="w-7 h-7 text-primary" />}
        actions={
          isAdmin && (
            <Button
              onClick={() =>
                document.getElementById('post-notice-form')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <Plus className="w-4 h-4 mr-2" /> New Announcement
            </Button>
          )
        }
      />

      {isAdmin && (
        <div
          id="post-notice-form"
          className="bg-card/60 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 backdrop-blur-sm space-y-4"
        >
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Create Announcement</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium  text-muted-foreground opacity-60">
                Title
              </Label>
              <Input
                placeholder="Enter notice title"
                className="h-11 rounded-sm bg-background border-border/60 font-bold px-4 text-sm"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium  text-muted-foreground opacity-60">
                Category
              </Label>
              <select
                className="h-11 w-full rounded-sm border border-border/60 bg-background px-4 text-xs font-bold  focus:ring-primary/20"
                value={category}
                onChange={(event) => setCategory(event.target.value as NoticeItem['category'])}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium  text-muted-foreground opacity-60">
              Content
            </Label>
            <Textarea
              rows={3}
              placeholder="Write the announcement details..."
              className="rounded-sm bg-background border-border/60 font-medium p-4 resize-none text-sm"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-border/10">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="notice-priority"
                  className="text-sm font-medium  opacity-80"
                >
                  Priority
                </Label>
                <select
                  id="notice-priority"
                  className="h-8 rounded-sm border border-border/60 bg-background px-2 text-xs font-bold  focus:ring-primary/20"
                  value={priorityLevel}
                  onChange={(e) => setPriorityLevel(Number(e.target.value))}
                >
                  <option value={3}>High</option>
                  <option value={2}>Medium</option>
                  <option value={1}>Low</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <Switch id="notice-pinned" checked={pinned} onCheckedChange={setPinned} />
                <Label
                  htmlFor="notice-pinned"
                  className="text-sm font-medium  opacity-80"
                >
                  Pin to Top
                </Label>
              </div>
            </div>

            <MediaUpload onMediaAdd={handleMediaAdd} onMediaRemove={handleMediaRemove} />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={createNotice}
              disabled={posting}
              className="h-11 px-10 rounded-sm bg-primary text-primary-foreground font-medium text-sm  shadow-md border border-border/40 hover:scale-[1.02] transition-all"
            >
              {posting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Megaphone className="h-4 w-4 mr-2" />
              )}
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
                'bg-card/90 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 backdrop-blur-sm hover:border-border/40 transition-all group',
                notice.priorityLevel === 3 &&
                  'border-l-4 border-l-destructive shadow-sm shadow-destructive/5',
                notice.priorityLevel === 2 &&
                  'border-l-4 border-l-orange-500 shadow-sm shadow-orange-500/5',
                notice.priorityLevel === 1 &&
                  'border-l-4 border-l-emerald-500 shadow-sm shadow-emerald-500/5'
              )}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge
                      className={cn(
                        'px-3 py-1 rounded-sm font-medium text-sm ',
                        notice.category === 'alert'
                          ? 'bg-destructive/10 text-destructive'
                          : notice.category === 'event'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted/80 text-muted-foreground'
                      )}
                    >
                      {notice.category}
                    </Badge>
                    {notice.pinned && (
                      <Badge
                        variant="secondary"
                        className="px-3 py-1 rounded-sm font-medium text-sm  border border-border/40 text-primary"
                      >
                        <Pin className="h-3 w-3 mr-1.5" /> Pinned
                      </Badge>
                    )}
                    {notice.priorityLevel === 3 && (
                      <Badge className="px-3 py-1 rounded-sm font-medium text-sm  bg-destructive text-destructive-foreground shadow-sm shadow-destructive/20">
                        High Priority
                      </Badge>
                    )}
                    {notice.priorityLevel === 2 && (
                      <Badge className="px-3 py-1 rounded-sm font-medium text-sm  bg-orange-500/15 text-orange-600 border-orange-500/20">
                        Medium Priority
                      </Badge>
                    )}
                    {notice.priorityLevel === 1 && (
                      <Badge className="px-3 py-1 rounded-sm font-medium text-sm  bg-emerald-500/15 text-emerald-600 border-emerald-500/20">
                        Low Priority
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {notice.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium font-sans">
                    {notice.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-3 text-xs font-medium  text-muted-foreground/60 border-t border-border/10">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-primary/60" />
                      Authored by <span className="text-foreground/80">{notice.authorName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-primary/60" />
                      {formatDate(notice.publishedAt)}
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex md:flex-col gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(notice)}
                      className="h-10 px-4 rounded-sm font-medium text-sm transition-all"
                    >
                      <Edit2 className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePin(notice.id, !notice.pinned)}
                      className="h-10 px-4 rounded-sm font-medium text-sm  transition-all"
                    >
                      {notice.pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotice(notice.id)}
                      className="h-10 px-4 rounded-sm font-medium text-sm  text-destructive hover:bg-destructive/5 transition-all"
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                )}
              </div>

              {notice.media.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                  {notice.media.map((item, index) => (
                    <div
                      key={`${notice.id}-${index}`}
                      className="group/media relative aspect-video rounded-sm overflow-hidden border border-border/40 bg-muted/20 hover:border-border/40 transition-all shadow-sm"
                    >
                      {item.kind === 'image' ? (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-full h-full"
                        >
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
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-col items-center gap-1.5"
                          >
                            <Tag className="w-4 h-4 text-primary" />
                            <span className="text-[8px] font-bold  text-primary truncate  px-1">
                              {item.name || 'View'}
                            </span>
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
          <div className="py-24 text-center border border-dashed border-border/40 rounded-sm bg-primary/[0.01] flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-border/40">
              <Megaphone className="w-8 h-8 text-primary/40" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-foreground/80">
                No Active Announcements
              </h3>
              <p className="text-sm text-center text-muted-foreground font-medium italic ">
                The noticeboard is currently synchronized but empty. Check back later for campus
                updates.
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!editingNotice} onOpenChange={(open) => !open && setEditingNotice(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="rounded-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select
                  className="h-10 w-full rounded-sm border border-border/60 bg-background px-4 text-sm font-medium focus:ring-primary/20"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as NoticeItem['category'])}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>{item.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea
                rows={4}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="rounded-sm resize-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <Label>Priority</Label>
                <select
                  className="h-10 w-full rounded-sm border border-border/60 bg-background px-4 text-sm font-medium focus:ring-primary/20"
                  value={editPriorityLevel}
                  onChange={(e) => setEditPriorityLevel(Number(e.target.value))}
                >
                  <option value={3}>High</option>
                  <option value={2}>Medium</option>
                  <option value={1}>Low</option>
                </select>
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                <Label>Pin to Top</Label>
                <Switch checked={editPinned} onCheckedChange={setEditPinned} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Media</Label>
              <MediaUpload 
                onMediaAdd={async (uploaded) => {
                  try {
                    const dataUrl = await fileToDataUrl(uploaded.file);
                    setEditMedia((prev) => [...prev, {
                      id: uploaded.id,
                      url: dataUrl,
                      kind: uploaded.kind,
                      name: uploaded.name,
                      mimeType: uploaded.mimeType,
                      sizeBytes: uploaded.file.size,
                    }]);
                  } catch (e) {
                    toast.error('Failed to attach media');
                  }
                }} 
                onMediaRemove={(id) => setEditMedia(prev => prev.filter(m => m.id !== id))} 
              />
              {editMedia.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editMedia.map((m, i) => (
                    <Badge key={i} variant="secondary" className="text-xs truncate max-w-[150px]">
                      {m.name || 'Attachment'}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingNotice(null)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={savingEdit}>
              {savingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

