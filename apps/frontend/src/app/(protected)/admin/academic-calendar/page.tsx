'use client';
import { Button, Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@pec/ui";


import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader2, Eye, Save, Trash2, Plus, Edit, X } from 'lucide-react';

import { toast } from 'sonner';
import api from "@pec/api";
import { InteractiveCalendar } from '@/features/academic-calendar/InteractiveCalendar';
import { EventDetailModal } from '@/features/academic-calendar/EventDetailModal';
import {
  getEventLabel,
  CATEGORY_LABELS,
} from '@/features/academic-calendar/calendar-utils';
import { format, isValid, parseISO } from 'date-fns';
import { ParsedEvent, CalendarEvent } from './types';
import ParsedEventEditModal from './components/ParsedEventEditModal';
import EventEditModal from './components/EventEditModal';

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
      toast.success(
        `Parsed ${events.length} events from PDF. Review and edit before replacing calendar.`
      );
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
      setSavedEvents((prev) => prev.map((e) => (e.id === updatedEvent.id ? response.data : e)));
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
        <Button variant={view === 'calendar' ? 'default' : 'outline'} onClick={loadExistingEvents}>
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
                  <p className="text-muted-foreground">Drag and drop or click to select a file</p>
                </div>
                <p className="text-sm text-muted-foreground">Supported format: PDF only</p>
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
              <Button
                onClick={() => setIsReplaceConfirmOpen(true)}
                disabled={isSaving || parsedEvents.length === 0}
              >
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
          onSave={(updatedEvent) =>
            handleSaveParsedEvent(editingParsedIndex as number, updatedEvent)
          }
        />
      )}

      {isReplaceConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg border max-w-lg w-full p-6 space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Save reviewed calendar?</h2>
              <p className="text-sm text-muted-foreground">
                Choose one option. Replacing will remove old rows from academic calendar and insert
                the reviewed Gemini events.
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
