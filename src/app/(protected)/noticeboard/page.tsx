'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, Megaphone, Pin, Trash2 } from 'lucide-react';
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
      toast.error('Failed to load noticeboard');
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
        toast.error('Failed to process attachment');
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
      toast.error('Title and content are required');
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
      toast.success('Notice posted');
      setTitle('');
      setContent('');
      setCategory('update');
      setImportant(false);
      setPinned(false);
      setMedia([]);
      await loadNotices();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error?.message || 'Failed to post notice');
    } finally {
      setPosting(false);
    }
  };

  const removeNotice = async (id: string) => {
    try {
      await api.delete(`/noticeboard/${id}`);
      toast.success('Notice removed');
      await loadNotices();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error?.message || 'Failed to remove notice');
    }
  };

  const togglePin = async (id: string, nextPinned: boolean) => {
    try {
      await api.patch(`/noticeboard/${id}/pin`, { pinned: nextPinned });
      await loadNotices();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.error?.message || 'Failed to update pin');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          Noticeboard
        </h1>
        <p className="text-muted-foreground">
          Campus-wide news, updates, and important announcements.
        </p>
      </div>

      {isAdmin && (
        <div className="card-elevated ui-card-pad space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Post New Notice</h2>

          <Input
            placeholder="Notice title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <Textarea
            rows={4}
            placeholder="Write notice content..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="notice-category">Category</Label>
            <select
              id="notice-category"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={category}
              onChange={(event) => setCategory(event.target.value as NoticeItem['category'])}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 ml-2">
              <Switch id="notice-important" checked={important} onCheckedChange={setImportant} />
              <Label htmlFor="notice-important">Important</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch id="notice-pinned" checked={pinned} onCheckedChange={setPinned} />
              <Label htmlFor="notice-pinned">Pin</Label>
            </div>
          </div>

          <MediaUpload onMediaAdd={handleMediaAdd} onMediaRemove={handleMediaRemove} />

          <div className="flex justify-end">
            <Button onClick={createNotice} disabled={posting}>
              {posting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Publish Notice
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="card-elevated ui-card-pad space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground">{notice.title}</h3>
                  {notice.pinned && (
                    <Badge variant="secondary" className="inline-flex items-center gap-1">
                      <Pin className="h-3 w-3" /> Pinned
                    </Badge>
                  )}
                  {notice.important && <Badge variant="destructive">Important</Badge>}
                  <Badge variant="outline" className="uppercase">{notice.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Posted by {notice.authorName} on {new Date(notice.publishedAt).toLocaleString()}
                </p>
              </div>

              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => togglePin(notice.id, !notice.pinned)}>
                    {notice.pinned ? 'Unpin' : 'Pin'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => removeNotice(notice.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <p className="text-sm text-foreground whitespace-pre-wrap">{notice.content}</p>

            {notice.media.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {notice.media.map((item, index) => (
                  <div key={`${notice.id}-${index}`} className="border border-border rounded-md p-2">
                    {item.kind === 'image' ? (
                      <a href={item.url} target="_blank" rel="noreferrer" className="block">
                        <Image
                          src={item.url}
                          alt={item.name || 'notice media'}
                          width={640}
                          height={320}
                          unoptimized
                          className="w-full h-32 object-cover rounded"
                        />
                      </a>
                    ) : item.kind === 'audio' ? (
                      <audio controls src={item.url} className="w-full" />
                    ) : item.kind === 'video' ? (
                      <video controls src={item.url} className="w-full h-32 rounded" />
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {item.name || 'Open attachment'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {notices.length === 0 && (
          <div className="card-elevated ui-card-pad text-sm text-muted-foreground text-center">
            No notices published yet.
          </div>
        )}
      </div>
    </div>
  );
}
