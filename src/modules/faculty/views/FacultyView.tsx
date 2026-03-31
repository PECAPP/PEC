'use client';

import { useState, useTransition, useEffect, useOptimistic } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { facultySchema, FacultyInput } from '@shared/schemas/erp';
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
import { useAction } from 'next-safe-action/hooks';
import {
 createFacultyAction, 
 updateFacultyAction, 
 deleteFacultyAction, 
 promoteToHODAction,
} from '../actions';

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

 const {
  register,
  handleSubmit: formSubmit,
  reset,
  formState: { errors }
 } = useForm<FacultyInput>({
  resolver: zodResolver(facultySchema),
  defaultValues: emptyForm,
 });

 useEffect(() => { setFaculty(initialFaculty); }, [initialFaculty]);
 
 const [optimisticFaculty, addOptimisticFaculty] = useOptimistic(
  faculty,
  (state, { type, payload }: { type: 'create' | 'update' | 'delete' | 'promote', payload: any }) => {
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
   toast.success('Faculty created!');
   setShowDialog(false);
   reset();
   router.refresh();
  },
  onError: ({ error }) => toast.error(error.serverError || 'Failed to create.'),
 });

 const { execute: executeUpdate } = useAction(updateFacultyAction, {
  onSuccess: () => {
   toast.success('Faculty updated!');
   setShowDialog(false);
   setEditingFaculty(null);
   reset();
   router.refresh();
  },
  onError: ({ error }) => toast.error(error.serverError || 'Failed to update.'),
 });

 const { execute: executeDelete, isPending: isDeleting } = useAction(deleteFacultyAction, {
  onSuccess: () => {
   toast.success('Faculty deleted!');
   router.refresh();
  },
  onError: ({ error }) => toast.error(error.serverError || 'Failed to delete.'),
 });

 const { execute: executePromote } = useAction(promoteToHODAction, {
  onSuccess: () => {
   toast.success('Promotion processed successfully!');
   router.refresh();
  },
  onError: ({ error }) => toast.error(error.serverError || 'Failed to promote.'),
 });

 const resetForm = () => reset(emptyForm);

 const openEditDialog = (fac: any) => {
  setEditingFaculty(fac);
  reset({
   fullName: fac.fullName, email: fac.email,
   employeeId: fac.employeeId || '', department: fac.department || '',
   designation: fac.designation || '', phone: fac.phone || '',
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

 const handlePromoteHOD = (fac: any) => {
  if (!fac.department) {
   toast.error('Department assignment required before HOD elevation.');
   return;
  }
  startTransition(() => {
   addOptimisticFaculty({ type: 'promote', payload: { id: fac.id } });
   executePromote({ ...fac, id: fac.id });
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
  let successCount = 0, failCount = 0;
  const errors: string[] = [];

  // Separate from optimistic for bulk high-volume operations
  for (const row of data) {
   const result = await createFacultyAction({
    fullName: row.fullName,
    email: row.email,
    employeeId: row.employeeId || '',
    department: row.department || '',
    designation: row.designation || '',
    phone: row.phone || '',
    specialization: row.specialization || '',
   });
   
   if (result?.validationErrors || result?.serverError) {
    failCount++;
    errors.push(`${row.fullName}: Injection Refused`);
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

 return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
   <div className="flex items-center justify-between">
    <div>
     <h1 className="text-2xl font-bold uppercase tracking-tight">Faculty Nexus</h1>
     <p className="text-muted-foreground mt-1 font-medium italic">Administrative Persona Control</p>
    </div>
    <div className="flex gap-3">
     <Button variant="outline" onClick={exportFaculty} className="h-11 border-2 font-bold px-6 rounded-sm">
      <Download className="w-4 h-4 mr-2" /> Export
     </Button>
     <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="h-11 border-2 font-bold px-6 rounded-sm">
      <Upload className="w-4 h-4 mr-2" /> Massive Injection
     </Button>
     {isAdmin && (
      <Button onClick={() => { resetForm(); setEditingFaculty(null); setShowDialog(true); }} className="h-11 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-sm px-6">
       <UserPlus className="w-4 h-4 mr-2" /> Add Persona
      </Button>
     )}
    </div>
   </div>

   <div className="grid gap-4 md:grid-cols-2">
    {[
     { icon: Users, label: 'Staff Count', value: optimisticFaculty.length, color: 'primary' },
     { icon: BookOpen, label: 'Domain Reach', value: new Set(optimisticFaculty.filter(f => f.department).map(f => f.department)).size, color: 'success' },
    ].map(({ icon: Icon, label, value, color }) => (
     <div key={label} className="card-elevated p-6 border-b-4 border-r-4 border-primary/20">
      <div className="flex items-center gap-4">
       <div className={`p-3 rounded-sm bg-${color}/10 border border-${color}/20`}><Icon className={`w-6 h-6 text-${color}`} /></div>
       <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{label}</p><p className="text-3xl font-black mt-1">{value}</p></div>
      </div>
     </div>
    ))}
   </div>

   <Input
    placeholder="Search identity matrix..."
    value={searchTerm}
    onChange={e => setSearchTerm(e.target.value)}
    className="h-12 border-2 rounded-sm bg-background/50 font-bold"
   />

   <div className="card-elevated overflow-hidden border-2 rounded-sm shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-muted/50 border-b-2 border-border">
       <tr>
        {['Registry ID', 'Full Persona', 'Domain', 'Identity Badge', 'Actions'].map((h, i) => (
         <th key={h} className={`p-5 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
        ))}
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       {filtered.map(fac => (
        <tr key={fac.id} className="hover:bg-muted/20 cursor-pointer transition-all border-l-4 border-transparent hover:border-primary" onClick={() => router.push(`/users/${fac.id}`)}>
         <td className="p-5 font-mono text-xs font-bold text-primary">{fac.employeeId || '---'}</td>
         <td className="p-5 font-bold text-base tracking-tight">{fac.fullName}</td>
         <td className="p-5 text-muted-foreground font-bold text-xs uppercase">{fac.department || 'GLOBAL'}</td>
         <td className="p-5">
          <Badge variant="outline" className="rounded-sm border-2 font-black uppercase text-[9px] tracking-widest px-3 py-1">
           {fac.designation || 'FACULTY'}
          </Badge>
         </td>
         <td className="p-5 text-right" onClick={e => e.stopPropagation()}>
          {isAdmin && (
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="sm" disabled={isPending} className="hover:bg-primary/10 rounded-sm">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
             </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-sm border-2 border-primary w-48 font-bold">
             <DropdownMenuItem onClick={() => openEditDialog(fac)} className="cursor-pointer font-bold"><Edit className="w-4 h-4 mr-2" /> Modify Persona</DropdownMenuItem>
             <DropdownMenuItem onClick={() => handlePromoteHOD(fac)} className="cursor-pointer font-bold text-primary"><Crown className="w-4 h-4 mr-2" /> Elevate to Lead</DropdownMenuItem>
             <DropdownMenuSeparator />
             <DropdownMenuItem onClick={() => handleDelete(fac.id)} className="text-destructive cursor-pointer font-bold"><Trash2 className="w-4 h-4 mr-2" /> Terminate Access</DropdownMenuItem>
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
    <DialogContent className="max-w-xl rounded-sm border-2 border-primary shadow-[15px_15px_0px_rgba(0,0,0,0.1)]">
     <DialogHeader className="space-y-4">
      <DialogTitle className="text-3xl font-black uppercase tracking-tight">{editingFaculty ? 'Modify Persona' : 'Initialize Identity'}</DialogTitle>
     </DialogHeader>
     <div className="space-y-6 pt-6">
      <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Nominal *</label>
       <Input {...register('fullName')} className={`h-12 border-2 rounded-sm font-bold ${errors.fullName ? 'border-destructive' : ''}`} placeholder="ARJUN SHARMA" />
       {errors.fullName && <p className="text-[10px] font-bold text-destructive uppercase">{errors.fullName.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gateway Email *</label>
        <Input type="email" {...register('email')} className={`h-12 border-2 rounded-sm font-bold ${errors.email ? 'border-destructive' : ''}`} placeholder="ARJUN@PEC.EDU" />
        {errors.email && <p className="text-[10px] font-bold text-destructive uppercase">{errors.email.message}</p>}
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Assigned Domain *</label>
        <Input {...register('department')} className={`h-12 border-2 rounded-sm font-bold ${errors.department ? 'border-destructive' : ''}`} placeholder="CSE" />
        {errors.department && <p className="text-[10px] font-bold text-destructive uppercase">{errors.department.message}</p>}
       </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Staff Registry ID *</label>
        <Input {...register('employeeId')} className={`h-12 border-2 rounded-sm font-mono font-bold ${errors.employeeId ? 'border-destructive' : ''}`} placeholder="FAC001" />
        {errors.employeeId && <p className="text-[10px] font-bold text-destructive uppercase">{errors.employeeId.message}</p>}
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Designation Badge *</label>
        <Input {...register('designation')} className={`h-12 border-2 rounded-sm font-bold ${errors.designation ? 'border-destructive' : ''}`} placeholder="Associate Professor" />
        {errors.designation && <p className="text-[10px] font-bold text-destructive uppercase">{errors.designation.message}</p>}
       </div>
      </div>
      <div className="flex gap-4 pt-8">
       <Button onClick(formSubmit(onSubmit)) className="flex-1 h-14 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg rounded-sm hover:brightness-110 active:scale-[0.98] transition-all" disabled={isPending}>
        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {editingFaculty ? 'Commit Changes' : 'Authorize Identity'}
       </Button>
       <Button variant="outline" onClick={() => setShowDialog(false)} className="h-14 border-2 font-bold px-8 uppercase tracking-widest text-[10px] rounded-sm">Abort</Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>

   <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
    <DialogContent className="max-w-4xl border-2 border-primary rounded-sm overflow-hidden p-0">
     <DialogHeader className="bg-primary text-white p-10">
      <DialogTitle className="text-3xl font-black uppercase">Mass Enrollment Protocol</DialogTitle>
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
