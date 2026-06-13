import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogTitle } from '@pec/ui';
import { ParsedEvent } from '../types';
import { BaseEventModalForm } from './BaseEventModal';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" w-full p-0 overflow-hidden bg-background">
        <div className="p-3 md:p-6 border-b">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </div>

        <form onSubmit={handleSubmit} className="p-3 md:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <BaseEventModalForm
            formData={formData}
            setFormData={(data) => setFormData(data as ParsedEvent)}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{submitLabel}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
