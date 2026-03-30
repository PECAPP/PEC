'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BulkUpload from '@/components/BulkUpload';

import api from '@/lib/api';
import { fetchAllPages } from '@/lib/fetchAllPages';
import { useAuth } from '@/features/auth/hooks/useAuth';

type Course = {
  id: string;
  code: string;
  name: string;
  department?: string | null;
};

type Department = {
  id: string;
  name: string;
};

type ExamSchedule = {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  department?: string | null;
  examType: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
};

const examTypeOptions = ['Midterm', 'Final', 'Practical', 'Quiz'];

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

const isUpcoming = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return date.getTime() >= startOfToday.getTime();
};

export default function ExaminationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.replace('/auth');
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const role = user.role;
  const isCollegeAdmin = ['college_admin', 'admin', 'moderator'].includes(role || '');

  if (isCollegeAdmin) {
    return <CollegeAdminExaminations />;
  }

  if (role === 'faculty' || role === 'student') {
    return (
      <DepartmentUpcomingExams
        role={role}
        department={user.department || null}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Access denied</p>
    </div>
  );
}

function CollegeAdminExaminations() {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [examTypeFilter, setExamTypeFilter] = useState('all');
  const [dateScope, setDateScope] = useState<'all' | 'upcoming'>('all');

  const [scheduleForm, setScheduleForm] = useState({
    courseId: '',
    examType: 'Final',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
  });

  const selectedCourse = useMemo(
    () => courses.find((c) => c.id === scheduleForm.courseId),
    [courses, scheduleForm.courseId],
  );

  const loadSchedules = async () => {
    const params: Record<string, unknown> = {
      ...(departmentFilter !== 'all' ? { department: departmentFilter } : {}),
      ...(dateScope === 'upcoming' ? { upcoming: true } : {}),
    };
    const rows = await fetchAllPages<ExamSchedule>('/examinations/schedules', params);
    setSchedules(rows);
  };

  const bootstrap = async () => {
    try {
      setLoading(true);
      const [allCourses, allDepartments] = await Promise.all([
        fetchAllPages<Course>('/courses'),
        fetchAllPages<Department>('/departments'),
      ]);
      setCourses(allCourses);
      setDepartments(allDepartments);
      await loadSchedules();
    } catch (error) {
      console.error(error);
      toast.error('Failed to load examinations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (loading) return;
    void loadSchedules();
  }, [departmentFilter, dateScope]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const typeOk = examTypeFilter === 'all' || schedule.examType === examTypeFilter;
      return typeOk;
    });
  }, [schedules, examTypeFilter]);

  const handleAddSchedule = async () => {
    if (!scheduleForm.courseId || !scheduleForm.date || !scheduleForm.startTime || !scheduleForm.endTime || !scheduleForm.room) {
      toast.error('Please complete all schedule fields');
      return;
    }

    try {
      await api.post('/examinations/schedules', scheduleForm);
      toast.success('Exam schedule added');
      setScheduleForm({
        courseId: '',
        examType: 'Final',
        date: '',
        startTime: '',
        endTime: '',
        room: '',
      });
      await loadSchedules();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add schedule');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/examinations/schedules/${id}`);
      toast.success('Schedule deleted');
      await loadSchedules();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete schedule');
    }
  };

  const handleBulkImport = async (rows: any[]) => {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of rows) {
      try {
        const course = courses.find(
          (c) => String(c.code || '').toLowerCase() === String(row.courseCode || '').toLowerCase(),
        );

        if (!course) {
          throw new Error(`Course not found for code: ${row.courseCode}`);
        }

        await api.post('/examinations/schedules', {
          courseId: course.id,
          examType: row.examType || 'Final',
          date: row.date,
          startTime: row.startTime,
          endTime: row.endTime,
          room: row.room,
        });

        success += 1;
      } catch (error) {
        failed += 1;
        errors.push((error as Error).message);
      }
    }

    await loadSchedules();
    return { success, failed, errors };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Examinations</h1>
        <p className="text-muted-foreground">Manage schedules for all departments</p>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="upload">Bulk Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Select value={scheduleForm.courseId} onValueChange={(value) => setScheduleForm((p) => ({ ...p, courseId: value }))}>
              <SelectTrigger className="md:col-span-2"><SelectValue placeholder="Course" /></SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={scheduleForm.examType} onValueChange={(value) => setScheduleForm((p) => ({ ...p, examType: value }))}>
              <SelectTrigger><SelectValue placeholder="Exam type" /></SelectTrigger>
              <SelectContent>
                {examTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm((p) => ({ ...p, date: e.target.value }))} />
            <Input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm((p) => ({ ...p, startTime: e.target.value }))} />
            <Input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm((p) => ({ ...p, endTime: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input
              className="md:col-span-4"
              placeholder="Room"
              value={scheduleForm.room}
              onChange={(e) => setScheduleForm((p) => ({ ...p, room: e.target.value }))}
            />
            <Input className="md:col-span-2" value={selectedCourse?.department || ''} disabled placeholder="Department" />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleAddSchedule}><Plus className="w-4 h-4 mr-2" />Add Schedule</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger><SelectValue placeholder="Department filter" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.name}>{department.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
              <SelectTrigger><SelectValue placeholder="Exam type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {examTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateScope} onValueChange={(value) => setDateScope(value as 'all' | 'upcoming')}>
              <SelectTrigger><SelectValue placeholder="Date scope" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="upcoming">Upcoming Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredSchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No schedules found for selected filters.</p>
            ) : (
              filteredSchedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      {schedule.courseCode} - {schedule.courseName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {schedule.department || 'N/A'} - {formatDate(schedule.date)} - {schedule.startTime}-{schedule.endTime} - {schedule.room}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{schedule.examType}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Open Bulk Upload
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload exam schedules in bulk using `courseCode`, `examType`, `date`, `startTime`, `endTime`, `room`.
          </p>
        </TabsContent>
      </Tabs>

      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Exam Schedules</DialogTitle>
            <DialogDescription>Upload CSV/Excel schedules for multiple departments at once.</DialogDescription>
          </DialogHeader>
          <BulkUpload
            entityType="exams"
            onImport={handleBulkImport}
            templateColumns={['courseCode', 'examType', 'date', 'startTime', 'endTime', 'room']}
            sampleData={[
              {
                courseCode: 'CS301',
                examType: 'Final',
                date: '2026-04-20',
                startTime: '10:00',
                endTime: '13:00',
                room: 'Hall A',
              },
            ]}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function DepartmentUpcomingExams({
  role,
  department,
}: {
  role: 'student' | 'faculty';
  department: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [examTypeFilter, setExamTypeFilter] = useState('all');

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const rows = await fetchAllPages<ExamSchedule>('/examinations/schedules', {
          upcoming: true,
        });
        setSchedules(rows);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load upcoming exams');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return schedules
      .filter((schedule) => isUpcoming(schedule.date))
      .filter((schedule) => examTypeFilter === 'all' || schedule.examType === examTypeFilter)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [schedules, examTypeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upcoming Exams</h1>
        <p className="text-muted-foreground">
          {role === 'faculty' ? 'Faculty' : 'Student'} view for department: {department || 'Not set'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input value={department || ''} disabled placeholder="Department" />
        <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
          <SelectTrigger><SelectValue placeholder="Exam type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {examTypeOptions.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value="Upcoming only" disabled />
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming exams for your department.</p>
        ) : (
          filtered.map((schedule) => (
            <div key={schedule.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{schedule.courseCode} - {schedule.courseName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(schedule.date)} - {schedule.startTime}-{schedule.endTime} - {schedule.room}
                  </p>
                </div>
                <Badge variant="outline">{schedule.examType}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
