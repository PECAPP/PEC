import React from 'react';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@pec/ui';
import { Input } from '@pec/ui';
import { Textarea } from '@pec/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@pec/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@pec/ui';
import { Conference } from '../types';

export default function ConferenceDialog({
  isOpen,
  onClose,
  editingConference,
  conferenceForm,
  setConferenceForm,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingConference: Conference | null;
  conferenceForm: any;
  setConferenceForm: (form: any) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingConference ? 'Edit Conference' : 'Add Conference'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Conference Name *</label>
            <Input
              value={conferenceForm.name}
              onChange={(e) => setConferenceForm({ ...conferenceForm, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Location</label>
            <Input
              value={conferenceForm.location}
              onChange={(e) => setConferenceForm({ ...conferenceForm, location: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={conferenceForm.startDate}
                onChange={(e) =>
                  setConferenceForm({ ...conferenceForm, startDate: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={conferenceForm.endDate}
                onChange={(e) => setConferenceForm({ ...conferenceForm, endDate: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <Select
              value={conferenceForm.role}
              onValueChange={(v) => setConferenceForm({ ...conferenceForm, role: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presenter">Presenter</SelectItem>
                <SelectItem value="keynote">Keynote Speaker</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="attendee">Attendee</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Presentation Title</label>
            <Input
              value={conferenceForm.presentationTitle}
              onChange={(e) =>
                setConferenceForm({ ...conferenceForm, presentationTitle: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={conferenceForm.description}
              onChange={(e) =>
                setConferenceForm({ ...conferenceForm, description: e.target.value })
              }
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
