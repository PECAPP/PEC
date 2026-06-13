'use client';
import { Button, Input, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@pec/ui";


import { useState, useTransition, useEffect, useOptimistic } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { departmentSchema, DepartmentInput } from '@pec/shared';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
 Building2, Users, GraduationCap,
 Plus, Edit, Trash2, Upload, Download, Loader2, Search
} from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

import { toast } from 'sonner';
import BulkUpload from '@/components/BulkUpload';
import { useAction } from 'next-safe-action/hooks';
import {
 createDepartmentAction, 
 updateDepartmentAction, 
 deleteDepartmentAction,
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
  const ExcelJS = await import('exceljs');
  const fileSaver = await import('file-saver');
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Departments');
  
  worksheet.columns = [
   { header: 'Name', key: 'name', width: 30 },
   { header: 'Code', key: 'code', width: 15 },
   { header: 'Head of Department', key: 'hod', width: 30 },
   { header: 'Description', key: 'description', width: 40 },
  ];
  
  departments.forEach(d => {
   worksheet.addRow({
    name: d.name, code: d.code, hod: d.hod || '', description: d.description || '',
   });
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  fileSaver.saveAs(blob, `departments_export_${new Date().toISOString().split('T')[0]}.xlsx`);
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

 const columns = useMemo<ColumnDef<any>[]>(() => [
  {
   accessorKey: 'code',
   header: 'Code',
   cell: ({ row }) => <span className="font-semibold text-primary text-xs">{row.original.code}</span>
  },
  {
   accessorKey: 'name',
   header: 'Name',
   cell: ({ row }) => <span className="font-semibold text-foreground text-sm">{row.original.name}</span>
  },
  {
   accessorKey: 'hod',
   header: 'Head of Department',
   cell: ({ row }) => <span className="text-muted-foreground font-semibold text-xs uppercase opacity-70">{row.original.hodName || row.original.hod || '---'}</span>
  },
  {
   id: 'actions',
   header: 'Actions',
   cell: ({ row }) => {
    const dept = row.original;
    return (
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
    );
   }
  }
 ], [isAdmin, isDeleting]);

 return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
   {/* Header Actions removed to consolidate Toolbar */}

   {/* Stats */}
   <div className="grid gap-6 md:grid-cols-3">
    {[
     { icon: Building2, label: 'Total Departments', value: optimisticDepts.length, color: 'text-primary', bg: 'bg-primary/10', border: 'border-border/40' },
     { icon: GraduationCap, label: 'Active', value: optimisticDepts.filter(d => d.status !== 'inactive').length, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
     { icon: Users, label: 'HODs Assigned', value: optimisticDepts.filter(d => d.hod).length, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    ].map(({ icon: Icon, label, value, color, bg, border }) => (
      <div key={label} className="bg-card p-3 md:p-6 border border-border/40 rounded-sm shadow-sm flex items-center gap-4">
       <div className={`p-3 rounded-lg border ${border} ${bg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${color}`} /></div>
       <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
       </div>
      </div>
    ))}
   </div>

   {/* Filters and Actions */}
    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
     <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
     <Input placeholder="Search departments..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-10 w-full" />
    </div>

    <div className="flex items-center gap-3 w-full md:w-auto">
     <Button variant="outline" onClick={exportDepartments} className="h-10 font-medium border bg-background rounded-sm shadow-sm px-4"><Download className="w-4 h-4 mr-2" /> Export</Button>
     <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="h-10 font-medium border bg-background rounded-sm shadow-sm px-4"><Upload className="w-4 h-4 mr-2" /> Bulk Upload</Button>
     {isAdmin && (
      <Button onClick={() => { resetForm(); setEditingDept(null); setShowDialog(true); }} className="h-10 bg-primary text-primary-foreground font-medium rounded-sm px-4 whitespace-nowrap">
       <Plus className="w-4 h-4 mr-2" /> Add Department
      </Button>
     )}
    </div>
   </div>

   {/* Table */}
   <DataTable columns={columns} data={filtered} onRowClick={(row) => router.push(`/directory/departments/${row.id}`)} />

   <Dialog open={showDialog} onOpenChange={setShowDialog}>
    <DialogContent className=" rounded-sm border border-border/40 shadow-sm">
     <DialogHeader className="space-y-4">
      <DialogTitle className="text-3xl font-bold">{editingDept ? 'Edit Department' : 'Add New Department'}</DialogTitle>
      <DialogDescription className="font-medium text-sm  text-muted-foreground bg-muted p-2 rounded-sm italic opacity-60">Institutional Department Details</DialogDescription>
     </DialogHeader>
     <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-sm font-medium  text-muted-foreground">Department Code *</label>
        <Input {...register('code')} placeholder="e.g. CS" className={`mt-1 h-12 border rounded-sm font-bold font-mono ${errors.code ? 'border-destructive' : ''}`} />
        {errors.code && <p className="text-sm font-medium text-destructive uppercase">{errors.code.message}</p>}
       </div>
       <div className="space-y-2">
        <label className="text-sm font-medium  text-muted-foreground">Department Name *</label>
        <Input {...register('name')} placeholder="e.g. Computer Science" className={`mt-1 h-12 border rounded-sm font-bold ${errors.name ? 'border-destructive' : ''}`} />
        {errors.name && <p className="text-sm font-medium text-destructive uppercase">{errors.name.message}</p>}
       </div>
      </div>
      <div className="space-y-2">
       <label className="text-sm font-medium  text-muted-foreground">Head of Department (HOD)</label>
       <Input {...register('hod')} placeholder="e.g. Dr. John Doe" className="mt-1 h-12 border rounded-sm font-bold" />
      </div>
      <div className="space-y-2">
       <label className="text-sm font-medium  text-muted-foreground">Description</label>
       <textarea {...register('description')} placeholder="Describe the department's focus..." className="mt-1 w-full min-h-[100px] p-4 rounded-sm border border-border bg-background/50 font-medium focus:border-border/40 transition-all" />
      </div>
      <div className="flex gap-4 pt-6">
       <Button onClick={formSubmit(onSubmit)} className="flex-1 h-14 bg-primary text-white font-bold  text-xs shadow-sm hover:brightness-110 active:scale-[0.98] transition-all">
        {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {editingDept ? 'Save Changes' : 'Create Department'}
       </Button>
       <Button variant="outline" onClick={() => { setShowDialog(false); setEditingDept(null); resetForm(); }} className="h-14 border font-bold px-4 md:px-8  text-[10px] rounded-sm">Cancel</Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
    <DialogContent className=" border border-border/40 rounded-sm overflow-hidden p-0">
     <DialogHeader className="bg-primary text-white p-10">
      <DialogTitle className="text-3xl font-bold">Bulk Upload Departments</DialogTitle>
      <DialogDescription className="text-white/70 font-bold  text-[11px] mt-2 italic">Standardized CSV/Excel data upload</DialogDescription>
     </DialogHeader>
     <div className="p-10">
      <BulkUpload entityType="departments" onImport={handleBulkImport} templateColumns={['name', 'code', 'hod', 'description']} sampleData={[{ name: 'Computer Science', code: 'CS', hod: 'Dr. John Smith', description: 'CSE Dept' }]} />
     </div>
    </DialogContent>
   </Dialog>
  </motion.div>
 );
}

