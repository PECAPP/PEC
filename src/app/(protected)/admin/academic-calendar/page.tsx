'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, Eye, Save, Trash2, Plus, Edit, X } from 'lucide-react';
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
import { format, isValid, parseISO } from 'date-fns';

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
  const [editingParsedIndex, setEditingParsedIndex] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReplaceConfirmOpen, setIsReplaceConfirmOpen] = useState(false);
  const [createDate, setCreateDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isSaving, setIsSaving] = useState(false);

  const isIsoDateValid = (value: string | null | undefined) => {
    if (!value) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    return isValid(parseISO(value));
  };

  const getEventsWithInvalidDates = (events: ParsedEvent[]) => {
    return events.filter((event) => {
      if (!isIsoDateValid(event.date)) return true;
      if (event.endDate && !isIsoDateValid(event.endDate)) return true;
      return false;
    });
  };

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

      const events = response.data.events || [];
      const invalidDateEvents = getEventsWithInvalidDates(events);

      if (invalidDateEvents.length > 0) {
        toast.error(
          `Gemini returned ${invalidDateEvents.length} event(s) with invalid date format. Please re-upload or fix the source PDF.`
        );
        setParsedEvents([]);
        setView('upload');
        return;
      }

      setParsedEvents(events);
      setView('preview');
      toast.success(`Parsed ${events.length} events from PDF. Review and edit before replacing calendar.`);
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

  const handleReplaceAll = async () => {
    const invalidDateEvents = getEventsWithInvalidDates(parsedEvents);
    if (invalidDateEvents.length > 0) {
      toast.error('Please fix invalid dates before saving reviewed events.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post('/academic-calendar/bulk-import', {
        events: parsedEvents,
      });
      setSavedEvents(response.data.events || []);
      setIsReplaceConfirmOpen(false);
      setView('calendar');
      toast.success(`Replaced calendar with ${response.data.events?.length || 0} reviewed events`);
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

  const handleDeleteParsedEvent = (index: number) => {
    setParsedEvents((prev) => prev.filter((_, i) => i !== index));
    toast.success('Parsed event removed');
  };

  const handleSaveParsedEvent = (index: number, updatedEvent: ParsedEvent) => {
    setParsedEvents((prev) => prev.map((event, i) => (i === index ? updatedEvent : event)));
    setEditingParsedIndex(null);
    toast.success('Parsed event updated');
  };

  const handleAddParsedEvent = () => {
    setParsedEvents((prev) => [
      ...prev,
      {
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        endDate: null,
        startTime: null,
        endTime: null,
        eventType: 'event',
        category: 'academic',
        location: null,
        importance: 'medium',
        targetAudience: 'all',
      },
    ]);
    setEditingParsedIndex(parsedEvents.length);
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

  const loadExistingEvents = async () => {
    try {
      const response = await api.get('/academic-calendar');
      setSavedEvents(response.data);
      setView('calendar');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load events');
    }
  };

  const handleOpenCreateForDate = (date: string) => {
    setCreateDate(date);
    setIsCreateModalOpen(true);
  };

  const handleCreateEvent = async (newEvent: ParsedEvent) => {
    try {
      const response = await api.post('/academic-calendar', newEvent);
      setSavedEvents((prev) => [...prev, response.data]);
      setIsCreateModalOpen(false);
      toast.success('Event created');
      await loadExistingEvents();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
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
              <Button variant="outline" onClick={handleAddParsedEvent}>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
              <Button variant="outline" onClick={() => setView('upload')}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => setIsReplaceConfirmOpen(true)} disabled={isSaving || parsedEvents.length === 0}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Replacing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Replace Calendar Data
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
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingParsedIndex(index)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteParsedEvent(index)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
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
            onCreateEventAtDate={handleOpenCreateForDate}
          />
        </div>
      )}

      {editingParsedIndex !== null && (
        <ParsedEventEditModal
          event={parsedEvents[editingParsedIndex]}
          isOpen={true}
          onClose={() => setEditingParsedIndex(null)}
          onSave={(updatedEvent) => handleSaveParsedEvent(editingParsedIndex as number, updatedEvent)}
        />
      )}

      {isReplaceConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg border max-w-lg w-full p-6 space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Save reviewed calendar?</h2>
              <p className="text-sm text-muted-foreground">
                Choose one option. Replacing will remove old rows from academic calendar and insert the reviewed Gemini events.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsReplaceConfirmOpen(false)}>
                Keep Older Calendar
              </Button>
              <Button onClick={handleReplaceAll} disabled={isSaving || parsedEvents.length === 0}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Replacing...
                  </>
                ) : (
                  'Save Reviewed Edits'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <ParsedEventEditModal
          event={{
            title: '',
            description: '',
            date: createDate,
            endDate: null,
            startTime: null,
            endTime: null,
            eventType: 'event',
            category: 'academic',
            location: null,
            importance: 'medium',
            targetAudience: 'all',
          }}
          isOpen={isCreateModalOpen}
          title="Create Event"
          submitLabel="Create Event"
          onClose={() => setIsCreateModalOpen(false)}
          onSave={handleCreateEvent}
        />
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

function ParsedEventEditModal({
  event,
  isOpen,
  title = 'Edit Parsed Event',
  submitLabel = 'Save Event',
  onClose,
  onSave,
}: {
  event: ParsedEvent;
  isOpen: boolean;
  title?: string;
  submitLabel?: string;
  onClose: () => void;
  onSave: (event: ParsedEvent) => void;
}) {
  const [formData, setFormData] = useState<ParsedEvent>(event);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      location: formData.location?.trim() || null,
      targetAudience: formData.targetAudience?.trim() || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="parsed-title">Title</Label>
            <Input
              id="parsed-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="parsed-description">Description</Label>
            <Textarea
              id="parsed-description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parsed-date">Date</Label>
              <Input
                id="parsed-date"
                type="date"
                value={formData.date ? format(new Date(formData.date), 'yyyy-MM-dd') : ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="parsed-end-date">End Date</Label>
              <Input
                id="parsed-end-date"
                type="date"
                value={formData.endDate ? format(new Date(formData.endDate), 'yyyy-MM-dd') : ''}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value ? e.target.value : null })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parsed-eventType">Event Type</Label>
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

            <div>
              <Label htmlFor="parsed-category">Category</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parsed-startTime">Start Time</Label>
              <Input
                id="parsed-startTime"
                type="time"
                value={formData.startTime || ''}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value ? e.target.value : null })
                }
              />
            </div>

            <div>
              <Label htmlFor="parsed-endTime">End Time</Label>
              <Input
                id="parsed-endTime"
                type="time"
                value={formData.endTime || ''}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value ? e.target.value : null })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parsed-importance">Importance</Label>
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

            <div>
              <Label htmlFor="parsed-targetAudience">Target Audience</Label>
              <Input
                id="parsed-targetAudience"
                value={formData.targetAudience || ''}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value || null })
                }
                placeholder="all, students, faculty..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="parsed-location">Location</Label>
            <Input
              id="parsed-location"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value || null })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </div>
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
