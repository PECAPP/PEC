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
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Faculty Dashboard</h1>
        <p className="text-muted-foreground">Manage your courses, students, and academic activities</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onShowScheduleManager}>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
        <Select 
          value={selectedCourse?.id} 
          onValueChange={(value) => onSelectCourse(courses.find(c => c.id === value))}
        >
          <SelectTrigger className="w-[200px]">
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
        <Button 
          variant="gradient" 
          onClick={onGenerateQR}
          disabled={!selectedCourse}
        >
          <QrCode className="w-4 h-4 mr-2" />
          Generate QR
        </Button>
      </div>
    </div>
  );
}
