'use client';

import { Bell, ArrowRight, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: string;
}

interface Props {
  notices: Notice[];
  onViewAll: () => void;
}

export function NoticeboardCard({ notices, onViewAll }: Props) {
  return (
    <div className="card-elevated ui-card-pad h-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Bell className="h-5 w-5 text-primary" />
          Latest Notices
        </h2>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs">
          View All
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No recent notices</p>
          </div>
        ) : (
          notices.map((notice, index) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-lg border border-border bg-secondary/5 p-3 hover:bg-secondary/10 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {notice.pinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {notice.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {notice.content}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-background shrink-0">
                  {notice.category}
                </Badge>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground/60 flex justify-end">
                {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
