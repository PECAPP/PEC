'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle, 
  Edit, 
  Trash2,
  Info,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getEventLabel,
  getEventColor,
  CATEGORY_LABELS,
  IMPORTANCE_COLORS,
} from './calendar-utils';
import api from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface AcademicCalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  eventType: string;
  category: string;
  location: string | null;
  importance: string;
  targetAudience: string | null;
  rawData: any;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EventDetailModalProps {
  event: AcademicCalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (event: AcademicCalendarEvent) => void;
  onDelete?: (id: string) => void;
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  isAdmin = false,
  onEdit,
  onDelete,
}: EventDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!event) return null;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/academic-calendar/${event.id}`);
      toast.success('Event deleted successfully');
      onDelete?.(event.id);
      onClose();
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-background/80 backdrop-blur-xl shadow-2xl rounded-[2rem]">
        {/* Modal Header/Banner */}
        <div className={cn(
          "h-32 w-full relative overflow-hidden",
          getEventColor(event.eventType).split(' ')[0] // Get bg color
        )}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
          <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <Badge variant="secondary" className="w-fit bg-background/80 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold py-0.5 border-none shadow-sm">
                {getEventLabel(event.eventType)}
              </Badge>
              <h2 className="text-2xl font-black tracking-tight text-foreground drop-shadow-sm">
                {event.title}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary font-bold text-[10px] uppercase tracking-wider">
              <Info className="w-3 h-3 mr-1.5" />
              {CATEGORY_LABELS[event.category] || event.category}
            </Badge>
            <Badge variant="outline" className={cn(
              "rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-wider border-none shadow-sm",
              event.importance === 'high' ? "bg-red-500 text-white" : 
              event.importance === 'medium' ? "bg-amber-500 text-white" : 
              "bg-emerald-500 text-white"
            )}>
              {event.importance} priority
            </Badge>
            {event.targetAudience && (
              <Badge variant="secondary" className="rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-wider">
                <Users className="w-3 h-3 mr-1.5" />
                {event.targetAudience}
              </Badge>
            )}
          </div>

          {/* Description Section */}
          {event.description && (
            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
              <p className="text-muted-foreground leading-relaxed italic border-l-0 pl-2">
                {event.description}
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ y: -2 }}
              className="flex items-start gap-4 p-5 bg-card/50 border border-border/40 rounded-3xl shadow-sm transition-all hover:bg-card hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <CalendarIcon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Scheduled Date</p>
                <p className="text-sm font-bold text-foreground">
                  {formatDate(event.date)}
                  {event.endDate && (
                    <span className="block text-xs mt-0.5 text-muted-foreground font-medium">
                      ends {formatDate(event.endDate)}
                    </span>
                  )}
                </p>
              </div>
            </motion.div>

            {(event.startTime || event.endTime) && (
              <motion.div 
                whileHover={{ y: -2 }}
                className="flex items-start gap-4 p-5 bg-card/50 border border-border/40 rounded-3xl shadow-sm transition-all hover:bg-card hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Time Interval</p>
                  <p className="text-sm font-bold text-foreground">
                    {event.startTime || 'TBD'} — {event.endTime || 'TBD'}
                  </p>
                </div>
              </motion.div>
            )}

            {event.location && (
              <motion.div 
                whileHover={{ y: -2 }}
                className="flex items-start gap-4 p-5 bg-card/50 border border-border/40 rounded-3xl shadow-sm transition-all hover:bg-card hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <MapPin className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Event Venue</p>
                  <p className="text-sm font-bold text-foreground">{event.location}</p>
                </div>
              </motion.div>
            )}

            {event.targetAudience && (
              <motion.div 
                whileHover={{ y: -2 }}
                className="flex items-start gap-4 p-5 bg-card/50 border border-border/40 rounded-3xl shadow-sm transition-all hover:bg-card hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Target Groups</p>
                  <p className="text-sm font-bold text-foreground">{event.targetAudience}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* High Priority Warning */}
          {event.importance === 'high' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
            >
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-tight">
                CRITICAL EVENT: This is a high-priority entry. Please ensure you clear your schedule or take necessary actions.
              </p>
            </motion.div>
          )}

          {/* Admin Actions */}
          {isAdmin && event.isEditable && (
            <div className="flex gap-4 pt-6 mt-4 border-t border-border/40">
              <Button
                onClick={() => onEdit?.(event)}
                className="flex-1 rounded-2xl h-12 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-2xl h-12 font-bold shadow-lg shadow-destructive/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Removing...' : 'Delete Event'}
              </Button>
            </div>
          )}
          
          <Button variant="ghost" onClick={onClose} className="w-full rounded-2xl text-muted-foreground hover:bg-muted/50 font-medium">
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
