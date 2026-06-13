'use client';

import React from 'react';
import { Button } from '@pec/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@pec/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@pec/ui';
import { Input } from '@pec/ui';
import { Save } from 'lucide-react';

interface EditSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlot: {
    day?: string;
    timeSlot?: string;
    id?: string;
  } | null;
  courses: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  slotForm: {
    courseId: string;
    room: string;
  };
  setSlotForm: React.Dispatch<
    React.SetStateAction<{
      courseId: string;
      room: string;
    }>
  >;
  onSave: () => Promise<void>;
}

export default function EditSlotDialog({
  open,
  onOpenChange,
  selectedSlot,
  courses,
  slotForm,
  setSlotForm,
  onSave,
}: EditSlotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Timetable Slot</DialogTitle>
          <DialogDescription>
            {selectedSlot?.day} - {selectedSlot?.timeSlot}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
            <Select
              value={slotForm.courseId}
              onValueChange={(val) => setSlotForm((prev) => ({ ...prev, courseId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Room</label>
            <Input
              placeholder="e.g. 101, Lab 2"
              value={slotForm.room}
              onChange={(e) => setSlotForm((prev) => ({ ...prev, room: e.target.value }))}
            />
          </div>
          <Button onClick={onSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
