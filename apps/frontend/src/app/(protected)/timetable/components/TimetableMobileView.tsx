'use client';

import React from 'react';
import { Badge } from '@pec/ui';

interface TimetableMobileViewProps {
  timetable: Record<string, any[]>;
  DAYS: string[];
  TIME_SLOTS: string[];
  isWeeklyView: boolean;
  selectedDay: string;
  setSelectedDay: (day: string) => void;
  applySlotFilters: (slots: any[]) => any[];
  getTimeStatus: (slotTime: string, day: string) => string;
  canManageAllTimetable: boolean;
  openSlotDialog: (day: string, timeSlot: string) => void;
  _user: any;
  _studentAttendanceMap: Map<string, number>;
  _facultyDisplayName: string;
}

export default function TimetableMobileView({
  timetable,
  DAYS,
  TIME_SLOTS,
  isWeeklyView,
  selectedDay,
  setSelectedDay,
  applySlotFilters,
  getTimeStatus,
  canManageAllTimetable,
  openSlotDialog,
  _user,
  _studentAttendanceMap,
  _facultyDisplayName,
}: TimetableMobileViewProps) {
  return (
    <div className="md:hidden space-y-5">
      {/* Day Selector (Hidden in Weekly View) */}
      {!isWeeklyView && (
        <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar snap-x overflow-y-hidden">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`snap-center shrink-0 min-w-[70px] py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-1.5 ${
                selectedDay === day
                  ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.35)] scale-105 z-10'
                  : 'bg-surface/60 backdrop-blur-sm text-muted-foreground border-border/50 hover:border-primary/30 hover:bg-muted/30'
              }`}
              style={
                selectedDay !== day
                  ? {
                      backgroundColor: `hsla(${30 + DAYS.indexOf(day) * 40}, 40%, 15%, 0.1)`,
                    }
                  : {}
              }
            >
              <span className="opacity-50 text-[8px] tracking-normal">{day.slice(0, 3)}</span>
              <span className={selectedDay === day ? 'text-primary-foreground' : 'text-foreground'}>
                {(() => {
                  const now = new Date();
                  const dayIndex = DAYS.indexOf(day);
                  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
                  const diff = dayIndex - todayIndex;
                  const date = new Date(now);
                  date.setDate(now.getDate() + diff);
                  return date.getDate();
                })()}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Timeline Feed or Weekly Matrix */}
      {isWeeklyView ? (
        <div className="space-y-6">
          {DAYS.map((day) => (
            <div key={day} className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/70 px-1 border-l-2 border-primary ml-1">
                {day}
              </h3>
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                {TIME_SLOTS.map((slot) => {
                  const key = `${day}-${slot}`;
                  const data = applySlotFilters(timetable[key] || []);
                  if (data.length === 0) return null;
                  return (
                    <div
                      key={slot}
                      className="bg-card border border-border/60 rounded-xl p-3 flex items-center gap-3 hover:border-primary/40 transition-colors shadow-sm"
                    >
                      <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-2 min-w-[60px]">
                        <span className="text-[10px] font-bold text-foreground">
                          {slot.split('-')[0]}
                        </span>
                        <span className="text-[8px] text-muted-foreground uppercase">
                          {slot.split('-')[1]}
                        </span>
                      </div>
                      <div className="flex-1">
                        {data.map((s: any, i: number) => (
                          <div key={i} className="text-xs">
                            <p className="font-bold text-foreground line-clamp-1">
                              {s.courseCode || s.courseName}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{s.room}</p>
                          </div>
                        ))}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40 shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(timetable).length === 0 && (
            <div className="py-12 text-center text-muted-foreground/40 italic text-sm">
              No weekly schedule entries found.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {TIME_SLOTS.map((timeSlot) => {
            const key = `${selectedDay}-${timeSlot}`;
            const slotData = timetable[key];
            const isLunch = timeSlot === '13:00-14:00';
            const status = getTimeStatus(timeSlot, selectedDay);
            const filteredSlots = applySlotFilters(slotData || []);

            if (isLunch) {
              return (
                <div key={timeSlot} className="flex items-center gap-4 opacity-50 my-4">
                  <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                    {timeSlot.split('-')[0]}
                  </span>
                  <div className="h-[1px] flex-1 bg-border border-dashed border-b"></div>
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Lunch
                  </span>
                  <div className="h-[1px] flex-1 bg-border border-dashed border-b"></div>
                </div>
              );
            }

            const isCompleted = status === 'completed';
            const isLive = status === 'live';

            if (!filteredSlots || filteredSlots.length === 0) {
              return (
                <div
                  key={timeSlot}
                  className={`flex gap-4 group ${isCompleted ? 'opacity-40 grayscale' : ''}`}
                >
                  <div className="flex flex-col items-end w-12 shrink-0">
                    <span className="text-sm font-bold text-foreground">
                      {timeSlot.split('-')[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {timeSlot.split('-')[1]}
                    </span>
                  </div>
                  {isLive ? (
                    <div className="flex-1 p-3 rounded-2xl border-2 border-primary bg-primary/5 flex items-center justify-center min-h-[80px] relative">
                      <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                        NOW
                      </span>
                      <span className="text-xs text-primary font-medium">Free Slot</span>
                    </div>
                  ) : (
                    <div className="flex-1 p-3 rounded-2xl border border-dashed border-border bg-muted/5 flex items-center justify-center min-h-[80px]">
                      <span className="text-xs text-muted-foreground/40 font-medium">
                        Free Slot
                      </span>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={timeSlot} className={`flex gap-4 ${isCompleted ? 'opacity-50' : ''}`}>
                <div className="flex flex-col items-end w-12 shrink-0">
                  <span
                    className={`text-sm font-bold ${isLive ? 'text-primary' : 'text-foreground'}`}
                  >
                    {timeSlot.split('-')[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {timeSlot.split('-')[1]}
                  </span>
                  <div
                    className={`h-full w-[2px] my-2 rounded-full relative ${
                      isLive ? 'bg-primary' : isCompleted ? 'bg-primary/20' : 'bg-border'
                    }`}
                  >
                    <div
                      className={`absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-4 ring-background ${
                        isLive
                          ? 'bg-primary animate-ping'
                          : isCompleted
                            ? 'bg-primary/50'
                            : 'bg-primary'
                      }`}
                    />
                    {isLive && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary ring-4 ring-background" />
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-3 pb-6">
                  {filteredSlots.map((slot: any, idx: number) => (
                    <div
                      key={idx}
                      className={`relative overflow-hidden rounded-2xl border-l-4 p-4 transition-all
                        ${isLive ? 'bg-card border-l-primary shadow-lg ring-1 ring-primary/20' : ''}
                        ${!isLive && !isCompleted ? 'bg-card border-l-primary shadow-sm hover:shadow-md' : ''}
                        ${isCompleted ? 'bg-muted/10 border-l-muted-foreground/30 shadow-none' : ''}
                      `}
                      onClick={() => canManageAllTimetable && openSlotDialog(selectedDay, timeSlot)}
                    >
                      {isLive && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] font-bold text-primary">LIVE</span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-muted">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            COMPLETED
                          </span>
                        </div>
                      )}
                      <div className="relative z-10">
                        <h4
                          className={`font-bold text-lg line-clamp-1 ${
                            isCompleted ? 'text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {slot.courseName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 mb-3">
                          <Badge
                            variant={isCompleted ? 'outline' : 'secondary'}
                            className="text-[10px] uppercase tracking-wider font-bold"
                          >
                            {slot.courseCode}
                          </Badge>
                          <span className="text-xs text-muted-foreground">|</span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded text-nowrap ${
                              isLive
                                ? 'text-primary bg-primary/10'
                                : 'text-muted-foreground bg-muted'
                            }`}
                          >
                            Room {slot.room}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${
                                isCompleted
                                  ? 'bg-gray-400'
                                  : 'bg-gradient-to-br from-primary to-purple-600'
                              }`}
                            >
                              {slot.facultyName?.[0] || '?'}
                            </div>
                            <span className="font-medium">{slot.facultyName || 'TBD'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
