import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Calendar,
  Loader2,
  Award,
  Plus,
  Edit,
  Trash2,
  Save,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';
import { exportAssignmentReport } from '@/lib/pdfExport';
import PDFExportButton from '@/components/common/PDFExportButton';
import api from '@/lib/api';

interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  title: string;
  description: string;
  dueDate: any;
  maxMarks: number;
  createdBy: string;
  attachments?: string[];
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  fileUrl: string;
  submittedAt: any;
  marksObtained?: number;
  feedback?: string;
  gradedBy?: string;
}

export default function Assignments() {
  const navigate = useNavigate();
  const { isAdmin, isFaculty, isStudent, user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for ({} as any) to load
    
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin || isFaculty) {
    return <AssignmentsManager userId={user.uid} userRole={user.role} userName={user.fullName || ''} />;
  }

  return <StudentAssignmentsView userId={user.uid} />;
}

function AssignmentsManager({ userId, userRole, userName }: { userId: string; userRole: string; userName: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
  });

  const isAdmin = userRole.includes('admin');

  useEffect(() => {
    fetchCourses();
  }, [userId]);

  useEffect(() => {
    if (courses.length > 0) {
      fetchAssignments();
    }
  }, [courses]);

  const fetchCourses = async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const response = await api.get<ApiResponse<any[]>>('/courses', {
        params: { limit: 200, offset: 0 },
      });

      let data = response.data.data || [];

      if (!isAdmin && userName) {
        data = data.filter((course: any) =>
          String(course.instructor || '')
            .toLowerCase()
            .includes(userName.toLowerCase()),
        );
      }
      
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const courseIds = courses.map(c => c.id);
      if (courseIds.length === 0) return;

      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const assignmentsResponse = await api.get<ApiResponse<Assignment[]>>('/assignments', {
        params: { limit: 200, offset: 0 },
      });

      const assignmentsData = (assignmentsResponse.data.data || []).filter((assignment) =>
        courseIds.includes(assignment.courseId),
      );
      
      setAssignments(assignmentsData);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    setLoading(true);
    try {
      setSubmissions([]);
      toast.info('Submission tracking is not enabled on PostgreSQL backend yet.');
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.courseId || !assignmentForm.dueDate) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await api.post('/assignments', {
        courseId: assignmentForm.courseId,
        title: assignmentForm.title,
        description: assignmentForm.description,
        dueDate: new Date(assignmentForm.dueDate).toISOString(),
      });
      
      toast.success('Assignment created successfully');
      setShowAssignmentDialog(false);
      resetForm();
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment) return;
    
    try {
      await api.patch(`/assignments/${editingAssignment.id}`, {
        title: assignmentForm.title,
        description: assignmentForm.description,
        dueDate: new Date(assignmentForm.dueDate).toISOString(),
        courseId: assignmentForm.courseId,
      });
      
      toast.success('Assignment updated');
      setShowAssignmentDialog(false);
      setEditingAssignment(null);
      resetForm();
      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment deleted');
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    }
  };

  const handleGradeSubmission = async (submissionId: string, marks: number, feedback: string) => {
    toast.info('Grading submissions is not enabled on PostgreSQL backend yet.');
  };

  const handleBulkImport = async (data: any[]) => {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        const course = courses.find(c => c.code === row.courseCode);
        if (!course) throw new Error(`Course ${row.courseCode} not found`);

        await api.post('/assignments', {
          courseId: course.id,
          title: row.title,
          description: row.description || '',
          dueDate: new Date(row.dueDate).toISOString(),
        });
        success++;
      } catch (err) {
        failed++;
        errors.push((err as Error).message);
      }
    }
    
    fetchAssignments();
    return { success, failed, errors };
  };

  const resetForm = () => {
    setAssignmentForm({
      courseId: '',
      title: '',
      description: '',
      dueDate: '',
      maxMarks: 100,
    });
  };

  const openEditDialog = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      courseId: assignment.courseId,
      title: assignment.title,
      description: assignment.description,
      dueDate: new Date(assignment.dueDate as any).toISOString().split('T')[0] || '',
      maxMarks: assignment.maxMarks,
    });
    setShowAssignmentDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Assignment Manager</h1>
          <p className="text-muted-foreground">Create and grade assignments</p>
        </div>
        <div className="button-group">
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => { resetForm(); setEditingAssignment(null); setShowAssignmentDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Create Assignment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="assignments" onValueChange={() => setSelectedAssignment('')}>
        <TabsList>
          <TabsTrigger value="assignments">My Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          {assignments.length === 0 ? (
            <div className="card-elevated p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No assignments yet</p>
            </div>
          ) : (
            assignments.map(assignment => (
              <div key={assignment.id} className="card-elevated p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{assignment.courseCode}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Due: {new Date(assignment.dueDate as any).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
                    <p className="text-sm mt-2">Max Marks: {assignment.maxMarks}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(assignment)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteAssignment(assignment.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <div className="card-elevated p-4">
            <Select value={selectedAssignment} onValueChange={(val) => { setSelectedAssignment(val); fetchSubmissions(val); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment to view submissions" />
              </SelectTrigger>
              <SelectContent>
                {assignments.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.title} - {a.courseCode}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAssignment && (
            <div className="card-elevated p-6">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              ) : submissions.length === 0 ? (
                <p className="text-center text-muted-foreground">No submissions yet</p>
              ) : (
                <div className="space-y-4">
                  {submissions.map(sub => (
                    <SubmissionGradeRow 
                      key={sub.id} 
                      submission={sub} 
                      maxMarks={assignments.find(a => a.id === selectedAssignment)?.maxMarks || 100}
                      onGrade={handleGradeSubmission}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAssignment ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Course</label>
              <Select value={assignmentForm.courseId} onValueChange={val => setAssignmentForm({...assignmentForm, courseId: val})}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={assignmentForm.title} onChange={e => setAssignmentForm({...assignmentForm, title: e.target.value})} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={assignmentForm.description} onChange={e => setAssignmentForm({...assignmentForm, description: e.target.value})} className="mt-1 w-full min-h-[80px] p-2 rounded border bg-background" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" value={assignmentForm.dueDate} onChange={e => setAssignmentForm({...assignmentForm, dueDate: e.target.value})} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Max Marks</label>
                <Input type="number" value={assignmentForm.maxMarks} onChange={e => setAssignmentForm({...assignmentForm, maxMarks: Number(e.target.value)})} className="mt-1" />
              </div>
            </div>
            <Button onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment} className="w-full">
              {editingAssignment ? 'Update' : 'Create'} Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Assignments</DialogTitle>
            <DialogDescription>Upload CSV/Excel with columns: courseCode, title, description, dueDate (YYYY-MM-DD), maxMarks</DialogDescription>
          </DialogHeader>
          <BulkUpload 
            entityType="assignments" 
            onImport={handleBulkImport} 
            templateColumns={['courseCode', 'title', 'description', 'dueDate', 'maxMarks']}
            sampleData={[{ courseCode: 'CS101', title: 'Assignment 1', description: 'Complete exercises', dueDate: '2024-12-31', maxMarks: 100 }]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubmissionGradeRow({ submission, maxMarks, onGrade }: { submission: Submission; maxMarks: number; onGrade: (id: string, marks: number, feedback: string) => void }) {
  const [marks, setMarks] = useState(submission.marksObtained || 0);
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [editing, setEditing] = useState(false);

  const isGraded = submission.marksObtained !== undefined;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-medium">{submission.studentName}</p>
          <p className="text-xs text-muted-foreground">{submission.studentEmail}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted: {submission.submittedAt?.toDate?.().toLocaleString()}
          </p>
        </div>
        <Button size="sm" variant="outline" asChild>
          <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4 mr-2" /> View
          </a>
        </Button>
      </div>

      {editing || !isGraded ? (
        <div className="space-y-3 bg-muted/30 p-3 rounded">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Marks (out of {maxMarks})</label>
              <Input type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} max={maxMarks} min={0} className="mt-1" />
            </div>
            <div className="flex items-end">
              <Progress value={(marks / maxMarks) * 100} className="h-2" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Feedback</label>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="mt-1 w-full min-h-[60px] p-2 text-sm rounded border bg-background" placeholder="Enter feedback..." />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { onGrade(submission.id, marks, feedback); setEditing(false); }}>
              <Save className="w-4 h-4 mr-2" /> Save Grade
            </Button>
            {isGraded && <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>}
          </div>
        </div>
      ) : (
        <div className="bg-success/10 p-3 rounded">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Grade: {submission.marksObtained}/{maxMarks}</span>
            <Badge variant="default">Graded</Badge>
          </div>
          <Progress value={(submission.marksObtained! / maxMarks) * 100} className="h-2 mb-2" />
          {submission.feedback && <p className="text-sm text-muted-foreground"><strong>Feedback:</strong> {submission.feedback}</p>}
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="mt-2">
            <Edit className="w-4 h-4 mr-2" /> Edit Grade
          </Button>
        </div>
      )}
    </div>
  );
}

function StudentAssignmentsView({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const enrollmentsResponse = await api.get<ApiResponse<any[]>>('/enrollments', {
        params: { limit: 200, offset: 0, status: 'active', studentId: userId },
      });
      const enrolledCourseIds = (enrollmentsResponse.data.data || []).map((item) => item.courseId);

      if (enrolledCourseIds.length === 0) {
        setLoading(false);
        return;
      }

      const [assignmentsResponse, coursesResponse] = await Promise.all([
        api.get<ApiResponse<Assignment[]>>('/assignments', { params: { limit: 200, offset: 0 } }),
        api.get<ApiResponse<any[]>>('/courses', { params: { limit: 200, offset: 0 } }),
      ]);

      const courseMap = new Map(
        (coursesResponse.data.data || []).map((course) => [course.id, course]),
      );
      const allAssignments: Assignment[] = (assignmentsResponse.data.data || [])
        .filter((assignment) => enrolledCourseIds.includes(assignment.courseId))
        .map((assignment) => {
          const course = courseMap.get(assignment.courseId);
          return {
            ...assignment,
            courseName: (assignment as any).courseName || course?.name || 'Unknown Course',
            courseCode: (assignment as any).courseCode || course?.code || 'N/A',
          };
        });

      setAssignments(allAssignments);
      setSubmissions([]);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !userId || !fileUrl.trim()) {
      toast.error('Please enter a file URL');
      return;
    }

    toast.info('Assignment submission endpoint is not enabled on PostgreSQL backend yet.');
  };

  const getSubmission = (assignmentId: string) => {
    return submissions.find(s => s.assignmentId === assignmentId);
  };

  const getDaysUntilDue = (dueDate: any) => {
    const due = dueDate?.toDate?.() || new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const activeAssignments = assignments.filter(a => !getSubmission(a.id));
  const submittedAssignments = assignments.filter(a => getSubmission(a.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <p className="text-muted-foreground mt-1">Submit and track your assignments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{activeAssignments.length}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="text-2xl font-bold text-foreground">{submittedAssignments.length}</p>
            </div>
          </div>
        </div>

        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Graded</p>
              <p className="text-2xl font-bold text-foreground">
                {submissions.filter(s => s.marksObtained !== undefined).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeAssignments.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAssignments.length === 0 ? (
            <div className="card-elevated p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-muted-foreground">No pending assignments</p>
            </div>
          ) : (
            activeAssignments.map((assignment, idx) => {
              const daysLeft = getDaysUntilDue(assignment.dueDate);
              const isOverdue = daysLeft < 0;
              const isUrgent = daysLeft <= 2 && daysLeft >= 0;

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card-elevated p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {assignment.courseCode}
                        </span>
                        <Badge variant={isOverdue ? 'destructive' : isUrgent ? 'default' : 'secondary'}>
                          {isOverdue ? 'Overdue' : `${daysLeft} days left`}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Due: {new Date(assignment.dueDate as any).toLocaleDateString() || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {assignment.maxMarks} marks
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmitDialog(true);
                      }}
                      disabled={isOverdue}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </div>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {submittedAssignments.length === 0 ? (
            <div className="card-elevated p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-muted-foreground">No submitted assignments</p>
            </div>
          ) : (
            submittedAssignments.map((assignment, idx) => {
              const submission = getSubmission(assignment.id);
              const isGraded = submission && submission.marksObtained !== undefined;

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card-elevated p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {assignment.courseCode}
                        </span>
                        <Badge variant={isGraded ? 'default' : 'secondary'}>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {isGraded ? 'Graded' : 'Submitted'}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{assignment.description}</p>
                      
                      {isGraded && submission && (
                        <div className="mb-3 p-3 rounded-lg bg-success/10 border border-success/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-foreground">Score</span>
                            <span className="text-lg font-bold text-success">
                              {submission.marksObtained}/{assignment.maxMarks}
                            </span>
                          </div>
                          <Progress 
                            value={(submission.marksObtained / assignment.maxMarks) * 100} 
                            className="h-2"
                          />
                          {submission.feedback && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Feedback:</strong> {submission.feedback}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Submitted: {submission?.submittedAt ? new Date(submission.submittedAt as any).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    {submission && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          View Submission
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.title} - {selectedAssignment?.courseCode}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">File URL</label>
              <Input
                placeholder="Enter the URL of your assignment file (Google Drive, Dropbox, etc.)"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload your file to Google Drive or any cloud ({} as any) and paste the shareable link here
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting || !fileUrl.trim()}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubmitDialog(false);
                  setFileUrl('');
                  setSelectedAssignment(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
