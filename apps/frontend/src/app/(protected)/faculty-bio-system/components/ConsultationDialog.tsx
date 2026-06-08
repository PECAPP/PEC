import React from 'react';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Consultation } from '../types';

export default function ConsultationDialog({
  isOpen,
  onClose,
  editingConsultation,
  consultationForm,
  setConsultationForm,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingConsultation: Consultation | null;
  consultationForm: any;
  setConsultationForm: (form: any) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingConsultation ? 'Edit Consultation' : 'Add Consultation'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization *</label>
            <Input
              value={consultationForm.organization}
              onChange={(e) =>
                setConsultationForm({ ...consultationForm, organization: e.target.value })
              }
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={consultationForm.description}
              onChange={(e) =>
                setConsultationForm({ ...consultationForm, description: e.target.value })
              }
              className="mt-1"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={consultationForm.startDate}
                onChange={(e) =>
                  setConsultationForm({ ...consultationForm, startDate: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={consultationForm.endDate}
                onChange={(e) =>
                  setConsultationForm({ ...consultationForm, endDate: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select
              value={consultationForm.status}
              onValueChange={(v) => setConsultationForm({ ...consultationForm, status: v })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
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
