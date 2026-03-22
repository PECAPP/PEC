import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  UserPlus,
  Shield,
  Mail,
  Phone,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { useDepartmentFilter } from '@/hooks/useDepartmentFilter';
import api from '@/lib/api';

export default function Students() {
  const navigate = useNavigate();
  const { isAdmin, isFaculty, user, loading: authLoading } = usePermissions();
  const { filterByDepartment } = useDepartmentFilter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [showDialog, setShowDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    enrollmentNumber: '',
    department: '',
    semester: 1,
    phone: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!isAdmin && !isFaculty) {
      toast.error('Access denied. Faculty or Admin only.');
      navigate('/dashboard');
      return;
    }

    const loadStudents = async () => {
      try {
        await fetchStudents();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [authLoading, user, isAdmin, navigate]);

  const fetchStudents = async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const response = await api.get<ApiResponse<any[]>>('/users', {
        params: { limit: 200, offset: 0, role: 'student' },
      });

      let studentUsers = (response.data.data || []) as any[];
      
      // Apply department filtering for faculty
      studentUsers = filterByDepartment(studentUsers);

      setStudents(studentUsers);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/users', {
        fullName: studentForm.fullName,
        email: studentForm.email,
        role: 'student',
        department: studentForm.department || undefined,
        enrollmentNumber: studentForm.enrollmentNumber || undefined,
        semester: Number(studentForm.semester || 1),
        phone: studentForm.phone || undefined,
        dateOfBirth: studentForm.dateOfBirth || undefined,
      });

      toast.success('Student created successfully!');
      setShowDialog(false);
      resetForm();
      await fetchStudents();
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Failed to create student');
    }
  };

  const handleUpdate = async () => {
    if (!editingStudent) return;
    try {
      await api.patch(`/users/${editingStudent.id}`, {
        fullName: studentForm.fullName,
        email: studentForm.email,
        role: 'student',
        department: studentForm.department || undefined,
        enrollmentNumber: studentForm.enrollmentNumber || undefined,
        semester: Number(studentForm.semester || 1),
        phone: studentForm.phone || undefined,
        dateOfBirth: studentForm.dateOfBirth || undefined,
      });

      toast.success('Student updated successfully!');
      setShowDialog(false);
      setEditingStudent(null);
      resetForm();
      await fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student');
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/users/${studentId}`);
      toast.success('Student deleted successfully!');
      await fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const resetForm = () => {
    setStudentForm({
      fullName: '',
      email: '',
      enrollmentNumber: '',
      department: '',
      semester: 1,
      phone: '',
      dateOfBirth: '',
    });
  };

  const openEditDialog = (student: any) => {
    setEditingStudent(student);
    setStudentForm({
      fullName: student.fullName,
      email: student.email,
      enrollmentNumber: student.enrollmentNumber || '',
      department: student.department || '',
      semester: student.semester || 1,
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth || '',
    });
    setShowDialog(true);
  };

  const filteredStudents = students.filter(s => 
    s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students Management</h1>
          <p className="text-muted-foreground mt-1">Manage all student records</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingStudent(null); setShowDialog(true); }} className="w-full md:w-auto">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-foreground">{students.length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Students</p>
              <p className="text-2xl font-bold text-foreground">{students.filter(s => s.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold text-foreground">{new Set(students.map(s => s.department)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or enrollment number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Enrollment No.</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Department</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Semester</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium text-foreground">{student.enrollmentNumber || 'N/A'}</td>
                    <td className="p-4 text-foreground">{student.fullName}</td>
                    <td className="p-4 text-muted-foreground">{student.email}</td>
                    <td className="p-4 text-muted-foreground">{student.department || 'N/A'}</td>
                    <td className="p-4 text-center text-muted-foreground">{student.semester || '-'}</td>
                    <td className="p-4 text-center">
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                        {student.status || 'active'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(student)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(student.id)}>
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

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
            <DialogDescription>
              {editingStudent ? 'Update student details' : 'Add a new student to the system'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <Input
                value={studentForm.fullName}
                onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Enrollment Number</label>
                <Input
                  value={studentForm.enrollmentNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, enrollmentNumber: e.target.value })}
                  placeholder="STU2024001"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input
                  value={studentForm.department}
                  onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })}
                  placeholder="Computer Science"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Semester</label>
                <Input
                  type="number"
                  value={studentForm.semester}
                  onChange={(e) => setStudentForm({ ...studentForm, semester: parseInt(e.target.value) })}
                  className="mt-1"
                  min="1"
                  max="8"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Date of Birth</label>
              <Input
                type="date"
                value={studentForm.dateOfBirth}
                onChange={(e) => setStudentForm({ ...studentForm, dateOfBirth: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={editingStudent ? handleUpdate : handleCreate} className="flex-1">
                {editingStudent ? 'Update Student' : 'Add Student'}
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditingStudent(null); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
