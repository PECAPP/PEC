'use client';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, Card, useToast } from "@pec/ui";
import { useState } from 'react';
import { useTimetableControllerCreateV1 } from '@pec/api';
import { usePermissions } from '@/hooks/usePermissions';
import { Calendar, Plus, Edit, Bell } from 'lucide-react';

interface FacultyScheduleManagerProps {
  courses: any[];
  onScheduleAdded?: () => void;
}

export function FacultyScheduleManager({ courses, onScheduleAdded }: FacultyScheduleManagerProps) {
  const createTimetable = useTimetableControllerCreateV1();
  const { toast } = useToast();
  const { user } = usePermissions();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    courseId: '',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    type: 'extra' as 'extra' | 'makeup',
    reason: '',
  });

  const handleAddExtraClass = async () => {
    try {
      if (!user || !formData.courseId || !formData.date || !formData.startTime || !formData.endTime) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);

      const course = courses.find(c => c.id === formData.courseId);
      if (!course) return;

      // Conflict checking and notifications are handled by the backend
      await createTimetable.mutateAsync({
        data: {
          courseId: formData.courseId,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room,
          type: formData.type,
          reason: formData.reason,
        } as any,
      });

      toast({
        title: 'Class Added',
        description: `${formData.type === 'extra' ? 'Extra' : 'Makeup'} class scheduled successfully`,
      });

      setShowAddDialog(false);
      setFormData({
        courseId: '',
        date: '',
        startTime: '',
        endTime: '',
        room: '',
        type: 'extra',
        reason: '',
      });

      if (onScheduleAdded) {
        onScheduleAdded();
      }
    } catch (error) {
      console.error('Error adding class:', error);
      toast({
        title: 'Error',
        description: 'Failed to add class',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Schedule Management</h3>
            <p className="text-sm text-muted-foreground">Add extra classes or makeup sessions</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-sm">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Extra Classes</p>
              <p className="text-xs text-muted-foreground">Schedule additional sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-sm">
            <Edit className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Makeup Classes</p>
              <p className="text-xs text-muted-foreground">Reschedule missed sessions</p>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Class</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course *</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => setFormData({ ...formData, courseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'extra' | 'makeup') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extra">Extra Class</SelectItem>
                  <SelectItem value="makeup">Makeup Class</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Room</Label>
              <Input
                placeholder="e.g., Room 301"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason (Optional)</Label>
              <Input
                placeholder="e.g., Exam preparation"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-sm">
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Students will be notified about this class
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddExtraClass}
                className="flex-1"
                disabled={loading || createTimetable.isPending}
              >
                {loading || createTimetable.isPending ? 'Adding...' : 'Add Class'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FacultyScheduleManager;
