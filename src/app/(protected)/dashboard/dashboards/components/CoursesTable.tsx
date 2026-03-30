'use client';

import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface CoursesTableProps {
  courses: any[];
  onAddCourse: () => void;
  onEditCourse: (course: any) => void;
  onDeleteCourse: (courseId: string) => void;
}

export function CoursesTable({ 
  courses, 
  onAddCourse, 
  onEditCourse, 
  onDeleteCourse 
}: CoursesTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Input placeholder="Search courses..." className="max-w-sm w-full" />
        <Button onClick={onAddCourse} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />Add Course
        </Button>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Code</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Department</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Semester</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Enrolled</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No courses found. Create your first course!</td></tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium text-foreground">{course.code}</td>
                    <td className="p-4 text-foreground">{course.name}</td>
                    <td className="p-4 text-muted-foreground">{course.department}</td>
                    <td className="p-4 text-center text-muted-foreground">{course.semester}</td>
                    <td className="p-4 text-center">
                      <Badge variant="outline">{course.enrolledStudents || 0}/{course.maxStudents || 60}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEditCourse(course)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDeleteCourse(course.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
