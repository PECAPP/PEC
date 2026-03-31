'use client';

import { Bell, ArrowUpRight, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/AsyncState';

export interface NoticeboardItem {
  id: string;
  title: string;
  content: string;
  category: 'news' | 'update' | 'event' | 'alert' | string;
  important?: boolean;
  pinned?: boolean;
  authorName?: string;
  publishedAt?: string;
}

interface Props {
  notices: NoticeboardItem[];
  onViewAll: () => void;
}

export function NoticeboardCard({ notices, onViewAll }: Props) {
  const safeNotices = Array.isArray(notices) ? notices : [];

  return (
    <div className="card-elevated ui-card-pad flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Bell className="h-5 w-5 text-primary" />
          Noticeboard
        </h2>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {safeNotices.length === 0 ? (
        <EmptyState title="No notices yet" description="You are all caught up." />
      ) : (
        <div className="space-y-3">
          {safeNotices.slice(0, 4).map((notice, index) => (
            <div
              key={`${notice.id || 'notice'}-${index}`}
              className="rounded-lg border border-border bg-secondary/10 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{notice.title}</p>
                    {notice.pinned && (
                      <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px]">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </Badge>
                    )}
                    {notice.important && (
                      <Badge variant="destructive" className="text-[10px]">Important</Badge>
                    )}
                    <Badge variant="outline" className="uppercase text-[10px]">
                      {notice.category || 'update'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {notice.content}
                  </p>
                </div>
                {notice.publishedAt && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {new Date(notice.publishedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
