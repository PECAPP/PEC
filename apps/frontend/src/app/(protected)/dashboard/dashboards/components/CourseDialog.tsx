'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCourse: any;
  courseForm: any;
  setCourseForm: (form: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CourseDialog({
  open,
  onOpenChange,
  editingCourse,
  courseForm,
  setCourseForm,
  onSubmit,
  onCancel,
}: CourseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
          <DialogDescription>
            {editingCourse ? 'Update course details' : 'Add a new course to the system'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Course Code</label>
              <Input 
                value={courseForm.code} 
                onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} 
                placeholder="CS301" 
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Course Name</label>
              <Input 
                value={courseForm.name} 
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} 
                placeholder="Data Structures" 
                className="mt-1" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Department</label>
              <Input 
                value={courseForm.department} 
                onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })} 
                placeholder="Computer Science" 
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Faculty Name</label>
              <Input 
                value={courseForm.facultyName} 
                onChange={(e) => setCourseForm({ ...courseForm, facultyName: e.target.value })} 
                placeholder="Dr. John Smith" 
                className="mt-1" 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Semester</label>
              <Input 
                type="number" 
                value={courseForm.semester} 
                onChange={(e) => setCourseForm({ ...courseForm, semester: parseInt(e.target.value) })} 
                className="mt-1" 
                min="1" 
                max="8" 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Credits</label>
              <Input 
                type="number" 
                value={courseForm.credits} 
                onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })} 
                className="mt-1" 
                min="1" 
                max="6" 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Students</label>
              <Input 
                type="number" 
                value={courseForm.maxStudents} 
                onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) })} 
                className="mt-1" 
                min="10" 
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea 
              value={courseForm.description} 
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} 
              placeholder="Course description..." 
              className="mt-1 w-full min-h-[80px] p-2 rounded-md border border-border bg-background" 
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={onSubmit} className="flex-1">
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
