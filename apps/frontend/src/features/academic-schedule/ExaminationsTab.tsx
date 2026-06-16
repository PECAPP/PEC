'use client';
import { extractData } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, formatDate } from "@pec/ui";


import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, Upload, Edit, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import BulkUpload from '@/components/BulkUpload';

import api from "@pec/api";

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



const isUpcoming = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return date.getTime() >= startOfToday.getTime();
};

export default function ExaminationsTab() {
  const router = useRouter();
  const { user, loading: authLoading, ability } = useAuth();

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

  const canManageExams = ability?.can('create', 'Examination');

  if (canManageExams) {
    return <CollegeAdminExaminations />;
  }

  return (
    <DepartmentUpcomingExams
      _role={user.role as any}
      department={user.department || null}
    />
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

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editScheduleForm, setEditScheduleForm] = useState({
    id: '',
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
    const rows = extractData<any>((await api.get('/examinations/schedules', { params: { ...params, limit: 2000 } })).data);
    setSchedules(rows);
  };

  const bootstrap = async () => {
    try {
      setLoading(true);
      const [allCourses, allDepartments] = await Promise.all([
        api.get('/courses', { params: { limit: 2000 } }).then(res => extractData<any>(res.data)),
        api.get('/departments', { params: { limit: 2000 } }).then(res => extractData<any>(res.data)),
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

  const handleEditScheduleSubmit = async () => {
    if (!editScheduleForm.date || !editScheduleForm.startTime || !editScheduleForm.endTime || !editScheduleForm.room) {
      toast.error('Please complete all schedule fields');
      return;
    }

    try {
      await api.patch(`/examinations/schedules/${editScheduleForm.id}`, editScheduleForm);
      toast.success('Exam schedule updated');
      setEditModalOpen(false);
      await loadSchedules();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update schedule');
    }
  };

  const openEditModal = (schedule: ExamSchedule) => {
    setEditScheduleForm({
      id: schedule.id,
      courseId: schedule.courseId,
      examType: schedule.examType,
      date: schedule.date.split('T')[0],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
    });
    setEditModalOpen(true);
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
      <div className="flex items-center gap-3 pb-2">
        <h2 className="text-base font-bold text-foreground">Manage Examinations</h2>
        <span className="text-xs text-muted-foreground">All departments</span>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="mb-6">
          <TabsTrigger value="schedule" className="gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Bulk Upload
          </TabsTrigger>
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

          <div className="border rounded-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No schedules found for selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{schedule.courseCode}</span>
                          <span className="text-xs text-muted-foreground font-normal">{schedule.courseName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.department || 'N/A'}</TableCell>
                      <TableCell>{formatDate(schedule.date)}</TableCell>
                      <TableCell>{schedule.startTime} - {schedule.endTime}</TableCell>
                      <TableCell>{schedule.room}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{schedule.examType}</Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(schedule)}>
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteSchedule(schedule.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Exam Schedule</DialogTitle>
            <DialogDescription>Update details for the selected examination schedule.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-3">
              <Select value={editScheduleForm.courseId} onValueChange={(value) => setEditScheduleForm((p) => ({ ...p, courseId: value }))}>
                <SelectTrigger><SelectValue placeholder="Course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={editScheduleForm.examType} onValueChange={(value) => setEditScheduleForm((p) => ({ ...p, examType: value }))}>
                <SelectTrigger><SelectValue placeholder="Exam type" /></SelectTrigger>
                <SelectContent>
                  {examTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Input type="date" value={editScheduleForm.date} onChange={(e) => setEditScheduleForm((p) => ({ ...p, date: e.target.value }))} />
                <Input placeholder="Room" value={editScheduleForm.room} onChange={(e) => setEditScheduleForm((p) => ({ ...p, room: e.target.value }))} />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Input type="time" value={editScheduleForm.startTime} onChange={(e) => setEditScheduleForm((p) => ({ ...p, startTime: e.target.value }))} />
                <Input type="time" value={editScheduleForm.endTime} onChange={(e) => setEditScheduleForm((p) => ({ ...p, endTime: e.target.value }))} />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={() => setEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleEditScheduleSubmit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function DepartmentUpcomingExams({
  _role,
  department,
}: {
  _role: 'student' | 'faculty';
  department: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [examTypeFilter, setExamTypeFilter] = useState('all');

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        const rows = extractData<any>((await api.get('/examinations/schedules', { params: { ...{
          upcoming: true,
        }, limit: 2000 } })).data);
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
      <div className="flex items-center gap-3 pb-2">
        <h2 className="text-base font-bold text-foreground">Upcoming Exams</h2>
        {department && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {department}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
          Upcoming only
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={examTypeFilter} onValueChange={setExamTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Exam type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {examTypeOptions.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border/60 rounded-sm overflow-hidden bg-card shadow-2xl">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted border-b border-border/60">
              <TableHead className="w-40 font-bold uppercase text-[10px]  text-primary py-4 border-r border-border/60 text-center">Status & Date</TableHead>
              <TableHead className="font-bold uppercase text-[10px]  py-4 border-r border-border/60">Course Details</TableHead>
              <TableHead className="font-bold uppercase text-[10px]  py-4 border-r border-border/60">Time Slot</TableHead>
              <TableHead className="font-bold uppercase text-[10px]  py-4 border-r border-border/60">Venue</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px]  py-4">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(() => {
              const grouped = filtered.reduce((acc, exam) => {
                const dateStr = formatDate(exam.date);
                if (!acc[dateStr]) acc[dateStr] = [];
                acc[dateStr].push(exam);
                return acc;
              }, {} as Record<string, ExamSchedule[]>);

              const dateKeys = Object.keys(grouped);

              if (dateKeys.length === 0) {
                return (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-24 text-muted-foreground italic font-medium">
                      No upcoming exams found for your department.
                    </TableCell>
                  </TableRow>
                );
              }

              return dateKeys.map((dateKey) => {
                const exams = grouped[dateKey];
                const examDate = new Date(exams[0].date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffTime = examDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const isVerySoon = diffDays <= 2;

                return exams.map((exam, idx) => (
                  <TableRow 
                    key={exam.id} 
                    className={`group transition-all duration-200 border-b border-border/60 ${isVerySoon ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'}`}
                  >
                    {/* Date Column - Clubbed for the first item in the group */}
                    {idx === 0 && (
                      <TableCell 
                        rowSpan={exams.length} 
                        className={`align-top border-r border-border/60 py-6 text-center ${isVerySoon ? 'bg-primary/10' : 'bg-muted/30'}`}
                      >
                        <div className="flex flex-col items-center justify-center space-y-2 sticky top-6">
                          <span className={`text-sm font-medium leading-none px-2 py-1 rounded-full ${isVerySoon ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                            {diffDays === 0 ? 'TODAY' : diffDays === 1 ? 'TOMORROW' : `${diffDays}D LEFT`}
                          </span>
                          <div className="flex flex-col items-center">
                            <span className="text-3xl font-bold text-foreground tracking-tighter">{examDate.getDate()}</span>
                            <span className="text-sm font-medium text-muted-foreground ">{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(examDate)}</span>
                            <div className="h-px w-8 bg-border/60 my-1" />
                            <span className="text-xs font-medium text-primary uppercase tracking-tight">{new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(examDate)}</span>
                          </div>
                        </div>
                      </TableCell>
                    )}

                    {/* Content Columns with borders */}
                    <TableCell className="py-6 border-r border-border/60">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">{exam.courseCode}</span>
                        <span className="text-[11px] text-muted-foreground font-medium leading-tight">{exam.courseName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 border-r border-border/60">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-sm border font-mono text-xs font-bold leading-none shadow-sm ${isVerySoon ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-background border-border/60 text-muted-foreground'}`}>
                         {exam.startTime} — {exam.endTime}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 border-r border-border/60">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground/40  mb-0.5">Venue</span>
                        <span className="text-sm font-bold text-foreground ">{exam.room}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 text-right">
                      <Badge variant={isVerySoon ? 'default' : 'outline'} className="font-bold uppercase text-[9px]  px-2 shadow-sm">
                        {exam.examType}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ));
              });
            })()}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
