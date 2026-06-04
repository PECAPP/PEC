'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Building2, Users, GraduationCap,
  Plus, Edit, Trash2, Upload, Download, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import BulkUpload from '@/components/BulkUpload';
import {
  createDepartment, updateDepartment, deleteDepartment,
} from './actions';

interface DepartmentsViewProps {
  initialDepartments: any[];
  isAdmin: boolean;
}

const emptyForm = { name: '', code: '', hod: '', description: '' };

export function DepartmentsView({ initialDepartments, isAdmin }: DepartmentsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [departments, setDepartments] = useState<any[]>(initialDepartments);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [deptForm, setDeptForm] = useState(emptyForm);

  // Keep local list in sync after server refreshes
  useEffect(() => {
    setDepartments(initialDepartments);
  }, [initialDepartments]);

  const resetForm = () => { setDeptForm(emptyForm); };

  const openEditDialog = (dept: any) => {
    setEditingDept(dept);
    setDeptForm({ name: dept.name, code: dept.code, hod: dept.hod || '', description: dept.description || '' });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const fd = new FormData();
    Object.entries(deptForm).forEach(([k, v]) => fd.set(k, v));
    if (editingDept) fd.set('id', editingDept.id);

    startTransition(async () => {
      const result = editingDept
        ? await updateDepartment(null, fd)
        : await createDepartment(null, fd);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(editingDept ? 'Department updated!' : 'Department created!');
        setShowDialog(false);
        setEditingDept(null);
        resetForm();
        router.refresh(); // Revalidates RSC cache — picks up revalidateTag('departments')
      }
    });
  };

  const handleDelete = (deptId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    const fd = new FormData();
    fd.set('id', deptId);

    startTransition(async () => {
      const result = await deleteDepartment(null, fd);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Department deleted!');
        router.refresh();
      }
    });
  };

  const exportDepartments = async () => {
    const { utils, writeFile } = await import('xlsx');
    const exportData = departments.map(d => ({
      name: d.name, code: d.code, hod: d.hod || '', description: d.description || '',
    }));
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Departments');
    writeFile(wb, `departments_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported!');
  };

  const handleBulkImport = async (data: any[]) => {
    let successCount = 0, failCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      const fd = new FormData();
      fd.set('name', row.name); fd.set('code', row.code);
      fd.set('hod', row.hod || ''); fd.set('description', row.description || '');
      const result = await createDepartment(null, fd);
      if (result?.error) { failCount++; errors.push(`${row.name}: ${result.error}`); }
      else successCount++;
    }

    router.refresh();
    return { success: successCount, failed: failCount, errors };
  };

  const filtered = departments.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bulkTemplate = ['name', 'code', 'hod', 'description'];
  const sampleData = [
    { name: 'Computer Science', code: 'CS', hod: 'Dr. John Smith', description: 'CSE Dept' },
    { name: 'Mechanical Engineering', code: 'ME', hod: 'Dr. Jane Doe', description: 'ME Dept' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground mt-1">Manage all departments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportDepartments} disabled={isPending}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
          {isAdmin && (
            <Button onClick={() => { resetForm(); setEditingDept(null); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Department
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Building2, label: 'Total Departments', value: departments.length, color: 'primary' },
          { icon: GraduationCap, label: 'Active', value: departments.filter(d => d.status !== 'inactive').length, color: 'success' },
          { icon: Users, label: 'Total HODs', value: departments.filter(d => d.hod).length, color: 'accent' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card-elevated p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-${color}/10`}><Icon className={`w-5 h-5 text-${color}`} /></div>
              <div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>
            </div>
          </div>
        ))}
      </div>

      <Input placeholder="Search departments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {['Code', 'Name', 'HOD', 'Actions'].map((h, i) => (
                  <th key={h} className={`p-4 text-sm font-medium text-muted-foreground ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No departments found</td></tr>
              ) : filtered.map(dept => (
                <tr key={dept.id} className="hover:bg-muted/20 cursor-pointer transition-colors" onClick={() => router.push(`/departments/${dept.id}`)}>
                  <td className="p-4 font-medium">{dept.code}</td>
                  <td className="p-4">{dept.name}</td>
                  <td className="p-4 text-muted-foreground">{dept.hodName || dept.hod || '-'}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      {isAdmin && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(dept)} disabled={isPending}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)} disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                <Input value={deptForm.code} onChange={e => setDeptForm({ ...deptForm, code: e.target.value })} placeholder="CS" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Department Name *</label>
                <Input value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} placeholder="Computer Science" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Head of Department</label>
              <Input value={deptForm.hod} onChange={e => setDeptForm({ ...deptForm, hod: e.target.value })} placeholder="Dr. John Smith" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={deptForm.description} onChange={e => setDeptForm({ ...deptForm, description: e.target.value })} placeholder="Department description..." className="mt-1 w-full min-h-[80px] p-2 rounded-md border border-border bg-background" />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} className="flex-1" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {editingDept ? 'Update Department' : 'Create Department'}
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditingDept(null); resetForm(); }}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Departments</DialogTitle>
            <DialogDescription>Upload CSV or Excel file with department data</DialogDescription>
          </DialogHeader>
          <BulkUpload entityType="departments" onImport={handleBulkImport} templateColumns={bulkTemplate} sampleData={sampleData} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
