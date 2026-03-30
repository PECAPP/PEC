'use client';

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
  Mail,
  Phone,
  BookOpen,
  Upload,
  Download,
  Crown,
  MoreVertical,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
;
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';
import api from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';

export default function Faculty() {
  const router = useRouter();
  const { isAdmin, user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDialog, setShowDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [facultyForm, setFacultyForm] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    department: '',
    designation: '',
    phone: '',
    specialization: '',
  });

  const handleBulkImport = async (data: any[]) => {
    const CHUNK_SIZE = 40;
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      const requests = chunk.map(async (row: any) => {
        try {
          await api.post('/users', {
            fullName: row.fullName || row.name,
            email: row.email,
            role: 'faculty',
            department: row.department || undefined,
            employeeId: row.employeeId || undefined,
            designation: row.designation || undefined,
            specialization: row.specialization || undefined,
            phone: row.phone || undefined,
          });
          successCount += 1;
        } catch (error) {
          failCount += 1;
          errors.push(`${row.email || row.fullName || row.name || 'row'}: ${(error as Error).message}`);
        }
      });

      await Promise.all(requests);
    }

    await fetchFaculty();
    return { success: successCount, failed: failCount, errors };
  };

  const exportFaculty = () => {
    const exportData = faculty.map(f => ({
      employeeId: f.employeeId,
      fullName: f.fullName,
      email: f.email,
      department: f.department,
      designation: f.designation,
      phone: f.phone,
      specialization: f.specialization,
      status: f.status || 'active'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Faculty');
    XLSX.writeFile(workbook, `faculty_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Faculty exported successfully!');
  };

  const bulkUploadTemplate = [
    'fullName',
    'email',
    'employeeId',
    'department',
    'designation',
    'phone',
    'specialization'
  ];

  const sampleBulkData = [
    {
      fullName: 'Dr. John Smith',
      email: 'john.smith@university.edu',
      employeeId: 'FAC001',
      department: 'Computer Science',
      designation: 'Professor',
      phone: '+1234567890',
      specialization: 'AI/ML'
    }
  ];

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth');
      return;
    }

    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      router.replace('/dashboard');
      return;
    }

    void (async () => {
      try {
        await fetchFaculty();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, isAdmin, router]);

  const fetchFaculty = async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const response = await api.get<ApiResponse<any[]>>('/users', {
        params: {
          limit: 200,
          offset: 0,
          role: 'faculty',
        },
      });

      setFaculty(response.data.data || []);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/users', {
        fullName: facultyForm.fullName,
        email: facultyForm.email,
        role: 'faculty',
        department: facultyForm.department || undefined,
        employeeId: facultyForm.employeeId || undefined,
        designation: facultyForm.designation || undefined,
        specialization: facultyForm.specialization || undefined,
        phone: facultyForm.phone || undefined,
      });

      toast.success('Faculty member created successfully!');
      setShowDialog(false);
      resetForm();
      await fetchFaculty();
    } catch (error) {
      console.error('Error creating faculty:', error);
      toast.error('Failed to create faculty');
    }
  };

  const handleUpdate = async () => {
    if (!editingFaculty) return;
    try {
      await api.patch(`/users/${editingFaculty.id}`, {
        fullName: facultyForm.fullName,
        email: facultyForm.email,
        department: facultyForm.department || undefined,
        employeeId: facultyForm.employeeId || undefined,
        designation: facultyForm.designation || undefined,
        specialization: facultyForm.specialization || undefined,
        phone: facultyForm.phone || undefined,
      });

      toast.success('Faculty updated successfully!');
      setShowDialog(false);
      setEditingFaculty(null);
      resetForm();
      await fetchFaculty();
    } catch (error) {
      console.error('Error updating faculty:', error);
      toast.error('Failed to update faculty');
    }
  };

  const handleDelete = async (facultyId: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      await api.delete(`/users/${facultyId}`);
      toast.success('Faculty deleted successfully!');
      await fetchFaculty();
    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast.error('Failed to delete faculty');
    }
  };

  const promoteToHOD = async (fac: any) => {
    if (!fac.department) {
      toast.error('Faculty must have a department assigned first');
      return;
    }
    
    try {
      await api.patch(`/users/${fac.id}`, {
        fullName: fac.fullName,
        email: fac.email,
        role: 'faculty',
        department: fac.department,
        employeeId: fac.employeeId || undefined,
        designation: 'Head of Department',
        specialization: fac.specialization || undefined,
        phone: fac.phone || undefined,
      });

      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const deptResponse = await api.get<ApiResponse<any[]>>('/departments', {
        params: { limit: 200, offset: 0, search: fac.department },
      });

      const match = (deptResponse.data.data || []).find(
        (department: any) => department?.name?.toLowerCase() === String(fac.department).toLowerCase(),
      );

      if (match?.id) {
        await api.patch(`/departments/${match.id}`, {
          hod: fac.fullName,
        });
      }

      toast.success(`${fac.fullName} promoted to HOD of ${fac.department}!`);
      await fetchFaculty();
    } catch (error) {
      console.error('Error promoting to HOD:', error);
      toast.error('Failed to promote to HOD');
    }
  };

  const resetForm = () => {
    setFacultyForm({
      fullName: '',
      email: '',
      employeeId: '',
      department: '',
      designation: '',
      phone: '',
      specialization: '',
    });
  };

  const openEditDialog = (fac: any) => {
    setEditingFaculty(fac);
    setFacultyForm({
      fullName: fac.fullName,
      email: fac.email,
      employeeId: fac.employeeId || '',
      department: fac.department || '',
      designation: fac.designation || '',
      phone: fac.phone || '',
      specialization: fac.specialization || '',
    });
    setShowDialog(true);
  };

  const filteredFaculty = faculty.filter(f => 
    f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading faculty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Management</h1>
          <p className="text-muted-foreground mt-1">Manage all faculty members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportFaculty}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => { resetForm(); setEditingFaculty(null); setShowDialog(true); }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Faculty</p>
              <p className="text-2xl font-bold text-foreground">{faculty.length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <BookOpen className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Faculty</p>
              <p className="text-2xl font-bold text-foreground">{faculty.filter(f => f.status === 'active').length}</p>
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
              <p className="text-2xl font-bold text-foreground">{new Set(faculty.map(f => f.department)).size}</p>
            </div>
          </div>
        </div>
      </div>

      <Input
        placeholder="Search by name, email, or employee ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Department</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Designation</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFaculty.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No faculty found</td></tr>
              ) : (
                filteredFaculty.map((fac) => (
                  <tr 
                    key={fac.id} 
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => router.push(`/users/${fac.id}`)}
                  >
                    <td className="p-4 font-medium text-foreground">{fac.employeeId || 'N/A'}</td>
                    <td className="p-4 text-foreground">{fac.fullName}</td>
                    <td className="p-4 text-muted-foreground">{fac.email}</td>
                    <td className="p-4 text-muted-foreground">{fac.department || 'N/A'}</td>
                    <td className="p-4 text-muted-foreground">{fac.designation || 'N/A'}</td>
                    <td className="p-4 text-center">
                      <Badge variant={fac.status === 'active' ? 'default' : 'secondary'}>{fac.status || 'active'}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(fac)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => promoteToHOD(fac)}>
                              <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                              Promote to HOD
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(fac.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Faculty
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle>
            <DialogDescription>{editingFaculty ? 'Update faculty details' : 'Add a new faculty member'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <Input value={facultyForm.fullName} onChange={(e) => setFacultyForm({ ...facultyForm, fullName: e.target.value })} placeholder="Dr. John Doe" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" value={facultyForm.email} onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })} placeholder="john@example.com" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Employee ID</label>
                <Input value={facultyForm.employeeId} onChange={(e) => setFacultyForm({ ...facultyForm, employeeId: e.target.value })} placeholder="FAC2024001" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input value={facultyForm.phone} onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })} placeholder="+1 234 567 8900" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input value={facultyForm.department} onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })} placeholder="Computer Science" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Designation</label>
                <Input value={facultyForm.designation} onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })} placeholder="Professor" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Specialization</label>
              <Input value={facultyForm.specialization} onChange={(e) => setFacultyForm({ ...facultyForm, specialization: e.target.value })} placeholder="Machine Learning" className="mt-1" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={editingFaculty ? handleUpdate : handleCreate} className="flex-1">
                {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditingFaculty(null); resetForm(); }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Faculty</DialogTitle>
            <DialogDescription>Upload CSV or Excel file with faculty data</DialogDescription>
          </DialogHeader>
          <BulkUpload
            entityType="users"
            onImport={handleBulkImport}
            templateColumns={bulkUploadTemplate}
            sampleData={sampleBulkData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
