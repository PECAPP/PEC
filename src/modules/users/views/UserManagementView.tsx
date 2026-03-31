'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Users as UsersIcon, UserPlus, Edit, Trash2, Download,
 Shield, ShieldOff, ShieldCheck, Loader2, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
 Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
 Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
 DropdownMenu, DropdownMenuContent, DropdownMenuItem,
 DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import {
 createUserAction, updateUserAction, deleteUserAction, changeStatusAction
} from '../actions';

interface UserManagementViewProps {
 initialUsers: any[];
 isAdmin: boolean;
 isFaculty: boolean;
}

const emptyForm = {
 fullName: '', email: '', role: 'student' as const,
 department: '', employeeId: '', designation: '',
 enrollmentNumber: '', semester: undefined as number | undefined,
};

const ROLE_META: Record<string, { label: string; color: string }> = {
 student:    { label: 'Student',  color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
 faculty:    { label: 'Faculty',  color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
 college_admin: { label: 'Admin',   color: 'bg-red-500/10 text-red-500 border-red-500/20' },
 super_admin:  { label: 'Super Admin',color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
};

const STATUS_META: Record<string, string> = {
 active:  'bg-success/10 text-success border-success/20',
 inactive: 'bg-muted/30 text-muted-foreground border-border',
 suspended: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function UserManagementView({ initialUsers, isAdmin, isFaculty }: UserManagementViewProps) {
 const router = useRouter();
 const [users, setUsers] = useState(initialUsers);
 const [searchTerm, setSearchTerm] = useState('');
 const [roleFilter, setRoleFilter] = useState('all');
 const [showDialog, setShowDialog] = useState(false);
 const [editingUser, setEditingUser] = useState<any>(null);
 const [form, setForm] = useState(emptyForm);
 const deferredSearch = useDeferredValue(searchTerm);

 const { execute: executeCreate, isPending: isCreating } = useAction(createUserAction, {
  onSuccess: () => { toast.success('Identity provisioned!'); setShowDialog(false); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Provisioning failed.'),
 });

 const { execute: executeUpdate, isPending: isUpdating } = useAction(updateUserAction, {
  onSuccess: () => { toast.success('Identity updated.'); setShowDialog(false); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Update failed.'),
 });

 const { execute: executeDelete } = useAction(deleteUserAction, {
  onSuccess: () => { toast.success('Identity terminated.'); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Termination failed.'),
 });

 const { execute: changeStatus } = useAction(changeStatusAction, {
  onSuccess: () => { toast.success('Status synchronized.'); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Status update failed.'),
 });

 const filteredUsers = useMemo(() => {
  const q = deferredSearch.trim().toLowerCase();
  return users.filter((u: any) => {
   const matchSearch = !q || u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
   const matchRole = roleFilter === 'all' || u.role === roleFilter;
   return matchSearch && matchRole;
  });
 }, [deferredSearch, roleFilter, users]);

 const openEditDialog = (u: any) => {
  setEditingUser(u);
  setForm({ fullName: u.fullName, email: u.email, role: u.role || 'student', department: u.department || '', employeeId: u.employeeId || '', designation: u.designation || '', enrollmentNumber: u.enrollmentNumber || '', semester: u.semester });
  setShowDialog(true);
 };

 const handleSubmit = () => {
  if (editingUser) {
   executeUpdate({ ...form, id: editingUser.id });
  } else {
   executeCreate(form);
  }
 };

 const countByRole = (role: string) => users.filter((u: any) => u.role === role).length;

 return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
   {/* Header */}
   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div>
     <h1 className="text-3xl font-black uppercase tracking-tight">Identity Matrix</h1>
     <p className="text-muted-foreground font-bold italic text-[11px] uppercase tracking-widest mt-1">Global Access Registry</p>
    </div>
    <div className="flex gap-3">
     <Button variant="outline" className="h-11 border-2 font-bold px-6 rounded-sm">
      <Download className="w-4 h-4 mr-2" /> Export
     </Button>
     {isAdmin && (
      <Button onClick={() => { setEditingUser(null); setForm(emptyForm); setShowDialog(true); }} className="h-11 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-sm px-6">
       <UserPlus className="w-4 h-4 mr-2" /> Provision Identity
      </Button>
     )}
    </div>
   </div>

   {/* Stats */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[
     { label: 'Total Identities', value: users.length, icon: UsersIcon, color: 'primary' },
     { label: 'Students', value: countByRole('student'), icon: Shield, color: 'success' },
     { label: 'Faculty', value: countByRole('faculty'), icon: ShieldCheck, color: 'warning' },
     { label: 'Admins', value: countByRole('college_admin'), icon: ShieldOff, color: 'destructive' },
    ].map(({ label, value, icon: Icon, color }) => (
     <div key={label} className="card-elevated p-6 border-b-4 border-r-4 border-primary/10">
      <div className="flex items-center gap-4">
       <div className={`p-3 rounded-sm bg-${color}/10 border border-${color}/20`}><Icon className={`w-6 h-6 text-${color}`} /></div>
       <div>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60">{label}</p>
        <p className="text-4xl font-black mt-1">{value}</p>
       </div>
      </div>
     </div>
    ))}
   </div>

   {/* Filters */}
   <div className="flex flex-col md:flex-row gap-4">
    <div className="relative flex-1">
     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
     <Input placeholder="Search identity matrix..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-14 pl-12 border-2 rounded-sm font-bold bg-background/50" />
    </div>
    <Select value={roleFilter} onValueChange={setRoleFilter}>
     <SelectTrigger className="h-14 border-2 rounded-sm font-bold w-full md:w-56 bg-background/50">
      <SelectValue placeholder="All Identities" />
     </SelectTrigger>
     <SelectContent className="border-2 rounded-sm">
      <SelectItem value="all" className="font-bold">All Identities</SelectItem>
      <SelectItem value="student" className="font-bold">Students</SelectItem>
      <SelectItem value="faculty" className="font-bold">Faculty</SelectItem>
      <SelectItem value="college_admin" className="font-bold">Administrators</SelectItem>
     </SelectContent>
    </Select>
   </div>

   {/* Table */}
   <div className="card-elevated border-2 rounded-sm overflow-hidden shadow-[12px_12px_0px_rgba(0,0,0,0.03)]">
    <div className="overflow-x-auto">
     <table className="w-full">
      <thead className="bg-muted/50 border-b-2 border-border">
       <tr>
        {['Identity', 'Gateway Mail', 'Clearance Level', 'Protocol Status', 'Actions'].map((h, i) => (
         <th key={h} className={`p-5 text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50 ${i >= 4 ? 'text-right' : 'text-left'}`}>{h}</th>
        ))}
       </tr>
      </thead>
      <tbody className="divide-y divide-border">
       <AnimatePresence>
        {filteredUsers.length === 0 ? (
         <tr><td colSpan={5} className="p-20 text-center text-muted-foreground font-bold italic text-sm">No identities found in registry.</td></tr>
        ) : filteredUsers.map((user: any) => (
         <motion.tr
          key={user.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hover:bg-muted/20 transition-all border-l-4 border-transparent hover:border-primary cursor-pointer"
          onClick={() => router.push(`/users/${user.id}`)}
         >
          <td className="p-5 font-black text-base tracking-tight">{user.fullName}</td>
          <td className="p-5 font-mono text-xs text-muted-foreground font-bold">{user.email}</td>
          <td className="p-5">
           <Badge className={`border rounded-sm font-black uppercase text-[9px] tracking-widest px-4 py-1.5 ${ROLE_META[user.role]?.color || 'bg-muted text-muted-foreground'}`}>
            {ROLE_META[user.role]?.label || user.role || 'UNKNOWN'}
           </Badge>
          </td>
          <td className="p-5">
           <Badge className={`border rounded-sm font-black uppercase text-[9px] tracking-widest px-4 py-1.5 ${STATUS_META[user.status || 'active']}`}>
            {(user.status || 'active').toUpperCase()}
           </Badge>
          </td>
          <td className="p-5" onClick={e => e.stopPropagation()}>
           <div className="flex items-center justify-end gap-2">
            {isAdmin && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="sm" className="hover:bg-primary/10 rounded-sm h-9 w-9 p-0">
                <Edit className="w-4 h-4" />
               </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-2 border-primary rounded-sm w-52 font-bold">
               <DropdownMenuItem onClick={() => openEditDialog(user)} className="cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Modify Identity</DropdownMenuItem>
               <DropdownMenuItem onClick={() => changeStatus({ id: user.id, status: user.status === 'active' ? 'suspended' : 'active' })} className="cursor-pointer">
                <ShieldOff className="w-4 h-4 mr-2" /> {user.status === 'active' ? 'Suspend Access' : 'Restore Access'}
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem onClick={() => { if (confirm(`Terminate ${user.fullName}?`)) deleteUserAction({ id: user.id }); router.refresh(); }} className="text-destructive cursor-pointer">
                <Trash2 className="w-4 h-4 mr-2" /> Terminate Identity
               </DropdownMenuItem>
              </DropdownMenuContent>
             </DropdownMenu>
            )}
           </div>
          </td>
         </motion.tr>
        ))}
       </AnimatePresence>
      </tbody>
     </table>
    </div>
    <div className="px-6 py-4 border-t-2 border-border bg-muted/30 flex items-center justify-between">
     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
      Showing {filteredUsers.length} of {users.length} identities
     </p>
    </div>
   </div>

   {/* Dialog */}
   <Dialog open={showDialog} onOpenChange={setShowDialog}>
    <DialogContent className="max-w-xl rounded-sm border-2 border-primary shadow-[20px_20px_0px_rgba(0,0,0,0.05)]">
     <DialogHeader className="space-y-3">
      <DialogTitle className="text-3xl font-black uppercase">{editingUser ? 'Modify Identity' : 'Provision Identity'}</DialogTitle>
      <DialogDescription className="text-[10px] font-black uppercase tracking-widest bg-muted p-2 rounded-sm">Secure Domain Registration Protocol</DialogDescription>
     </DialogHeader>
     <div className="space-y-6 pt-4">
      <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Nominal *</label>
       <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="h-12 border-2 rounded-sm font-bold" placeholder="FULL NAME" />
      </div>
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gateway Email *</label>
        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-12 border-2 rounded-sm font-bold" />
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Clearance Level *</label>
        <Select value={form.role} onValueChange={(v: any) => setForm({ ...form, role: v })}>
         <SelectTrigger className="h-12 border-2 rounded-sm font-bold">
          <SelectValue />
         </SelectTrigger>
         <SelectContent className="border-2 rounded-sm">
          <SelectItem value="student" className="font-bold">STUDENT</SelectItem>
          <SelectItem value="faculty" className="font-bold">FACULTY</SelectItem>
          <SelectItem value="college_admin" className="font-bold">ADMINISTRATOR</SelectItem>
         </SelectContent>
        </Select>
       </div>
      </div>
      <div className="space-y-2">
       <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Domain Assignment</label>
       <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="h-12 border-2 rounded-sm font-bold" placeholder="e.g. CSE" />
      </div>
      <div className="flex gap-4 pt-6">
       <Button onClick={handleSubmit} disabled={isCreating || isUpdating} className="flex-1 h-14 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-sm">
        {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {editingUser ? 'Commit Changes' : 'Authorize Registration'}
       </Button>
       <Button variant="outline" onClick={() => setShowDialog(false)} className="h-14 border-2 font-bold px-8 uppercase tracking-widest text-[10px] rounded-sm">Abort</Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>
  </motion.div>
 );
}

