'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, Save, X, Star, Gauge, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import api from '@/lib/api';
import { fetchAllPages } from '@/lib/fetchAllPages';

type ScoreEntry = {
  id: string;
  courseName: string;
  courseCode: string;
  term: string;
  maxMarks: number;
  score: number;
  grade: string;
  examDate: string;
  notes: string;
  createdAt: string;
};

const emptyForm: Omit<ScoreEntry, 'id' | 'createdAt'> = {
  courseName: '',
  courseCode: '',
  term: '',
  maxMarks: 100,
  score: 0,
  grade: '',
  examDate: '',
  notes: '',
};

export default function ScoreSheetPage() {
  const router = useRouter();
  const { user, isStudent, loading } = usePermissions();
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user || !isStudent) {
      router.replace('/dashboard');
      return;
    }
    fetchEntries();
  }, [loading, user, isStudent, router]);

  const fetchEntries = async () => {
    try {
      setApiLoading(true);
      const data = await fetchAllPages<ScoreEntry>('/score-sheet');
      setEntries(data.map((e: any) => ({
        ...e,
        examDate: e.examDate ? new Date(e.examDate).toISOString().split('T')[0] : '',
        createdAt: new Date(e.createdAt).toISOString(),
      })));
    } catch (error) {
      console.error('Error fetching score entries:', error);
      toast.error('Failed to load score entries');
    } finally {
      setApiLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (entries.length === 0) {
      return { average: 0, total: 0, best: 0 };
    }
    const percentages = entries.map((entry) =>
      entry.maxMarks > 0 ? Math.min(100, (entry.score / entry.maxMarks) * 100) : 0
    );
    const average = Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length);
    const best = Math.round(Math.max(...percentages));
    return { average, total: entries.length, best };
  }, [entries]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSave = async () => {
    const trimmedName = (form.courseName || '').trim();
    if (!trimmedName) return;

    setSaving(true);
    try {
      const payload = {
        studentId: user?.uid,
        courseName: trimmedName,
        courseCode: (form.courseCode || '').trim(),
        term: (form.term || '').trim(),
        maxMarks: Number(form.maxMarks) || 100,
        score: Number(form.score) || 0,
        grade: (form.grade || '').trim() || null,
        examDate: form.examDate || null,
        notes: (form.notes || '').trim() || null,
      };

      if (editingId) {
        await api.patch(`/score-sheet/${editingId}`, payload);
        toast.success('Entry updated');
      } else {
        await api.post('/score-sheet', payload);
        toast.success('Entry added');
      }

      resetForm();
      fetchEntries();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry: ScoreEntry) => {
    setEditingId(entry.id);
    setForm({
      courseName: entry.courseName || '',
      courseCode: entry.courseCode || '',
      term: entry.term || '',
      maxMarks: entry.maxMarks || 100,
      score: entry.score || 0,
      grade: entry.grade || '',
      examDate: entry.examDate || '',
      notes: entry.notes || '',
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await api.delete(`/score-sheet/${id}`);
      toast.success('Entry deleted');
      if (editingId === id) resetForm();
      fetchEntries();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete entry');
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
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Academic Tracker</p>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Score Sheet</h1>
          <p className="text-sm text-muted-foreground">Store and track your personal marks and grades in one place.</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
          <FileText className="h-4 w-4 text-primary" />
          Cloud-synced. Persisted to database.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Entries', value: stats.total, icon: FileText },
          { label: 'Average', value: `${stats.average}%`, icon: Gauge },
          { label: 'Best', value: `${stats.best}%`, icon: Star },
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
              <FileText className="h-5 w-5 text-primary" />
              {editingId ? 'Edit Entry' : 'Add New Entry'}
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
          <Input
            placeholder="Course name *"
            value={form.courseName}
            onChange={(event) => setForm((prev) => ({ ...prev, courseName: event.target.value }))}
          />
          <Input
            placeholder="Course code"
            value={form.courseCode}
            onChange={(event) => setForm((prev) => ({ ...prev, courseCode: event.target.value }))}
          />
          <Input
            placeholder="Term / Semester"
            value={form.term}
            onChange={(event) => setForm((prev) => ({ ...prev, term: event.target.value }))}
          />
          <Input
            type="date"
            value={form.examDate}
            onChange={(event) => setForm((prev) => ({ ...prev, examDate: event.target.value }))}
          />
          <Input
            type="number"
            min={0}
            placeholder="Max marks"
            value={form.maxMarks}
            onChange={(event) => setForm((prev) => ({ ...prev, maxMarks: Number(event.target.value) }))}
          />
          <Input
            type="number"
            min={0}
            placeholder="Score"
            value={form.score}
            onChange={(event) => setForm((prev) => ({ ...prev, score: Number(event.target.value) }))}
          />
          <Input
            placeholder="Grade (optional)"
            value={form.grade}
            onChange={(event) => setForm((prev) => ({ ...prev, grade: event.target.value }))}
          />
        </div>

        <Textarea
          rows={3}
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
        />

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Add Entry'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="card-elevated ui-card-pad text-center text-sm text-muted-foreground">
            No score entries yet. Add your first marks to start tracking.
          </div>
        ) : (
          entries.map((entry) => {
            const percentage =
              entry.maxMarks > 0 ? Math.round((entry.score / entry.maxMarks) * 100) : 0;

            return (
              <div key={entry.id} className="card-elevated ui-card-pad space-y-3">
                <div className="grid gap-4 md:grid-cols-[1.6fr_0.8fr_0.8fr] md:items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {entry.courseName}
                      {entry.courseCode ? ` (${entry.courseCode})` : ''}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {entry.term || 'Term not set'}
                      {entry.examDate ? ` - ${new Date(entry.examDate).toLocaleDateString()}` : ''}
                    </p>
                    {entry.notes && (
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Score</p>
                    <p className="text-xl font-bold text-foreground">
                      {entry.score}/{entry.maxMarks}
                    </p>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{percentage}%</p>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-2">
                    {entry.grade && (
                      <span className="text-xs font-semibold text-primary">Grade: {entry.grade}</span>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(entry.id)}>
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
