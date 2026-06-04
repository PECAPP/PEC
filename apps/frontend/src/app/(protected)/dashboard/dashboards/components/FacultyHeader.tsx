'use client';

import { Plus, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  courses: any[];
  selectedCourse: any;
  onSelectCourse: (course: any) => void;
  onShowScheduleManager: () => void;
  onGenerateQR: () => void;
}

export function FacultyHeader({ 
  courses, 
  selectedCourse, 
  onSelectCourse, 
  onShowScheduleManager, 
  onGenerateQR 
}: Props) {
  const getTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="relative overflow-hidden p-6 rounded-2xl bg-card border border-border flex flex-col gap-6 md:flex-row md:items-center md:justify-between shadow-sm">
      <div className="space-y-1.5 z-10">
        <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider mb-0.5">
          Academic Management
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          {getTimePeriod()}, Professor!
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your courses, students, and institutional activities.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 z-10">
        <Button variant="outline" size="sm" onClick={onShowScheduleManager} className="h-9 px-3">
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
        <Select 
          value={selectedCourse?.id} 
          onValueChange={(value) => onSelectCourse(courses.find(c => c.id === value))}
        >
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id} className="text-xs">
                {course.code} - {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="gradient" 
          size="sm"
          onClick={onGenerateQR}
          disabled={!selectedCourse}
          className="h-9 px-4 font-semibold tracking-tight shadow-lg shadow-primary/10"
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR Attendance
        </Button>
      </div>
    </div>
  );
}
