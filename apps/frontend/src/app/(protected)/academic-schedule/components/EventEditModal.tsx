import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle } from '@pec/ui';
import { CalendarEvent } from '../types';
import { BaseEventModalForm } from './BaseEventModal';

export default function EventEditModal({
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
  const [formData, setFormData] = useState<CalendarEvent>(event);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" w-full p-0 overflow-hidden bg-background">
        <div className="p-6 border-b">
          <DialogTitle className="text-xl font-semibold">Edit Event</DialogTitle>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <BaseEventModalForm
            formData={formData}
            setFormData={(data) => setFormData(data as CalendarEvent)}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
