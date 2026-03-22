import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';

type ApiResponse<T> = { success: boolean; data: T; meta?: { total?: number } };

type Course = { id: string; code: string; name: string };
type Enrollment = { id: string; studentId: string; courseId: string; status: string };
type ExamSchedule = {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  examType: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
};
type Grade = {
  id: string;
  studentId: string;
  courseId: string;
  midterm?: number;
  final?: number;
  total?: number;
  grade?: string;
  credits?: number;
  remarks?: string;
};

const examTypeOptions = ['Midterm', 'Final', 'Practical', 'Quiz'];
const GRADES_ENDPOINT_DISABLED_KEY = 'api.examinations.grades.disabled';

const isGradesEndpointDisabled = () =>
  typeof window !== 'undefined' && sessionStorage.getItem(GRADES_ENDPOINT_DISABLED_KEY) === '1';

const disableGradesEndpoint = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(GRADES_ENDPOINT_DISABLED_KEY, '1');
  }
};

const isNotFoundError = (error: unknown) =>
  !!(error as any)?.response && (error as any).response.status === 404;

export default function Examinations() {
  const navigate = useNavigate();
  const { isAdmin, isFaculty, user, loading: authLoading } = usePermissions();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth', { replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin || isFaculty) {
    return <ExaminationsManager />;
  }

  return <StudentExaminationsView userId={user.uid} />;
}

function ExaminationsManager() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'grades'>('schedule');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [gradesMap, setGradesMap] = useState<Record<string, Partial<Grade>>>({});

  const [scheduleForm, setScheduleForm] = useState({
    courseId: '',
    examType: 'Final',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
  });

  const enrolledStudents = useMemo(
    () => enrollments.filter((e) => e.status === 'active' && e.courseId === selectedCourse),
    [enrollments, selectedCourse],
  );

  useEffect(() => {
    void bootstrap();
  }, []);

  useEffect(() => {
    if (activeTab === 'grades' && selectedCourse) {
      void loadGradesForCourse(selectedCourse);
    }
  }, [activeTab, selectedCourse]);

  const bootstrap = async () => {
    try {
      setLoading(true);
      const [coursesRes, schedulesRes, enrollmentsRes] = await Promise.all([
        api.get<ApiResponse<Course[]>>('/courses', { params: { limit: 200, offset: 0 } }),
        api.get<ApiResponse<ExamSchedule[]>>('/examinations/schedules', { params: { limit: 200, offset: 0 } }),
        api.get<ApiResponse<Enrollment[]>>('/enrollments', { params: { limit: 200, offset: 0, status: 'active' } }),
      ]);

      const loadedCourses = coursesRes.data.data || [];
      setCourses(loadedCourses);
      setSchedules(schedulesRes.data.data || []);
      setEnrollments(enrollmentsRes.data.data || []);

      if (loadedCourses.length > 0) {
        setSelectedCourse(loadedCourses[0].id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load examination data');
    } finally {
      setLoading(false);
    }
  };

  const loadGradesForCourse = async (courseId: string) => {
    if (isGradesEndpointDisabled()) {
      setGradesMap({});
      return;
    }

    try {
      const gradesRes = await api.get<ApiResponse<Grade[]>>('/examinations/grades', {
        params: { limit: 200, offset: 0, courseId },
      });
      const existing = gradesRes.data.data || [];
      const next: Record<string, Partial<Grade>> = {};
      existing.forEach((grade) => {
        next[grade.studentId] = grade;
      });
      setGradesMap(next);
    } catch (error) {
      if (isNotFoundError(error)) {
        disableGradesEndpoint();
        setGradesMap({});
        return;
      }
      console.error(error);
      toast.error('Failed to load grades');
    }
  };

  const handleAddSchedule = async () => {
    if (!scheduleForm.courseId || !scheduleForm.date || !scheduleForm.startTime || !scheduleForm.endTime || !scheduleForm.room) {
      toast.error('Fill all schedule fields');
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
      await bootstrap();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add schedule');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete schedule?')) return;
    try {
      await api.delete(`/examinations/schedules/${id}`);
      toast.success('Schedule deleted');
      await bootstrap();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete schedule');
    }
  };

  const handleGradeChange = (studentId: string, field: keyof Grade, value: string) => {
    setGradesMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: ['grade', 'remarks'].includes(field) ? value : Number(value || 0),
      },
    }));
  };

  const saveGrades = async () => {
    if (!selectedCourse) {
      toast.error('Select a course first');
      return;
    }

    try {
      setLoading(true);
      await Promise.all(
        enrolledStudents.map(async (student) => {
          const payload = gradesMap[student.studentId] || {};
          const midterm = Number(payload.midterm || 0);
          const final = Number(payload.final || 0);
          const total = Number(payload.total || midterm + final);
          const grade = String(payload.grade || '').trim();

          if (!grade && total === 0 && midterm === 0 && final === 0) {
            return;
          }

          await api.post('/examinations/grades', {
            studentId: student.studentId,
            courseId: selectedCourse,
            midterm,
            final,
            total,
            grade,
            credits: Number(payload.credits || 3),
            remarks: payload.remarks || '',
          });
        }),
      );

      toast.success('Grades saved');
      await loadGradesForCourse(selectedCourse);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save grades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Examinations</h1>
        <p className="text-muted-foreground">Manage exam schedules and student grades</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'schedule' | 'grades')}>
        <TabsList>
          <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Select value={scheduleForm.courseId} onValueChange={(value) => setScheduleForm((p) => ({ ...p, courseId: value }))}>
              <SelectTrigger className="md:col-span-2"><SelectValue placeholder="Course" /></SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>{course.code} - {course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={scheduleForm.examType} onValueChange={(value) => setScheduleForm((p) => ({ ...p, examType: value }))}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {examTypeOptions.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm((p) => ({ ...p, date: e.target.value }))} />
            <Input type="time" value={scheduleForm.startTime} onChange={(e) => setScheduleForm((p) => ({ ...p, startTime: e.target.value }))} />
            <Input type="time" value={scheduleForm.endTime} onChange={(e) => setScheduleForm((p) => ({ ...p, endTime: e.target.value }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input className="md:col-span-5" placeholder="Room" value={scheduleForm.room} onChange={(e) => setScheduleForm((p) => ({ ...p, room: e.target.value }))} />
            <Button onClick={handleAddSchedule}><Plus className="w-4 h-4 mr-2" />Add</Button>
          </div>

          <div className="space-y-2">
            {schedules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exam schedules yet</p>
            ) : (
              schedules.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-3 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">{schedule.courseCode} • {schedule.courseName}</div>
                    <div className="text-sm text-muted-foreground">{new Date(schedule.date).toLocaleDateString()} • {schedule.startTime}-{schedule.endTime} • {schedule.room}</div>
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

        <TabsContent value="grades" className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="max-w-md"><SelectValue placeholder="Select course" /></SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>{course.code} - {course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={saveGrades} disabled={loading}><Save className="w-4 h-4 mr-2" />Save Grades</Button>
          </div>

          <div className="space-y-2">
            {enrolledStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active enrollments for selected course</p>
            ) : (
              enrolledStudents.map((student) => {
                const grade = gradesMap[student.studentId] || {};
                return (
                  <div key={student.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 border rounded-lg p-3">
                    <Input value={student.studentId} readOnly className="md:col-span-2" />
                    <Input type="number" placeholder="Midterm" value={grade.midterm ?? ''} onChange={(e) => handleGradeChange(student.studentId, 'midterm', e.target.value)} />
                    <Input type="number" placeholder="Final" value={grade.final ?? ''} onChange={(e) => handleGradeChange(student.studentId, 'final', e.target.value)} />
                    <Input type="number" placeholder="Total" value={grade.total ?? ''} onChange={(e) => handleGradeChange(student.studentId, 'total', e.target.value)} />
                    <Input placeholder="Grade (A/B/C)" value={grade.grade ?? ''} onChange={(e) => handleGradeChange(student.studentId, 'grade', e.target.value)} />
                  </div>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}
    </motion.div>
  );
}

function StudentExaminationsView({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const schedulePromise = api.get<ApiResponse<ExamSchedule[]>>('/examinations/schedules', {
          params: { limit: 200, offset: 0 },
        });
        const gradesPromise = isGradesEndpointDisabled()
          ? Promise.resolve({ data: { success: true, data: [] as Grade[] } })
          : api.get<ApiResponse<Grade[]>>('/examinations/grades', {
              params: { limit: 200, offset: 0, studentId: userId },
            });

        const [scheduleRes, gradesRes] = await Promise.all([schedulePromise, gradesPromise]);
        setSchedules(scheduleRes.data.data || []);
        setGrades(gradesRes.data.data || []);
      } catch (error) {
        if (isNotFoundError(error)) {
          disableGradesEndpoint();
          setGrades([]);
          return;
        }
        console.error(error);
        toast.error('Failed to load examination data');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

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
        <h1 className="text-2xl font-bold text-foreground">Examinations & Grades</h1>
        <p className="text-muted-foreground">Your exam schedule and posted grades</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated p-5 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><Calendar className="w-5 h-5" />Upcoming Exams</h2>
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming exams</p>
          ) : (
            schedules.map((schedule) => (
              <div key={schedule.id} className="border rounded-lg p-3">
                <div className="font-medium">{schedule.courseCode} • {schedule.examType}</div>
                <div className="text-sm text-muted-foreground">{new Date(schedule.date).toLocaleDateString()} • {schedule.startTime}-{schedule.endTime} • {schedule.room}</div>
              </div>
            ))
          )}
        </div>

        <div className="card-elevated p-5 space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5" />My Grades</h2>
          {grades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No grades published yet</p>
          ) : (
            grades.map((grade) => (
              <div key={grade.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">Course ID: {grade.courseId}</div>
                  <div className="text-sm text-muted-foreground">Midterm: {grade.midterm ?? '-'} • Final: {grade.final ?? '-'} • Total: {grade.total ?? '-'}</div>
                </div>
                <Badge>{grade.grade || 'N/A'}</Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
