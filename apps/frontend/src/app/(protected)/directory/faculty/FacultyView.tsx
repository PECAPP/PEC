'use client';
import { Button, Badge, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@pec/ui";


import { useState, useTransition, useOptimistic, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { zodResolver } from '@hookform/resolvers/zod';
import { facultySchema, FacultyInput } from '@pec/shared';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
 Users, UserPlus, Edit, Trash2, Upload, Download,
 Crown, MoreVertical, BookOpen, Loader2, Search
} from 'lucide-react';

import { toast } from 'sonner';
import BulkUpload from '@/components/BulkUpload';
import { useAction } from 'next-safe-action/hooks';
import {
 createFacultyAction, 
 updateFacultyAction, 
 deleteFacultyAction, 
 promoteToHODAction,
} from './actions';

interface FacultyMember extends FacultyInput {
 id: string;
 status?: string;
}

interface FacultyViewProps {
 initialFaculty: FacultyMember[];
 isAdmin: boolean;
}

const emptyForm = {
 fullName: '', email: '', employeeId: '', department: '',
 designation: '', phone: '', specialization: '',
};

export function FacultyView({ initialFaculty, isAdmin }: FacultyViewProps) {
 const router = useRouter();
 const [isPending, startTransition] = useTransition();

 const [searchTerm, setSearchTerm] = useState('');
 const [showDialog, setShowDialog] = useState(false);
 const [showBulkUpload, setShowBulkUpload] = useState(false);
 const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);

 const {
  register,
  handleSubmit: formSubmit,
  reset,
  formState: { errors }
 } = useForm<FacultyInput>({
  resolver: zodResolver(facultySchema),
  defaultValues: emptyForm,
 });

  const [optimisticFaculty, addOptimisticFaculty] = useOptimistic(
    initialFaculty,
    (state, { type, payload }: { type: 'create' | 'update' | 'delete' | 'promote', payload: Partial<FacultyMember> & { id?: string } }) => {
   switch (type) {
    case 'create':
     return [{ ...payload, id: 'temp-' + Date.now(), status: 'active' }, ...state];
    case 'update':
     return state.map(f => f.id === payload.id ? { ...f, ...payload } : f);
    case 'delete':
     return state.filter(f => f.id !== payload.id);
    case 'promote':
     return state.map(f => f.id === payload.id ? { ...f, designation: 'Head of Department' } : f);
    default:
     return state;
   }
  }
 );

 // Safe Action Hooks
 const { execute: executeCreate } = useAction(createFacultyAction, {
  onSuccess: () => {
   toast.success('Faculty member added!');
   setShowDialog(false);
   reset();
   router.refresh();
  },
  onError: ({ error }) => toast.error(error.serverError || 'Failed to add faculty member.'),
 });

 const { execute: executeUpdate } = useAction(updateFacultyAction, {
  onSuccess: () => {
   toast.success('Faculty details updated!');
   setShowDialog(false);
   setEditingFaculty(null);
   reset();
   router.refresh();
  },
  onError: ({ error }) => toast.error(error.serverError || 'Update failed.'),
 });

 const { execute: executeDelete } = useAction(deleteFacultyAction, {
  onSuccess: () => {
   toast.success('Faculty member deleted!');
   router.refresh();
  },
  onError: ({ error }) => toast.error(error.serverError || 'Delete failed.'),
 });

 const { execute: executePromote } = useAction(promoteToHODAction, {
  onSuccess: () => {
   toast.success('Faculty appointed as HOD successfully!');
   router.refresh();
  },
  onError: ({ error }) => toast.error(error.serverError || 'Failed to promote.'),
 });

 const resetForm = () => reset(emptyForm);

 const openEditDialog = (fac: FacultyMember) => {
  setEditingFaculty(fac);
  reset({
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

 const onSubmit = (data: FacultyInput) => {
  startTransition(() => {
   if (editingFaculty) {
    addOptimisticFaculty({ type: 'update', payload: { ...data, id: editingFaculty.id } });
    executeUpdate({ ...data, id: editingFaculty.id });
   } else {
    addOptimisticFaculty({ type: 'create', payload: data });
    executeCreate(data);
   }
  });
 };

 const handleDelete = (id: string) => {
  if (!confirm('Are you sure you want to delete this faculty member?')) return;
  startTransition(() => {
   addOptimisticFaculty({ type: 'delete', payload: { id } });
   executeDelete({ id });
  });
 };

 const handlePromoteHOD = (fac: FacultyMember) => {
  if (!fac.department) {
   toast.error('Department assignment required before HOD appointment.');
   return;
  }
  startTransition(() => {
   addOptimisticFaculty({ type: 'promote', payload: { id: fac.id } });
   executePromote({ ...fac, id: fac.id });
  });
 };

 const exportFaculty = async () => {
  const ExcelJS = await import('exceljs');
  const fileSaver = await import('file-saver');

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Faculty');

  worksheet.columns = [
   { header: 'Employee ID', key: 'employeeId', width: 15 },
   { header: 'Full Name', key: 'fullName', width: 30 },
   { header: 'Email', key: 'email', width: 30 },
   { header: 'Department', key: 'department', width: 20 },
   { header: 'Designation', key: 'designation', width: 20 },
   { header: 'Phone', key: 'phone', width: 15 },
   { header: 'Specialization', key: 'specialization', width: 20 },
   { header: 'Status', key: 'status', width: 15 },
  ];

  optimisticFaculty.forEach(f => {
   worksheet.addRow({
    employeeId: f.employeeId, fullName: f.fullName, email: f.email,
    department: f.department, designation: f.designation,
    phone: f.phone, specialization: f.specialization, status: f.status || 'active',
   });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  fileSaver.saveAs(blob, `faculty_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  toast.success('Exported!');
 };

  const handleBulkImport = async (data: Partial<FacultyMember>[]) => {
   let successCount = 0, failCount = 0;
   const errors: string[] = [];

   for (const row of data) {
    const result = await createFacultyAction({
     fullName: row.fullName || '',
     email: row.email || '',
     employeeId: row.employeeId || '',
     department: row.department || '',
     designation: row.designation || '',
     phone: row.phone || '',
     specialization: row.specialization || '',
    });
    
    if (result?.validationErrors || result?.serverError) {
     failCount++;
     const errorMessage = result.serverError || 'Validation failed';
     errors.push(`${row.fullName || 'Unknown'}: ${errorMessage}`);
    } else {
    successCount++;
   }
  }

  router.refresh();
  return { success: successCount, failed: failCount, errors };
 };

 const filtered = optimisticFaculty.filter(f =>
  f.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  f.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
 );

 const columns = useMemo<ColumnDef<any>[]>(() => [
   {
     accessorKey: 'employeeId',
     header: 'Employee ID',
     cell: ({ row }) => <span className="font-mono text-xs font-bold text-primary">{row.original.employeeId || '---'}</span>
   },
   {
     accessorKey: 'fullName',
     header: 'Full Name',
     cell: ({ row }) => <span className="font-bold text-base tracking-tight">{row.original.fullName}</span>
   },
   {
     accessorKey: 'department',
     header: 'Department',
     cell: ({ row }) => <span className="text-muted-foreground font-bold text-xs uppercase">{row.original.department || 'GLOBAL'}</span>
   },
   {
     accessorKey: 'designation',
     header: 'Designation',
     cell: ({ row }) => (
       <Badge variant="outline" className="rounded-sm border font-bold uppercase text-[9px] tracking-widest px-3 py-1">
         {row.original.designation || 'FACULTY'}
       </Badge>
     )
   },
   {
     id: 'actions',
     header: () => <div className="text-right">Actions</div>,
     cell: ({ row }) => (
       <div className="text-right" onClick={e => e.stopPropagation()}>
         {isAdmin && (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="sm" disabled={isPending} className="hover:bg-primary/10 rounded-sm h-9 w-9 p-0">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
             </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-sm border border-primary w-56 font-bold shadow-xl">
             <DropdownMenuItem onClick={() => openEditDialog(row.original as FacultyMember)} className="cursor-pointer font-bold"><Edit className="w-4 h-4 mr-2" /> Edit Details</DropdownMenuItem>
             <DropdownMenuItem onClick={() => handlePromoteHOD(row.original as FacultyMember)} className="cursor-pointer font-bold text-primary"><Crown className="w-4 h-4 mr-2" /> Appoint as HOD</DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-destructive cursor-pointer font-bold"><Trash2 className="w-4 h-4 mr-2" /> Delete Faculty</DropdownMenuItem>
            </DropdownMenuContent>
           </DropdownMenu>
          )}
       </div>
     )
   }
 ], [isAdmin, isPending]);

 return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
     <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
      <Users className="w-8 h-8 text-primary" /> Faculty Directory
     </h2>
     <p className="text-muted-foreground mt-2 font-medium">Manage and view teaching staff profiles.</p>
    </div>
    <div className="flex gap-3 w-full md:w-auto">
     <Button variant="outline" onClick={exportFaculty} className="font-bold border"><Download className="w-4 h-4 mr-2" /> Export</Button>
     <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="font-bold border"><Upload className="w-4 h-4 mr-2" /> Import</Button>
     {isAdmin && (
      <Button onClick={() => { resetForm(); setEditingFaculty(null); setShowDialog(true); }} className="font-bold border border-transparent hover:border-primary/20">
       <UserPlus className="w-4 h-4 mr-2" /> Add Faculty
      </Button>
     )}
    </div>
   </div>

   <div className="grid gap-6 md:grid-cols-2">
    {[
     { icon: Users, label: 'Total Faculty', value: optimisticFaculty.length, color: 'primary' },
     { icon: BookOpen, label: 'Departments', value: new Set(optimisticFaculty.filter(f => f.department).map(f => f.department)).size, color: 'success' },
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
    <Input
     placeholder="Search faculty members..."
     value={searchTerm}
     onChange={e => setSearchTerm(e.target.value)}
     className="h-14 pl-12 border rounded-sm bg-background/50 font-bold"
    />
   </div>

   <div className="card-elevated overflow-hidden border rounded-sm shadow-sm">
    <DataTable columns={columns} data={filtered} onRowClick={(row) => router.push(`/directory/faculty/${row.id}`)} />
   </div>

   <Dialog open={showDialog} onOpenChange={setShowDialog}>
    <DialogContent className=" rounded-sm border border-primary shadow-sm">
     <DialogHeader className="space-y-4">
      <DialogTitle className="text-3xl font-bold">{editingFaculty ? 'Edit Faculty Details' : 'Add New Faculty member'}</DialogTitle>
      <DialogDescription className="font-bold text-[11px] uppercase tracking-widest text-muted-foreground bg-muted p-2 rounded-sm italic opacity-60">Institutional Faculty Registration</DialogDescription>
     </DialogHeader>
     <div className="space-y-6 pt-6">
      <div className="space-y-2">
       <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name *</label>
       <Input {...register('fullName')} className={`h-12 border rounded-sm font-bold ${errors.fullName ? 'border-destructive' : ''}`} placeholder="e.g. ARJUN SHARMA" />
       {errors.fullName && <p className="text-[10px] font-bold text-destructive uppercase">{errors.fullName.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address *</label>
        <Input type="email" {...register('email')} className={`h-12 border rounded-sm font-bold ${errors.email ? 'border-destructive' : ''}`} placeholder="arjun@college.edu" />
        {errors.email && <p className="text-[10px] font-bold text-destructive uppercase">{errors.email.message}</p>}
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department *</label>
        <Input {...register('department')} className={`h-12 border rounded-sm font-bold ${errors.department ? 'border-destructive' : ''}`} placeholder="CSE" />
        {errors.department && <p className="text-[10px] font-bold text-destructive uppercase">{errors.department.message}</p>}
       </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Employee ID *</label>
        <Input {...register('employeeId')} className={`h-12 border rounded-sm font-mono font-bold ${errors.employeeId ? 'border-destructive' : ''}`} placeholder="FAC001" />
        {errors.employeeId && <p className="text-[10px] font-bold text-destructive uppercase">{errors.employeeId.message}</p>}
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Designation *</label>
        <Input {...register('designation')} className={`h-12 border rounded-sm font-bold ${errors.designation ? 'border-destructive' : ''}`} placeholder="Associate Professor" />
        {errors.designation && <p className="text-[10px] font-bold text-destructive uppercase">{errors.designation.message}</p>}
       </div>
      </div>
      <div className="flex gap-4 pt-8">
        <Button 
          onClick={formSubmit(onSubmit)} 
          className="flex-1 h-14 bg-primary text-white font-bold uppercase tracking-widest text-xs shadow-sm rounded-sm hover:brightness-110 active:scale-[0.98] transition-all" 
          disabled={isPending}
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {editingFaculty ? 'Save Changes' : 'Create Faculty account'}
        </Button>
        <Button variant="outline" onClick={() => setShowDialog(false)} className="h-14 border font-bold px-8 uppercase tracking-widest text-[10px] rounded-sm">Cancel</Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
    <DialogContent className=" border border-primary rounded-sm overflow-hidden p-0">
     <DialogHeader className="bg-primary text-white p-10">
      <DialogTitle className="text-3xl font-bold">Bulk Upload Faculty</DialogTitle>
      <DialogDescription className="text-white/70 font-bold uppercase tracking-widest text-[11px] mt-2 italic">Standardized CSV/XLSX data upload</DialogDescription>
     </DialogHeader>
     <div className="p-10">
      <BulkUpload
        entityType="faculty"
        onImport={handleBulkImport}
        templateColumns={['fullName', 'email', 'employeeId', 'department', 'designation', 'phone', 'specialization']}
        sampleData={[{ fullName: 'Dr. John Smith', email: 'john@pec.edu', employeeId: 'FAC001', department: 'CSE', designation: 'Professor', phone: '', specialization: 'AI/ML' }]}
      />
     </div>
    </DialogContent>
   </Dialog>
  </motion.div>
 );
}

