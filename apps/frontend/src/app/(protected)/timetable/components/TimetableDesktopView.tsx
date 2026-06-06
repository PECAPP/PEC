'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/common/AsyncState';

interface TimetableDesktopViewProps {
  timetable: Record<string, any[]>;
  DAYS: string[];
  TIME_SLOTS: string[];
  canManageAllTimetable: boolean;
  draggedCourse: any;
  user: any;
  studentAttendanceMap: Map<string, number>;
  filterValues: {
    department: string;
    [key: string]: any;
  };
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, day: string, timeSlot: string) => Promise<void>;
  handleDragEnd: () => void;
  openSlotDialog: (day: string, timeSlot: string) => void;
  applySlotFilters: (slots: any[]) => any[];
  handleDeleteSlot: (slotId: string) => Promise<void>;
}

export default function TimetableDesktopView({
  timetable,
  DAYS,
  TIME_SLOTS,
  canManageAllTimetable,
  draggedCourse,
  user,
  studentAttendanceMap,
  filterValues,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleDragEnd,
  openSlotDialog,
  applySlotFilters,
  handleDeleteSlot,
}: TimetableDesktopViewProps) {
  return (
    <div className="hidden md:block card-elevated overflow-x-auto overflow-y-auto max-h-[70vh] timetable-scroll-container">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/30">
            <th className="border border-border p-3 text-left text-sm font-medium text-muted-foreground min-w-[100px]">
              Time
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="border border-border p-3 text-center text-sm font-medium text-muted-foreground min-w-[150px]"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((timeSlot) => (
            <tr key={timeSlot}>
              <td className="border border-border p-3 text-sm font-medium text-muted-foreground bg-muted/20">
                {timeSlot}
              </td>
              {DAYS.map((day) => {
                const key = `${day}-${timeSlot}`;
                const slotData = timetable[key];
                const isLunch = timeSlot === '13:00-14:00';

                if (isLunch) {
                  return (
                    <td
                      key={`${day}-${timeSlot}`}
                      className="border border-border p-2 bg-muted/40 text-center align-middle"
                    >
                      {day === 'Wednesday' && (
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60 vertical-text block rotate-0">
                          Lunch Break
                        </span>
                      )}
                    </td>
                  );
                }

                return (
                  <td
                    key={`${day}-${timeSlot}`}
                    className={`border border-border p-2 relative group transition-colors min-h-[80px] ${
                      canManageAllTimetable ? 'hover:bg-muted/10 cursor-pointer' : ''
                    } ${draggedCourse ? 'drag-target' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day, timeSlot)}
                    onDragEnd={handleDragEnd}
                    onClick={() => canManageAllTimetable && openSlotDialog(day, timeSlot)}
                  >
                    {(() => {
                      if (!slotData || slotData.length === 0) {
                        return (
                          <div className="text-xs text-muted-foreground/30 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {canManageAllTimetable && 'Drop here'}
                          </div>
                        );
                      }

                      const scopedSlots = applySlotFilters(slotData);

                      if (scopedSlots.length === 0) {
                        return (
                          <div className="text-xs text-muted-foreground/30 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {canManageAllTimetable && 'Drop here'}
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-1">
                          {scopedSlots.map((slot: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-2 bg-primary/10 rounded-lg border border-primary/20 relative"
                            >
                              <div className="font-medium text-sm text-foreground">
                                {slot.courseCode || slot.courseName}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {slot.facultyName}
                              </div>
                              {slot.room && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/campus-map?search=${encodeURIComponent(
                                      slot.room
                                    )}`;
                                  }}
                                  className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-primary hover:underline group"
                                >
                                  <span className="bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                    {slot.room}
                                  </span>
                                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    → MAP
                                  </span>
                                </button>
                              )}

                              {user?.role === 'student' &&
                                studentAttendanceMap.has(slot.courseId) && (
                                  <div
                                    className={`mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                      (studentAttendanceMap.get(slot.courseId) || 0) < 75
                                        ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                        : 'bg-success/10 text-success border border-success/20'
                                    }`}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        (studentAttendanceMap.get(slot.courseId) || 0) < 75
                                          ? 'bg-destructive'
                                          : 'bg-success'
                                      }`}
                                    />
                                    {studentAttendanceMap.get(slot.courseId)}% Attended
                                  </div>
                                )}

                              {(user?.role === 'student' || filterValues.department === 'all') && (
                                <div className="text-[9px] opacity-70 mt-1 font-medium">
                                  {slot.department}
                                </div>
                              )}

                              {canManageAllTimetable && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSlot(slot.id);
                                  }}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded text-destructive transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {Object.keys(timetable).length === 0 && (
        <div className="p-4">
          <EmptyState
            title="No timetable entries"
            description="Add slots manually or use auto-generate."
          />
        </div>
      )}
    </div>
  );
}
