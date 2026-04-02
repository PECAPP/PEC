'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, Plus, Trash2, Save, X, TrendingUp, BookOpen, Sigma, Download, Loader2 } from 'lucide-react';
import { 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  Legend,
  ComposedChart
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/hooks/usePermissions';
import { fetchAllPages } from '@/lib/fetchAllPages';
import api from '@/lib/api';
import { extractData } from '@/lib/utils';
import { toast } from 'sonner';

type CgpaEntry = {
  id: string;
  courseId?: string;
  subjectName: string;
  courseCode: string;
  semester: number;
  credits: number;
  gradePoint: number;
  examDate: string;
  notes: string;
  createdAt: string;
};

const emptyForm: Omit<CgpaEntry, 'id' | 'createdAt'> = {
  subjectName: '',
  courseId: '',
  courseCode: '',
  semester: 0,
  credits: 3,
  gradePoint: 8,
  examDate: '',
  notes: '',
};

type CourseOption = {
  id: string;
  code: string;
  name: string;
  semester?: number;
  credits?: number;
};

const toNumber = (value: unknown, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeEntry = (raw: any): CgpaEntry => ({
  id: String(raw?.id),
  courseId: raw?.courseId ? String(raw.courseId) : undefined,
  subjectName: String(raw?.subjectName || '').trim(),
  courseCode: String(raw?.courseCode || '').trim(),
  semester: Math.max(1, toNumber(raw?.semester, 1)),
  credits: clamp(toNumber(raw?.credits, 3), 0.5, 12),
  gradePoint: clamp(toNumber(raw?.gradePoint, 0), 0, 10),
  examDate: raw?.examDate ? String(raw.examDate).slice(0, 10) : '',
  notes: String(raw?.notes || ''),
  createdAt: String(raw?.createdAt || new Date().toISOString()),
});

export default function ScoreSheetPage() {
  const router = useRouter();
  const { user, isStudent, loading } = usePermissions();
  const [entries, setEntries] = useState<CgpaEntry[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [savingEntry, setSavingEntry] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !isStudent) {
      router.replace('/dashboard');
      return;
    }
    let active = true;
    const loadEntries = async () => {
      try {
        setApiLoading(true);
        const response = await api.get('/cgpa-entries', {
          params: { limit: 2000, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' },
        });
        const data = extractData<any[]>(response.data);
        if (!active) return;
        setEntries(Array.isArray(data) ? data.map(normalizeEntry) : []);
      } catch (error: any) {
        if (!active) return;
        setEntries([]);
        toast.error(error?.message || 'Failed to load CGPA entries.');
      } finally {
        if (active) setApiLoading(false);
      }
    };

    void loadEntries();
    return () => {
      active = false;
    };
  }, [loading, user, isStudent, router]);

  useEffect(() => {
    if (loading || !user || !isStudent) return;

    let active = true;
    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const allCourses = await fetchAllPages<any>('/courses');
        if (!active) return;
        const normalized = (allCourses || []).map((course: any) => {
          const semester =
            course.semester != null && Number.isFinite(Number(course.semester))
              ? Number(course.semester)
              : undefined;
          const credits =
            course.credits != null && Number.isFinite(Number(course.credits))
              ? Number(course.credits)
              : undefined;

          return {
            id: String(course.id),
            code: String(course.code || ''),
            name: String(course.name || course.courseName || ''),
            semester,
            credits,
          };
        });
        setCourses(normalized);
      } catch {
        if (active) setCourses([]);
      } finally {
        if (active) setCoursesLoading(false);
      }
    };

    void loadCourses();
    return () => {
      active = false;
    };
  }, [loading, user, isStudent]);

  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { cgpa: 0, totalSubjects: 0, totalCredits: 0, latestSgpa: 0 };
    }

    const totalCredits = entries.reduce((sum, item) => sum + item.credits, 0);
    const weightedPoints = entries.reduce((sum, item) => sum + item.gradePoint * item.credits, 0);
    const cgpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;

    const latestSemester = Math.max(...entries.map((item) => item.semester));
    const latestSemesterEntries = entries.filter((item) => item.semester === latestSemester);
    const latestCredits = latestSemesterEntries.reduce((sum, item) => sum + item.credits, 0);
    const latestPoints = latestSemesterEntries.reduce((sum, item) => sum + item.gradePoint * item.credits, 0);
    const latestSgpa = latestCredits > 0 ? latestPoints / latestCredits : 0;

    return {
      cgpa,
      totalSubjects: entries.length,
      totalCredits,
      latestSgpa,
    };
  }, [entries]);

  const semesterStats = useMemo(() => {
    const bySemester = new Map<number, CgpaEntry[]>();
    for (const entry of entries) {
      if (!bySemester.has(entry.semester)) bySemester.set(entry.semester, []);
      bySemester.get(entry.semester)?.push(entry);
    }

    return Array.from(bySemester.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([semester, subjects]) => {
        const credits = subjects.reduce((sum, item) => sum + item.credits, 0);
        const points = subjects.reduce((sum, item) => sum + item.gradePoint * item.credits, 0);
        const sgpa = credits > 0 ? points / credits : 0;

        return {
          semester,
          subjects,
          totalSubjects: subjects.length,
          totalCredits: credits,
          sgpa,
        };
      });
  }, [entries]);

  const trend = useMemo(() => {
    let cumulativeCredits = 0;
    let cumulativePoints = 0;
    return semesterStats.map((semesterData) => {
      cumulativeCredits += semesterData.totalCredits;
      cumulativePoints += semesterData.sgpa * semesterData.totalCredits;
      return {
        semester: semesterData.semester,
        sgpa: semesterData.sgpa,
        cumulativeCgpa: cumulativeCredits > 0 ? cumulativePoints / cumulativeCredits : 0,
      };
    });
  }, [semesterStats]);

  const bestSgpa = useMemo(() => {
    if (semesterStats.length === 0) return 0;
    return Math.max(...semesterStats.map((item) => item.sgpa));
  }, [semesterStats]);

  const semesterOptions = useMemo(() => {
    const fromCourses = courses
      .map((course) => course.semester)
      .filter((semester): semester is number => Number.isFinite(semester));
    const unique = Array.from(new Set(fromCourses)).sort((a, b) => a - b);
    return unique.length ? unique : [1, 2, 3, 4, 5, 6, 7, 8];
  }, [courses]);

  const filteredCoursesBySemester = useMemo(() => {
    if (!form.semester || form.semester <= 0) return [];
    return courses.filter((course) => {
      if (course.semester == null || !Number.isFinite(course.semester)) return true;
      return course.semester === form.semester;
    });
  }, [courses, form.semester]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSave = async () => {
    const trimmedName = (form.subjectName || '').trim();
    if (!trimmedName) return;
    if (form.credits <= 0) return;
    if (form.semester <= 0) return;

    const payload = {
      courseId: form.courseId || undefined,
      subjectName: trimmedName,
      courseCode: (form.courseCode || '').trim() || undefined,
      semester: Math.max(1, Number(form.semester) || 1),
      credits: clamp(Number(form.credits) || 0, 0.5, 12),
      gradePoint: clamp(Number(form.gradePoint) || 0, 0, 10),
      examDate: form.examDate || undefined,
      notes: (form.notes || '').trim() || undefined,
    };

    try {
      setSavingEntry(true);
      if (editingId) {
        const response = await api.patch(`/cgpa-entries/${editingId}`, payload);
        const updated = normalizeEntry(extractData<any>(response.data));
        setEntries((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        toast.success('Subject updated.');
      } else {
        const response = await api.post('/cgpa-entries', payload);
        const created = normalizeEntry(extractData<any>(response.data));
        setEntries((prev) => [created, ...prev]);
        toast.success('Subject added.');
      }
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save subject.');
    } finally {
      setSavingEntry(false);
    }
  };

  const handleEdit = (entry: CgpaEntry) => {
    setEditingId(entry.id);
    setForm({
      subjectName: entry.subjectName,
      courseId: entry.courseId || '',
      courseCode: entry.courseCode,
      semester: entry.semester,
      credits: entry.credits,
      gradePoint: entry.gradePoint,
      examDate: entry.examDate,
      notes: entry.notes,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/cgpa-entries/${id}`);
      setEntries((prev) => prev.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
      toast.success('Subject deleted.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete subject.');
    } finally {
      setDeletingId(null);
    }
  };

  if (apiLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="card-elevated ui-card-pad flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Academic Utilities</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">CGPA Calculator</h1>
          <p className="text-sm text-muted-foreground">Add subjects with credits and grade points to compute SGPA, CGPA, and trends.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/5 transition-all font-bold"
            onClick={async () => {
              if (entries.length === 0) {
                toast.error('Add at least one subject to generate hall ticket.');
                return;
              }
              const { exportHallTicket } = await import('@/lib/pdfExport');
              exportHallTicket(user, entries);
              toast.success('Hall Ticket generated for End Semester Examination.');
            }}
          >
            <Download className="h-4 w-4" />
            Hall Ticket
          </Button>
          <div className="h-10 w-[1px] bg-border mx-1 hidden md:block" />
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Calculator className="h-4 w-4 text-primary" />
            Synced to PEC ERP.
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Subjects Included', value: stats.totalSubjects, icon: BookOpen },
          { label: 'Total Credits', value: stats.totalCredits, icon: Sigma },
          { label: 'Current CGPA', value: stats.cgpa.toFixed(2), icon: Calculator },
          { label: 'Latest SGPA', value: stats.latestSgpa.toFixed(2), icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-elevated ui-card-pad flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</p>
              <p className="text-2xl font-black text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-elevated ui-card-pad space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Entry Form</p>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              {editingId ? 'Edit Subject' : 'Add Subject'}
            </h2>
          </div>
          {editingId && (
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Select
            value={form.semester > 0 ? String(form.semester) : ''}
            onValueChange={(value) => {
              const semester = toNumber(value, 0);
              setForm((prev) => ({
                ...prev,
                semester,
                courseId: '',
                subjectName: '',
                courseCode: '',
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select semester *" />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((semester) => (
                <SelectItem key={semester} value={String(semester)}>
                  Semester {semester}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={form.courseId || ''}
            onValueChange={(courseId) => {
              const selectedCourse = filteredCoursesBySemester.find((course) => course.id === courseId);
              setForm((prev) => ({
                ...prev,
                courseId,
                subjectName: selectedCourse?.name || '',
                courseCode: selectedCourse?.code || '',
                credits: selectedCourse?.credits && selectedCourse.credits > 0 ? selectedCourse.credits : prev.credits,
              }));
            }}
            disabled={form.semester <= 0 || coursesLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  form.semester <= 0
                    ? 'Select semester first'
                    : coursesLoading
                      ? 'Loading courses...'
                      : 'Select subject/course *'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {filteredCoursesBySemester.length === 0 ? (
                <SelectItem value="no-course" disabled>
                  No subjects found for this semester
                </SelectItem>
              ) : (
                filteredCoursesBySemester.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code ? `${course.code} - ` : ''}{course.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Input
            placeholder="Subject name *"
            value={form.subjectName}
            onChange={(event) => setForm((prev) => ({ ...prev, subjectName: event.target.value }))}
          />
          <Input
            placeholder="Course code"
            value={form.courseCode}
            onChange={(event) => setForm((prev) => ({ ...prev, courseCode: event.target.value }))}
          />
          <Input
            type="number"
            min={1}
            max={10}
            step={0.5}
            placeholder="Credits *"
            value={form.credits}
            onChange={(event) => setForm((prev) => ({ ...prev, credits: toNumber(event.target.value, 3) }))}
          />
          <Input
            type="number"
            min={0}
            max={10}
            step={0.01}
            placeholder="Grade point (0-10) *"
            value={form.gradePoint}
            onChange={(event) => setForm((prev) => ({ ...prev, gradePoint: toNumber(event.target.value, 0) }))}
          />
        </div>

        <Textarea
          rows={3}
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
        />

        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2" disabled={savingEntry}>
            {savingEntry ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {savingEntry ? 'Saving...' : editingId ? 'Update Subject' : 'Add Subject'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-elevated ui-card-pad space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Semester Trends</h3>
            <p className="text-xs text-muted-foreground font-black">Best SGPA: {bestSgpa.toFixed(2)}</p>
          </div>
          <div className="h-[250px] w-full pt-4 glow-primary/5 rounded-2xl overflow-hidden transition-all hover:bg-primary/[0.02] border border-primary/5">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend}>
                <defs>
                  <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="semester" 
                  fontSize={10}
                  tick={{ fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  domain={[0, 10]} 
                  fontSize={10} 
                  tick={{ fill: 'var(--muted-foreground)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}/>
                <Area 
                  type="monotone" 
                  dataKey="sgpa" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSgpa)" 
                  name="SGPA"
                  animationDuration={1500}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeCgpa" 
                  stroke="#fbbf24" 
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#fbbf24', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#fbbf24' }}
                  name="CGPA"
                  animationDuration={2000}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-elevated ui-card-pad space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Semester Breakdown</h3>
          {semesterStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No semester data yet.</p>
          ) : (
            <div className="space-y-3">
              {semesterStats.map((semesterData) => (
                <div key={semesterData.semester} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Semester {semesterData.semester}</p>
                    <p className="text-sm font-bold text-primary">SGPA {semesterData.sgpa.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Subjects: {semesterData.totalSubjects} | Credits: {semesterData.totalCredits}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Subjects Ledger</h3>
        {entries.length === 0 ? (
          <div className="card-elevated ui-card-pad text-center text-sm text-muted-foreground">
            No subjects added yet. Add your first subject to start CGPA calculation.
          </div>
        ) : (
          entries
            .slice()
            .sort((a, b) => a.semester - b.semester || a.subjectName.localeCompare(b.subjectName))
            .map((entry) => {
            const creditPoints = entry.gradePoint * entry.credits;

            return (
              <div key={entry.id} className="card-elevated ui-card-pad space-y-3">
                <div className="grid gap-4 md:grid-cols-[1.6fr_0.8fr_0.8fr] md:items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {entry.subjectName}
                      {entry.courseCode ? ` (${entry.courseCode})` : ''}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Semester {entry.semester}
                      {entry.examDate ? ` - ${new Date(entry.examDate).toLocaleDateString()}` : ''}
                    </p>
                    {entry.notes && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Performance</p>
                    <p className="text-xl font-bold text-foreground">
                      GP {entry.gradePoint.toFixed(2)}
                    </p>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(entry.gradePoint / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Credits {entry.credits} | Credit Points {creditPoints.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
