'use client';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, PageBanner } from "@pec/ui";
import { Plus, QrCode } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [timePeriod, setTimePeriod] = useState<string>('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimePeriod('Good Morning');
    else if (hour < 17) setTimePeriod('Good Afternoon');
    else setTimePeriod('Good Evening');
  }, []);

  return (
    <PageBanner
      badgeText="Academic Management"
      title={timePeriod ? `${timePeriod}, Professor!` : 'Welcome, Professor!'}
      subtitle="Manage your courses, students, and institutional activities."
      actions={
        <>
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
            className="h-9 px-4 font-semibold tracking-tight shadow-sm shadow-primary/10"
          >
            <QrCode className="w-4 h-4 mr-2" />
            QR Attendance
          </Button>
        </>
      }
    />
  );
}


