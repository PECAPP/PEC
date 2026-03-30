'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, Edit, Trash2, Upload, Download,
  Crown, MoreVertical, BookOpen, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import BulkUpload from '@/components/BulkUpload';
import {
  createFaculty, updateFaculty, deleteFaculty, promoteToHOD,
} from './actions';

interface FacultyViewProps {
  initialFaculty: any[];
  isAdmin: boolean;
}

const emptyForm = {
  fullName: '', email: '', employeeId: '', department: '',
  designation: '', phone: '', specialization: '',
};

export function FacultyView({ initialFaculty, isAdmin }: FacultyViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [faculty, setFaculty] = useState<any[]>(initialFaculty);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { setFaculty(initialFaculty); }, [initialFaculty]);

  const resetForm = () => setForm(emptyForm);

  const openEditDialog = (fac: any) => {
    setEditingFaculty(fac);
    setForm({
      fullName: fac.fullName, email: fac.email,
      employeeId: fac.employeeId || '', department: fac.department || '',
      designation: fac.designation || '', phone: fac.phone || '',
      specialization: fac.specialization || '',
    });
    setShowDialog(true);
  };

  const toFd = (extra?: Record<string, string>) => {
    const fd = new FormData();
    Object.entries({ ...form, ...extra }).forEach(([k, v]) => fd.set(k, v ?? ''));
    return fd;
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const fd = editingFaculty ? toFd({ id: editingFaculty.id }) : toFd();
      const result = editingFaculty
        ? await updateFaculty(null, fd)
        : await createFaculty(null, fd);

      if (result?.error) { toast.error(result.error); return; }
      toast.success(editingFaculty ? 'Faculty updated!' : 'Faculty created!');
      setShowDialog(false); setEditingFaculty(null); resetForm();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this faculty member?')) return;
    const fd = new FormData(); fd.set('id', id);
    startTransition(async () => {
      const result = await deleteFaculty(null, fd);
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Faculty deleted!');
      router.refresh();
    });
  };

  const handlePromoteHOD = (fac: any) => {
    if (!fac.department) { toast.error('Assign a department first'); return; }
    const fd = new FormData();
    Object.entries(fac).forEach(([k, v]) => fd.set(k, String(v ?? '')));
    startTransition(async () => {
      const result = await promoteToHOD(null, fd);
      if (result?.error) { toast.error(result.error); return; }
      toast.success(`${fac.fullName} promoted to HOD!`);
      router.refresh();
    });
  };

  const exportFaculty = async () => {
    const { utils, writeFile } = await import('xlsx');
    const data = faculty.map(f => ({
      employeeId: f.employeeId, fullName: f.fullName, email: f.email,
      department: f.department, designation: f.designation,
      phone: f.phone, specialization: f.specialization, status: f.status || 'active',
    }));
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Faculty');
    writeFile(wb, `faculty_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported!');
  };

  const handleBulkImport = async (data: any[]) => {
    let success = 0, failed = 0;
    const errors: string[] = [];
    for (const row of data) {
      const fd = new FormData();
      Object.entries(row).forEach(([k, v]) => fd.set(k, String(v ?? '')));
      const result = await createFaculty(null, fd);
      if (result?.error) { failed++; errors.push(`${row.fullName}: ${result.error}`); }
      else success++;
    }
    router.refresh();
    return { success, failed, errors };
  };

  const filtered = faculty.filter(f =>
    f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground mt-1">Manage all faculty members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportFaculty} disabled={isPending}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
            <Upload className="w-4 h-4 mr-2" /> Bulk Upload
          </Button>
          {isAdmin && (
            <Button onClick={() => { resetForm(); setEditingFaculty(null); setShowDialog(true); }}>
              <UserPlus className="w-4 h-4 mr-2" /> Add Faculty
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { icon: Users, label: 'Total Faculty', value: faculty.length, color: 'primary' },
          { icon: BookOpen, label: 'Departments', value: new Set(faculty.map(f => f.department)).size, color: 'success' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card-elevated p-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-${color}/10`}><Icon className={`w-5 h-5 text-${color}`} /></div>
              <div><p className="text-xs text-muted-foreground uppercase font-semibold">{label}</p><p className="text-2xl font-bold">{value}</p></div>
            </div>
          </div>
        ))}
      </div>

      <Input
        placeholder="Search by name, email, or employee ID..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                {['ID', 'Name', 'Department', 'Role', 'Actions'].map((h, i) => (
                  <th key={h} className={`p-4 text-sm font-medium text-muted-foreground ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(fac => (
                <tr key={fac.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => router.push(`/users/${fac.id}`)}>
                  <td className="p-4 font-mono text-xs">{fac.employeeId || 'N/A'}</td>
                  <td className="p-4 font-medium">{fac.fullName}</td>
                  <td className="p-4 text-muted-foreground">{fac.department || 'N/A'}</td>
                  <td className="p-4"><Badge variant="outline">{fac.designation || 'Faculty'}</Badge></td>
                  <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" disabled={isPending}>
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(fac)}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePromoteHOD(fac)}><Crown className="w-4 h-4 mr-2 text-yellow-500" /> Promote to HOD</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(fac.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium">Full Name *</label>
              <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Employee ID</label>
                <Input value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Designation</label>
                <Input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} className="flex-1" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingFaculty ? 'Update Faculty' : 'Create Faculty'}
              </Button>
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader><DialogTitle>Bulk Upload Faculty</DialogTitle></DialogHeader>
          <BulkUpload
            entityType="faculty"
            onImport={handleBulkImport}
            templateColumns={['fullName', 'email', 'employeeId', 'department', 'designation', 'phone', 'specialization']}
            sampleData={[{ fullName: 'Dr. John Smith', email: 'john@pec.edu', employeeId: 'FAC001', department: 'CSE', designation: 'Professor', phone: '', specialization: 'AI/ML' }]}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
