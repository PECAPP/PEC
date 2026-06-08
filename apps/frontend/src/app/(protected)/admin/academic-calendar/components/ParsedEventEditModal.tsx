import React, { useState } from 'react';
import {
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@pec/ui';
import { EVENT_LABELS, CATEGORY_LABELS } from '@/features/academic-calendar/calendar-utils';
import { format } from 'date-fns';
import { ParsedEvent } from '../types';

export default function ParsedEventEditModal({
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
