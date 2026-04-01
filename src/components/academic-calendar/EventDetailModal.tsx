'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  getEventLabel,
  CATEGORY_LABELS,
  IMPORTANCE_COLORS,
} from './calendar-utils';
import api from '@/lib/api';
import { toast } from 'sonner';

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
    return format(new Date(dateStr), 'EEEE, MMMM d, yyyy');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl font-semibold">{event.title}</DialogTitle>
            <Badge className={getEventLabel(event.eventType)}>
              {getEventLabel(event.eventType)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{CATEGORY_LABELS[event.category] || event.category}</Badge>
            <Badge variant="outline" className={IMPORTANCE_COLORS[event.importance]}>
              {event.importance} priority
            </Badge>
            {event.targetAudience && (
              <Badge variant="secondary">{event.targetAudience}</Badge>
            )}
          </div>

          {event.description && (
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(event.date)}
                  {event.endDate && (
                    <span>
                      {' '}
                      to {formatDate(event.endDate)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {(event.startTime || event.endTime) && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {event.startTime || 'TBD'} - {event.endTime || 'TBD'}
                  </p>
                </div>
              </div>
            )}

            {event.location && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}

            {event.targetAudience && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Users className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Target Audience</p>
                  <p className="text-sm text-muted-foreground">{event.targetAudience}</p>
                </div>
              </div>
            )}
          </div>

          {event.importance === 'high' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-700 dark:text-red-300">
                This is a high-priority event. Please mark your calendar.
              </p>
            </div>
          )}

          {isAdmin && event.isEditable && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => onEdit?.(event)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Event
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete Event'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
