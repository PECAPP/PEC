import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Upload,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';

export default function Departments() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDialog, setShowDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    hod: '',
    description: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard', { replace: true });
      return;
    }

    void (async () => {
      try {
        await fetchDepartments();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, isAdmin, navigate]);

  const fetchDepartments = async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const response = await api.get<ApiResponse<any[]>>('/departments', {
        params: { limit: 200, offset: 0 },
      });
      const deptsData = response.data.data || [];
      setDepartments(deptsData);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/departments', deptForm);
      toast.success('Department created successfully!');
      setShowDialog(false);
      resetForm();
      await fetchDepartments();
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department');
    }
  };

  const handleUpdate = async () => {
    if (!editingDept) return;
    try {
      await api.patch(`/departments/${editingDept.id}`, deptForm);
      toast.success('Department updated successfully!');
      setShowDialog(false);
      setEditingDept(null);
      resetForm();
      await fetchDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department');
    }
  };

  const handleDelete = async (deptId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await api.delete(`/departments/${deptId}`);
      toast.success('Department deleted successfully!');
      await fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };

  const handleBulkImport = async (data: any[]) => {
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        await api.post('/departments', {
          name: row.name,
          code: row.code,
          hod: row.hod || '',
          description: row.description || '',
        });
        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`${row.name}: ${(error as Error).message}`);
      }
    }

    await fetchDepartments();
    return { success: successCount, failed: failCount, errors };
  };

  const exportDepartments = () => {
    const exportData = departments.map(dept => ({
      name: dept.name,
      code: dept.code,
      hod: dept.hod || '',
      description: dept.description || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments');
    XLSX.writeFile(workbook, `departments_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Departments exported successfully!');
  };

  const resetForm = () => {
    setDeptForm({
      name: '',
      code: '',
      hod: '',
      description: '',
    });
  };

  const openEditDialog = (dept: any) => {
    setEditingDept(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      hod: dept.hod || '',
      description: dept.description || '',
    });
    setShowDialog(true);
  };

  const filteredDepartments = departments.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bulkUploadTemplate = ['name', 'code', 'hod', 'description'];
  const sampleBulkData = [
    { name: 'Computer Science', code: 'CS', hod: 'Dr. John Smith', description: 'Computer Science Department' },
    { name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. Jane Doe', description: 'Mechanical Engineering Department' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage all departments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportDepartments}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => { resetForm(); setEditingDept(null); setShowDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Departments</p>
              <p className="text-2xl font-bold text-foreground">{departments.length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <GraduationCap className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-foreground">{departments.filter(d => d.status !== 'inactive').length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total HODs</p>
              <p className="text-2xl font-bold text-foreground">{departments.filter(d => d.hod).length}</p>
            </div>
          </div>
        </div>
      </div>

      <Input
        placeholder="Search departments..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Code</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">HOD</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDepartments.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No departments found</td></tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr 
                    key={dept.id} 
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => navigate(`/departments/${dept.id}`)}
                  >
                    <td className="p-4 font-medium text-foreground">{dept.code}</td>
                    <td className="p-4 text-foreground">{dept.name}</td>
                    <td className="p-4 text-muted-foreground">{dept.hodName || dept.hod || '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(dept)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
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

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
            <DialogDescription>{editingDept ? 'Update department details' : 'Create a new department'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Department Code *</label>
                <Input value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} placeholder="CS" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Department Name *</label>
                <Input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="Computer Science" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Head of Department</label>
              <Input value={deptForm.hod} onChange={(e) => setDeptForm({ ...deptForm, hod: e.target.value })} placeholder="Dr. John Smith" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} placeholder="Department description..." className="mt-1 w-full min-h-[80px] p-2 rounded-md border border-border bg-background" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={editingDept ? handleUpdate : handleCreate} className="flex-1">
                {editingDept ? 'Update Department' : 'Create Department'}
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditingDept(null); resetForm(); }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Departments</DialogTitle>
            <DialogDescription>Upload CSV or Excel file with department data</DialogDescription>
          </DialogHeader>
          <BulkUpload
            entityType="departments"
            onImport={handleBulkImport}
            templateColumns={bulkUploadTemplate}
            sampleData={sampleBulkData}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
