'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Eye, Save, Trash2, Plus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import api from '@/lib/api';
import { InteractiveCalendar } from '@/components/academic-calendar/InteractiveCalendar';
import { EventDetailModal } from '@/components/academic-calendar/EventDetailModal';
import { getEventLabel, EVENT_LABELS, CATEGORY_LABELS } from '@/components/academic-calendar/calendar-utils';
import { format } from 'date-fns';

interface ParsedEvent {
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
}

interface CalendarEvent {
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

export default function AdminAcademicCalendarPage() {
  const [view, setView] = useState<'upload' | 'preview' | 'calendar'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [savedEvents, setSavedEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/academic-calendar/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setParsedEvents(response.data.events || []);
      setView('preview');
      toast.success(`Parsed ${response.data.events?.length || 0} events from PDF`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to parse PDF');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const response = await api.post('/academic-calendar/bulk-import', {
        events: parsedEvents,
      });
      setSavedEvents(response.data.events || []);
      setView('calendar');
      toast.success(`Saved ${response.data.events?.length || 0} events to calendar`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save events');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await api.delete(`/academic-calendar/${id}`);
      setSavedEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('Event deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    }
  };

  const handleUpdateEvent = async (updatedEvent: CalendarEvent) => {
    try {
      const response = await api.patch(`/academic-calendar/${updatedEvent.id}`, updatedEvent);
      setSavedEvents((prev) =>
        prev.map((e) => (e.id === updatedEvent.id ? response.data : e))
      );
      toast.success('Event updated');
      setEditingEvent(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update event');
    }
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setEditingEvent({ ...event });
  };

  const handleEventDetail = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  const loadExistingEvents = async () => {
    try {
      const response = await api.get('/academic-calendar');
      setSavedEvents(response.data);
      setView('calendar');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load events');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Academic Calendar Management</h1>
        <p className="text-muted-foreground">
          Upload a PDF calendar, review extracted events, and manage the academic calendar
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          variant={view === 'upload' ? 'default' : 'outline'}
          onClick={() => setView('upload')}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload PDF
        </Button>
        {parsedEvents.length > 0 && (
          <Button
            variant={view === 'preview' ? 'default' : 'outline'}
            onClick={() => setView('preview')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Review Events ({parsedEvents.length})
          </Button>
        )}
        <Button
          variant={view === 'calendar' ? 'default' : 'outline'}
          onClick={loadExistingEvents}
        >
          Calendar View
        </Button>
      </div>

      {view === 'upload' && (
        <div className="space-y-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <div>
                  <p className="text-lg font-medium">Analyzing PDF with AI...</p>
                  <p className="text-muted-foreground">This may take a moment</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <FileText className="w-12 h-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? 'Drop the PDF here' : 'Upload Academic Calendar PDF'}
                  </p>
                  <p className="text-muted-foreground">
                    Drag and drop or click to select a file
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Supported format: PDF only
                </p>
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-semibold mb-3">How it works</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Upload your academic calendar PDF</li>
              <li>AI analyzes and extracts all events, holidays, and important dates</li>
              <li>Review and edit the extracted events</li>
              <li>Save to create the interactive calendar</li>
            </ol>
          </div>
        </div>
      )}

      {view === 'preview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Review Extracted Events</h2>
              <p className="text-muted-foreground">{parsedEvents.length} events found</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setView('upload')}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveAll} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save All Events
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Importance</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedEvents.map((event, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {event.title}
                    </TableCell>
                    <TableCell>
                      {event.date ? format(new Date(event.date), 'MMM d, yyyy') : 'N/A'}
                      {event.endDate && (
                        <span className="text-muted-foreground">
                          {' '}
                          - {format(new Date(event.endDate), 'MMM d, yyyy')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getEventLabel(event.eventType)}</Badge>
                    </TableCell>
                    <TableCell>{CATEGORY_LABELS[event.category] || event.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          event.importance === 'high'
                            ? 'text-red-600'
                            : event.importance === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }
                      >
                        {event.importance}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {event.location || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {view === 'calendar' && (
        <div className="space-y-6">
          <InteractiveCalendar
            events={savedEvents}
            isAdmin={true}
            onEventEdit={handleEventEdit}
            onEventDelete={handleDeleteEvent}
            onEventsChange={loadExistingEvents}
          />
        </div>
      )}

      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleUpdateEvent}
        />
      )}

      <EventDetailModal
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedEvent(null);
        }}
        isAdmin={true}
        onEdit={handleEventEdit}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}

function EventEditModal({
  event,
  isOpen,
  onClose,
  onSave,
}: {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
}) {
  const [formData, setFormData] = useState(event);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Event</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''}
                onChange={(e) =>
                  setFormData({ ...formData, date: new Date(e.target.value).toISOString() })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="eventType">Event Type</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData({ ...formData, eventType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="importance">Importance</Label>
              <Select
                value={formData.importance}
                onValueChange={(value) => setFormData({ ...formData, importance: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              value={formData.targetAudience || ''}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              placeholder="e.g., all, students, faculty"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
