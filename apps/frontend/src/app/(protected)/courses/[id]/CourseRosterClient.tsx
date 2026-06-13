'use client';
import React, { useState, useEffect } from 'react';
import { Button, Input, Badge } from '@pec/ui';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { buildApiUrl } from '@pec/api';
import { toast } from 'sonner';
import { Loader2, Award, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  semester: number;
  status: string;
  student: {
    id: string;
    name: string;
  };
}

interface CourseRosterProps {
  courseId: string;
  courseName: string;
  courseCode: string;
}

export function CourseRosterClient({ courseId, courseName, courseCode }: CourseRosterProps) {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Grading Modal State
  const [selectedStudent, setSelectedStudent] = useState<Enrollment | null>(null);
  const [score, setScore] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === 'faculty' || user?.role === 'college_admin') {
      fetchRoster();
    }
  }, [user, courseId]);

  const fetchRoster = async () => {
    try {
      const res = await fetch(buildApiUrl(`/enrollments?courseId=${courseId}`), {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch roster');
      const data = await res.json();
      setEnrollments(data.data || []);
    } catch (_err) {
      toast.error('Could not load course roster');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    if (parseFloat(score) > parseFloat(maxMarks)) {
      toast.error('Score cannot exceed maximum marks');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(buildApiUrl('/grading/score'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId: selectedStudent.studentId,
          courseName: selectedStudent.courseName,
          courseCode: selectedStudent.courseCode,
          semester: selectedStudent.semester || 1,
          credits: 3, // Defaulting to 3 for now, ideally fetched from course
          score: parseFloat(score),
          maxMarks: parseFloat(maxMarks),
          notes
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to submit grade');
      }

      toast.success('Grade submitted successfully');
      setSelectedStudent(null);
      setScore('');
      setNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Error submitting grade');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'faculty' && user?.role !== 'college_admin') {
    return null;
  }

  const filteredEnrollments = enrollments.filter(e => 
    e.student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mt-8 space-y-6 animate-in fade-in duration-500">
      <div className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Course Roster & Grading
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Manage enrolled students and submit grades</p>
          </div>
          
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input 
              placeholder="Search students..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-sm bg-muted/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-4 md:p-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center p-4 md:p-6 border border-dashed border-border/60 rounded-sm bg-muted/20">
            <p className="text-sm text-muted-foreground">No students are currently enrolled in this course.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-border/40">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/40">
                <tr>
                  <th className="px-4 py-3 font-semibold">Student Name</th>
                  <th className="px-4 py-3 font-semibold">Student ID</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="bg-card hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{enrollment.student.name}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{enrollment.studentId.substring(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                        {enrollment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setSelectedStudent(enrollment)}
                        className="h-8 text-xs font-semibold"
                      >
                        Grade Student
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredEnrollments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 md:py-8 text-center text-muted-foreground italic">
                      No students match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grading Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-sm shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="px-3 md:px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">Grade Submission</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedStudent.student.name} • {selectedStudent.studentId.substring(0, 8)}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleGradeSubmit} className="p-3 md:p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Score</label>
                    <Input 
                      type="number" 
                      required 
                      min="0"
                      step="0.1"
                      value={score}
                      onChange={e => setScore(e.target.value)}
                      placeholder="e.g. 85"
                      className="font-mono text-lg font-bold h-12 text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Max Marks</label>
                    <Input 
                      type="number" 
                      required 
                      min="1"
                      value={maxMarks}
                      onChange={e => setMaxMarks(e.target.value)}
                      className="font-mono h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Faculty Notes (Optional)</label>
                  <Input 
                    placeholder="Feedback or remarks..." 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex gap-3 border-t border-border/40 mt-6">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setSelectedStudent(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || !score}
                    className="flex-1 bg-primary text-primary-foreground font-bold"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Submit Grade'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
