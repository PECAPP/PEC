'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  ExternalLink,
  X,
  Share2,
  Tag
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
      <DialogContent className="max-w-3xl p-0 overflow-hidden border border-border bg-background shadow-2xl rounded-sm flex flex-col max-h-[90vh]">
        <DialogTitle className="sr-only">{event.title}</DialogTitle>
        <DialogDescription className="sr-only">{event.description}</DialogDescription>
        
        {/* Modal Header/Banner - Fixed at top */}
        <div className={cn(
          "h-32 sm:h-48 w-full relative shrink-0 overflow-hidden flex items-end p-6 sm:p-10 border-b border-border bg-grid-pattern",
          getEventColor(event.eventType)
        )}>
          <div className="relative z-10 flex flex-col gap-3 sm:gap-4">
            <Badge className={cn(
              "w-fit px-2 sm:px-3 py-1 rounded-none text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 bg-background/20 backdrop-blur-md"
            )}>
              {getEventLabel(event.eventType)}
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-bold font-display tracking-tight uppercase leading-tight">
              {event.title}
            </h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-6 right-6 rounded-none bg-background/10 hover:bg-background/20 backdrop-blur-md text-white border border-white/10 transition-all font-display z-20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 custom-scrollbar">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 font-display">Time & Coordination</h4>
                <div className="flex items-center gap-5 bg-muted/5 p-5 rounded-sm border border-border/60 hover:border-primary/40 transition-colors">
                  <div className="w-14 h-14 rounded-none bg-primary/10 flex flex-col items-center justify-center border border-primary/20 shrink-0">
                    <span className="text-[10px] font-black uppercase leading-none text-primary/60">{format(new Date(event.date), 'MMM')}</span>
                    <span className="text-2xl font-bold leading-none font-display">{format(new Date(event.date), 'dd')}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm leading-none">{format(new Date(event.date), 'EEEE, MMMM do')}</p>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{event.startTime || 'All Day Event'}</p>
                  </div>
                </div>
              </div>

              {event.location && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 font-display">Operational Zone</h4>
                  <div className="flex items-center gap-5 bg-muted/5 p-5 rounded-sm border border-border/60 hover:border-primary/40 transition-colors">
                    <div className="w-14 h-14 rounded-none bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm leading-none font-display uppercase">{event.location}</p>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">PEC Main Campus Coordinates</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 font-display">Resource Mapping</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/5 p-5 rounded-sm border border-border/60 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Users className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Target Group</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest truncate">{event.targetAudience || 'General Body'}</p>
                  </div>
                  <div className="bg-muted/5 p-5 rounded-sm border border-border/60 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-primary/60">
                      <Tag className="w-4 h-4" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Classification</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest truncate">{CATEGORY_LABELS[event.category] || event.category}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 font-display">Impact Analysis</h4>
                <div className="flex items-center gap-4 bg-muted/5 p-5 rounded-sm border border-border/60">
                  <div className={cn(
                    "w-4 h-4 rounded-none shrink-0",
                    event.importance === 'high' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" : 
                    event.importance === 'medium' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : 
                    "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  )} />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none text-foreground/80">
                    Structural Intensity: <span className="text-foreground">{event.importance} priority</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {event.description && (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 font-display">Executive Brief</h4>
              <div className="bg-muted/[0.03] p-10 rounded-sm border border-border relative overflow-hidden bg-grid-pattern">
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
                <blockquote className="text-sm text-foreground/90 font-medium uppercase tracking-[0.15em] relative z-10 leading-loose text-center max-w-xl mx-auto italic">
                  "{event.description}"
                </blockquote>
              </div>
            </div>
          )}
          
          <div className="h-2" /> {/* Bottom spacing padding */}
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-6 sm:px-10 py-6 border-t border-border bg-background/80 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative z-30">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {isAdmin && event.isEditable ? (
              <>
                <Button
                  onClick={() => onEdit?.(event)}
                  className="w-full sm:w-auto rounded-none h-14 font-black uppercase tracking-widest px-10 shadow-sm transition-all bg-primary hover:bg-primary/90"
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Correct entry
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full sm:w-auto rounded-none h-14 font-black uppercase tracking-widest px-10 shadow-sm transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  {isDeleting ? 'Removing...' : 'Purge'}
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="w-full sm:w-auto rounded-none font-black uppercase tracking-widest h-14 px-10 shadow-xl transition-all bg-primary hover:bg-primary/90 group">
                  Register to Calendar
                  <ExternalLink className="w-4 h-4 ml-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-none font-black uppercase tracking-widest h-14 px-8 border-border hover:bg-muted/40 transition-all">
                  <Share2 className="w-4 h-4 mr-3" />
                  Distribute
                </Button>
              </>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 hover:text-primary transition-colors h-auto p-0 hover:bg-transparent"
          >
            Terminal View [X]
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
