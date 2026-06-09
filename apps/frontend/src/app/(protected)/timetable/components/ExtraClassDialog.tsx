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
import { Calendar } from 'lucide-react';

interface ExtraClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extraClassForm: {
    courseId: string;
    slotKey: string;
    room: string;
  };
  setExtraClassForm: React.Dispatch<
    React.SetStateAction<{
      courseId: string;
      slotKey: string;
      room: string;
    }>
  >;
  courses: any[];
  timetable: Record<string, any[]>;
  days: string[];
  timeSlots: string[];
  isSlotOwnedByFaculty: (slot: any) => boolean;
  onSchedule: () => Promise<void>;
  onCancel: () => void;
}

export default function ExtraClassDialog({
  open,
  onOpenChange,
  extraClassForm,
  setExtraClassForm,
  courses,
  timetable,
  days,
  timeSlots,
  isSlotOwnedByFaculty,
  onSchedule,
  onCancel,
}: ExtraClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Extra Class</DialogTitle>
          <DialogDescription>Add an extra class session to your timetable</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Course Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Course *</label>
            <Select
              value={extraClassForm.courseId}
              onValueChange={(value) =>
                setExtraClassForm((prev) => ({
                  ...prev,
                  courseId: value,
                  slotKey: '', // Reset slot when course changes
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your course" />
              </SelectTrigger>
              <SelectContent>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">No courses assigned</div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Day Selection */}
          {extraClassForm.courseId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Day *</label>
              <Select
                value={extraClassForm.slotKey?.split('-')[0] || ''}
                onValueChange={(day) => {
                  setExtraClassForm((prev) => ({
                    ...prev,
                    slotKey: `${day}-`, // Placeholder for time selection
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time Slot Selection */}
          {extraClassForm.courseId && extraClassForm.slotKey?.split('-')[0] && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Slot *</label>
              <Select
                value={extraClassForm.slotKey || ''}
                onValueChange={(value) =>
                  setExtraClassForm((prev) => ({ ...prev, slotKey: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select available time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots
                    .filter((t) => t !== '13:00-14:00')
                    .map((timeSlot) => {
                      const selectedDay = extraClassForm.slotKey?.split('-')[0];
                      const key = `${selectedDay}-${timeSlot}`;
                      const slots = timetable[key] || [];
                      const hasFacultyClass = slots.some((slot: any) => isSlotOwnedByFaculty(slot));
                      const isAvailable = !hasFacultyClass;

                      return (
                        <SelectItem key={key} value={key} disabled={!isAvailable}>
                          <span>
                            {timeSlot}
                            {!isAvailable && ' (Busy)'}
                          </span>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Room Input */}
          {extraClassForm.courseId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Room</label>
              <Input
                placeholder="e.g. L-10, Lab 2, or leave blank for TBD"
                value={extraClassForm.room}
                onChange={(e) => setExtraClassForm((prev) => ({ ...prev, room: e.target.value }))}
              />
            </div>
          )}

          {/* Auto-populated Fields Info */}
          {extraClassForm.courseId &&
            extraClassForm.slotKey &&
            !extraClassForm.slotKey.endsWith('-') && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2 text-sm">
                <p className="font-medium text-blue-900">Auto-populated from course:</p>
                <div className="text-xs text-blue-800 space-y-1">
                  {(() => {
                    const course = courses.find((c) => c.id === extraClassForm.courseId);
                    return (
                      <>
                        <div>
                          • <strong>Program:</strong> {course?.department || 'N/A'}
                        </div>
                        <div>
                          • <strong>Semester:</strong> {course?.semester || 'N/A'}
                        </div>
                        {course?.batch && (
                          <div>
                            • <strong>Batch:</strong> {course.batch}
                          </div>
                        )}
                        <div>
                          • <strong>Slot:</strong> {extraClassForm.slotKey.replace('-', ' at ')}
                        </div>
                        <div>
                          • <strong>Room:</strong> {extraClassForm.room || 'TBD'}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={onSchedule}
              className="flex-1"
              disabled={
                !extraClassForm.courseId ||
                !extraClassForm.slotKey ||
                extraClassForm.slotKey.endsWith('-') ||
                courses.length === 0
              }
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
