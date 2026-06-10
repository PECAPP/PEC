import { Button, Badge, formatDate } from "@pec/ui";
import { Bell, ArrowUpRight, Pin } from 'lucide-react';

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
  className?: string;
}

export function NoticeboardCard({ notices, onViewAll, className }: Props) {
  const safeNotices = Array.isArray(notices) ? notices : [];

  return (
    <div className={`card-elevated ui-card-pad flex h-full flex-col ${className || ''}`}>
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

      <div className="flex-1 space-y-3">
        {safeNotices.length === 0 ? (
          <EmptyState title="No notices yet" description="You are all caught up." />
        ) : (
          <div className="space-y-3 pb-2">
            {safeNotices.slice(0, 4).map((notice, index) => (
              <div
                key={`${notice.id || 'notice'}-${index}`}
                className="rounded-sm border border-border bg-secondary/10 p-4 hover:border-primary/30 hover:bg-secondary/20 transition-colors duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{notice.title}</p>
                      {notice.pinned && (
                        <Badge variant="secondary" className="inline-flex items-center gap-1 text-[10px] h-4">
                          <Pin className="h-2.5 w-2.5" />
                          Pinned
                        </Badge>
                      )}
                      {notice.important && (
                        <Badge variant="destructive" className="text-[10px] h-4 bg-red-500/20 text-red-400 border-none">Important</Badge>
                      )}
                      <Badge variant="outline" className="uppercase text-[10px] h-4 bg-background/40">
                        {notice.category || 'update'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                  {notice.publishedAt && (
                    <div className="shrink-0 flex flex-col items-end justify-start pt-1">
                      <span className="text-[11px] font-bold text-foreground/80">
                        {formatDate(notice.publishedAt)}
                      </span>
                      <span className="text-lg font-bold text-foreground/90 leading-none">
                        {formatDate(notice.publishedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
