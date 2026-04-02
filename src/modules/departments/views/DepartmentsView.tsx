'use client';

import { useState, useTransition, useEffect, useOptimistic } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, DepartmentInput } from '@shared/schemas/erp';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
 Building2, Users, GraduationCap,
 Plus, Edit, Trash2, Upload, Download, Loader2, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
 Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import BulkUpload from '@/components/BulkUpload';
import { useAction } from 'next-safe-action/hooks';
import {
 createDepartmentAction, 
 updateDepartmentAction, 
 deleteDepartmentAction,
} from '../actions';

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
 
 const {
  register,
  handleSubmit: formSubmit,
  reset,
  formState: { errors }
 } = useForm<DepartmentInput>({
  resolver: zodResolver(departmentSchema),
  defaultValues: emptyForm,
 });

 const { execute: executeCreate } = useAction(createDepartmentAction, {
  onSuccess: () => {
   toast.success('Department created successfully!');
   setShowDialog(false);
   reset();
   router.refresh();
  },
  onError: ({ error }) => {
    toast.error(error.serverError || 'Failed to create department.');
  }
 });

 const { execute: executeUpdate } = useAction(updateDepartmentAction, {
  onSuccess: () => {
   toast.success('Department updated!');
   setShowDialog(false);
   setEditingDept(null);
   reset();
   router.refresh();
  },
  onError: ({ error }) => {
    toast.error(error.serverError || 'Failed to update department.');
  }
 });

 const { execute: executeDelete, isPending: isDeleting } = useAction(deleteDepartmentAction, {
  onSuccess: () => {
   toast.success('Department deleted!');
   router.refresh();
  },
  onError: ({ error }) => {
    toast.error(error.serverError || 'Failed to delete department.');
  }
 });

 useEffect(() => {
  setDepartments(initialDepartments);
 }, [initialDepartments]);

 const [optimisticDepts, addOptimisticDept] = useOptimistic(
  departments,
  (state, { type, payload }: { type: 'create' | 'update' | 'delete', payload: any }) => {
   switch (type) {
    case 'create':
     return [...state, { ...payload, id: 'temp-' + Date.now(), status: 'active' }];
    case 'update':
     return state.map(d => d.id === payload.id ? { ...d, ...payload } : d);
    case 'delete':
     return state.filter(d => d.id !== payload.id);
    default:
     return state;
   }
  }
 );

 const resetForm = () => { reset(emptyForm); };

 const openEditDialog = (dept: any) => {
  setEditingDept(dept);
  reset({ name: dept.name, code: dept.code, hod: dept.hod || '', description: dept.description || '' });
  setShowDialog(true);
 };

 const onSubmit = (data: DepartmentInput) => {
  startTransition(() => {
   if (editingDept) {
    addOptimisticDept({ type: 'update', payload: { ...data, id: editingDept.id } });
    executeUpdate({ ...data, id: editingDept.id });
   } else {
    addOptimisticDept({ type: 'create', payload: data });
    executeCreate(data);
   }
  });
 };

 const handleDelete = (deptId: string) => {
  if (!confirm('Are you sure you want to delete this department?')) return;
  startTransition(() => {
   addOptimisticDept({ type: 'delete', payload: { id: deptId } });
   executeDelete({ id: deptId });
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
   const result = await createDepartmentAction({
    name: row.name,
    code: row.code,
    hod: row.hod || '',
    description: row.description || '',
   });
   
   if (result?.validationErrors || result?.serverError) {
    failCount++;
    errors.push(`${row.name}: Error`);
   } else {
    successCount++;
   }
  }

  router.refresh();
  return { success: successCount, failed: failCount, errors };
 };

 const filtered = optimisticDepts.filter(d =>
  d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  d.code?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
     <p className="text-muted-foreground mt-1 font-medium italic text-[11px]">Manage and track institutional academic departments</p>
    </div>
    <div className="flex gap-3">
     <Button variant="outline" onClick={exportDepartments} className="h-11 rounded-sm border-2 font-bold px-6">
      <Download className="w-4 h-4 mr-2" /> Export
     </Button>
     <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="h-11 rounded-sm border-2 font-bold px-6">
      <Upload className="w-4 h-4 mr-2" /> Bulk Upload
     </Button>
     {isAdmin && (
      <Button onClick={() => { resetForm(); setEditingDept(null); setShowDialog(true); }} className="h-11 rounded-sm bg-primary text-white font-bold uppercase tracking-widest text-[10px] px-6">
       <Plus className="w-4 h-4 mr-2" /> Add Department
      </Button>
     )}
    </div>
   </div>

   <div className="grid gap-6 md:grid-cols-3">
    {[
     { icon: Building2, label: 'Departments', value: optimisticDepts.length, color: 'primary' },
     { icon: GraduationCap, label: 'Active', value: optimisticDepts.filter(d => d.status !== 'inactive').length, color: 'success' },
     { icon: Users, label: 'HODs Assigned', value: optimisticDepts.filter(d => d.hod).length, color: 'warning' },
    ].map(({ icon: Icon, label, value, color }) => (
     <div key={label} className="card-elevated p-6 border-b-4 border-r-4 border-primary/10">
      <div className="flex items-center gap-4">
       <div className={`p-3 rounded-sm bg-${color}/10 border border-${color}/20`}><Icon className={`w-6 h-6 text-${color}`} /></div>
       <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</p>
        <p className="text-4xl font-bold mt-1">{value}</p>
       </div>
      </div>
     </div>
    ))}
   </div>

   <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input placeholder="Search departments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-14 pl-12 border-2 rounded-sm bg-background/50 font-bold" />
   </div>

   <div className="card-elevated overflow-hidden border-2 rounded-sm shadow-[12px_12px_0px_rgba(0,0,0,0.03)]">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-muted/50 border-b-2 border-border">
       <tr>
        {['Code', 'Name', 'Head of Department', 'Actions'].map((h, i) => (
         <th key={h} className={`p-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ${i === 3 ? 'text-right' : 'text-left'}`}>{h}</th>
        ))}
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {filtered.length === 0 ? (
        <tr><td colSpan={4} className="p-12 text-center text-muted-foreground font-medium italic">No departments found.</td></tr>
       ) : filtered.map(dept => (
        <tr key={dept.id} className="hover:bg-muted/30 cursor-pointer transition-all border-l-4 border-transparent hover:border-primary" onClick={() => router.push(`/departments/${dept.id}`)}>
         <td className="p-5 font-bold font-mono text-primary text-sm tracking-tight">{dept.code}</td>
         <td className="p-5 font-bold text-foreground text-base tracking-tight">{dept.name}</td>
         <td className="p-5 text-muted-foreground font-mono text-xs uppercase opacity-70">{dept.hodName || dept.hod || '---'}</td>
         <td className="p-5">
          <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
           {isAdmin && (
            <>
             <Button variant="ghost" size="sm" onClick={() => openEditDialog(dept)} className="hover:bg-primary/10 hover:text-primary rounded-sm h-9 w-9 p-0">
              <Edit className="w-4 h-4" />
             </Button>
             <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)} disabled={isDeleting} className="hover:bg-destructive/10 hover:text-destructive rounded-sm h-9 w-9 p-0">
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
    <DialogContent className="max-w-xl rounded-sm border-2 border-primary shadow-[20px_20px_0px_rgba(0,0,0,0.05)]">
     <DialogHeader className="space-y-4">
      <DialogTitle className="text-3xl font-bold">{editingDept ? 'Edit Department' : 'Add New Department'}</DialogTitle>
      <DialogDescription className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground bg-muted p-2 rounded-sm italic opacity-60">Institutional Department Details</DialogDescription>
     </DialogHeader>
     <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department Code *</label>
        <Input {...register('code')} placeholder="e.g. CS" className={`mt-1 h-12 border-2 rounded-sm font-bold font-mono ${errors.code ? 'border-destructive' : ''}`} />
        {errors.code && <p className="text-[10px] font-bold text-destructive uppercase">{errors.code.message}</p>}
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department Name *</label>
        <Input {...register('name')} placeholder="e.g. Computer Science" className={`mt-1 h-12 border-2 rounded-sm font-bold ${errors.name ? 'border-destructive' : ''}`} />
        {errors.name && <p className="text-[10px] font-bold text-destructive uppercase">{errors.name.message}</p>}
       </div>
      </div>
      <div className="space-y-2">
       <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Head of Department (HOD)</label>
       <Input {...register('hod')} placeholder="e.g. Dr. John Doe" className="mt-1 h-12 border-2 rounded-sm font-bold" />
      </div>
      <div className="space-y-2">
       <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
       <textarea {...register('description')} placeholder="Describe the department's focus..." className="mt-1 w-full min-h-[100px] p-4 rounded-sm border-2 border-border bg-background/50 font-medium focus:border-primary transition-all" />
      </div>
      <div className="flex gap-4 pt-6">
       <Button onClick={formSubmit(onSubmit)} className="flex-1 h-14 bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {editingDept ? 'Save Changes' : 'Create Department'}
       </Button>
       <Button variant="outline" onClick={() => { setShowDialog(false); setEditingDept(null); resetForm(); }} className="h-14 border-2 font-bold px-8 uppercase tracking-widest text-[10px] rounded-sm">Cancel</Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
    <DialogContent className="max-w-4xl border-2 border-primary rounded-sm overflow-hidden p-0">
     <DialogHeader className="bg-primary text-white p-10">
      <DialogTitle className="text-3xl font-bold">Bulk Upload Departments</DialogTitle>
      <DialogDescription className="text-white/70 font-bold uppercase tracking-widest text-[11px] mt-2 italic">Standardized CSV/Excel data upload</DialogDescription>
     </DialogHeader>
     <div className="p-10">
      <BulkUpload entityType="departments" onImport={handleBulkImport} templateColumns={['name', 'code', 'hod', 'description']} sampleData={[{ name: 'Computer Science', code: 'CS', hod: 'Dr. John Smith', description: 'CSE Dept' }]} />
     </div>
    </DialogContent>
   </Dialog>
  </motion.div>
 );
}
