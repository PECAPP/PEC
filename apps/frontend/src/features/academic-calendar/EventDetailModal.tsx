'use client';
import { Dialog, DialogContent, DialogTitle, DialogDescription, Badge, Button } from "@pec/ui";


import { useState } from 'react';

import { 
  MapPin, 
  Users, 
  Edit, 
  Trash2,
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
} from './calendar-utils';
import api from "@pec/api";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background rounded-sm flex flex-col max-h-[90vh]">
        <DialogTitle className="sr-only">{event.title}</DialogTitle>
        <DialogDescription className="sr-only">{event.description}</DialogDescription>
        
        {/* Modal Header */}
        <div className={cn(
          "p-6 sm:p-8 border-b relative",
          getEventColor(event.eventType)
        )}>
          <div className="flex flex-col gap-3 pr-8">
            <Badge className="w-fit text-xs font-semibold rounded-sm">
              {getEventLabel(event.eventType)}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {event.title}
            </h2>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-6 right-6 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Date & Time</h4>
                <div className="flex items-center gap-4 p-4 rounded-sm bg-muted/50 border">
                  <div className="w-12 h-12 rounded-sm bg-background flex flex-col items-center justify-center border shadow-sm shrink-0 text-primary">
                    <span className="text-xs font-semibold uppercase">{format(new Date(event.date), 'MMM')}</span>
                    <span className="text-xl font-bold">{format(new Date(event.date), 'dd')}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{format(new Date(event.date), 'EEEE, MMMM do')}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.startTime || 'All Day Event'}</p>
                  </div>
                </div>
              </div>

              {event.location && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Location</h4>
                  <div className="flex items-center gap-4 p-4 rounded-sm bg-muted/50 border">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border shadow-sm text-primary shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.location}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PEC Campus</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Event Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-sm bg-muted/50 border space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Audience</span>
                    </div>
                    <p className="text-sm font-medium">{event.targetAudience || 'General Body'}</p>
                  </div>
                  <div className="p-4 rounded-sm bg-muted/50 border space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Tag className="w-4 h-4" />
                      <span className="text-xs font-medium">Category</span>
                    </div>
                    <p className="text-sm font-medium">{CATEGORY_LABELS[event.category] || event.category}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Importance</h4>
                <div className="flex items-center gap-3 p-4 rounded-sm bg-muted/50 border">
                  <div className={cn(
                    "w-3 h-3 rounded-full shrink-0",
                    event.importance === 'high' ? "bg-red-500" : 
                    event.importance === 'medium' ? "bg-amber-500" : 
                    "bg-emerald-500"
                  )} />
                  <p className="text-sm font-medium capitalize">
                    {event.importance} Priority
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          {event.description && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground">Description</h4>
              <div className="p-5 rounded-sm border bg-card text-sm leading-relaxed text-foreground/90">
                {event.description}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t bg-muted/20 flex flex-col sm:flex-row items-center gap-3 justify-end shrink-0">
          {isAdmin && event.isEditable ? (
            <>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                onClick={() => onEdit?.(event)}
                className="w-full sm:w-auto"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Event
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full sm:w-auto">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button className="w-full sm:w-auto">
                Add to Calendar
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
