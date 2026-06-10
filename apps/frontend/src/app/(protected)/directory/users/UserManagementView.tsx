'use client';
import { Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@pec/ui";


import { useDeferredValue, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Users as UsersIcon, UserPlus, Edit, Trash2, Download,
 Shield, ShieldOff, ShieldCheck, Loader2, Search
} from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';

import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import {
 createUserAction, updateUserAction, deleteUserAction, changeStatusAction
} from './actions';

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
 admin:      { label: 'Admin',   color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

const STATUS_META: Record<string, string> = {
 active:  'bg-success/10 text-success border-success/20',
 inactive: 'bg-muted/30 text-muted-foreground border-border',
 suspended: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function UserManagementView({ initialUsers, isAdmin }: UserManagementViewProps) {
 const router = useRouter();
 const [users] = useState(initialUsers);
 const [searchTerm, setSearchTerm] = useState('');
 const [roleFilter, setRoleFilter] = useState('all');
 const [showDialog, setShowDialog] = useState(false);
 const [editingUser, setEditingUser] = useState<any>(null);
 const [form, setForm] = useState(emptyForm);
 const deferredSearch = useDeferredValue(searchTerm);

 const { execute: executeCreate, isPending: isCreating } = useAction(createUserAction, {
  onSuccess: () => { toast.success('User account created!'); setShowDialog(false); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Failed to create account.'),
 });

 const { execute: executeUpdate, isPending: isUpdating } = useAction(updateUserAction, {
  onSuccess: () => { toast.success('User updated.'); setShowDialog(false); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Update failed.'),
 });

 const { execute: executeDelete } = useAction(deleteUserAction, {
  onSuccess: () => { toast.success('User account deleted.'); router.refresh(); },
  onError: ({ error }) => toast.error(error.serverError || 'Failed to delete account.'),
 });

 const { execute: changeStatus } = useAction(changeStatusAction, {
  onSuccess: () => { toast.success('Status updated.'); router.refresh(); },
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

 const columns = useMemo<ColumnDef<any>[]>(() => [
  {
   accessorKey: 'fullName',
   header: 'Name',
   cell: ({ row }) => <span className="font-bold text-base tracking-tight">{row.original.fullName}</span>
  },
  {
   accessorKey: 'email',
   header: 'Email Address',
   cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground font-medium">{row.original.email}</span>
  },
  {
   accessorKey: 'role',
   header: 'Role',
   cell: ({ row }) => {
    const user = row.original;
    return (
     <Badge className={`border rounded-sm font-bold uppercase text-[9px] tracking-widest px-4 py-1.5 ${ROLE_META[user.role]?.color || 'bg-muted text-muted-foreground'}`}>
      {ROLE_META[user.role]?.label || user.role || 'UNKNOWN'}
     </Badge>
    );
   }
  },
  {
   accessorKey: 'status',
   header: 'Status',
   cell: ({ row }) => {
    const user = row.original;
    return (
     <Badge className={`border rounded-sm font-bold uppercase text-[9px] tracking-widest px-4 py-1.5 ${STATUS_META[user.status || 'active']}`}>
      {(user.status || 'active').toUpperCase()}
     </Badge>
    );
   }
  },
  {
   id: 'actions',
   header: 'Actions',
   cell: ({ row }) => {
    const user = row.original;
    return (
     <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
      {isAdmin && (
       <DropdownMenu>
        <DropdownMenuTrigger asChild>
         <Button variant="ghost" size="sm" className="hover:bg-primary/10 rounded-sm h-9 w-9 p-0">
          <Edit className="w-4 h-4" />
         </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border border-primary rounded-sm w-52 font-bold">
         <DropdownMenuItem onClick={() => openEditDialog(user)} className="cursor-pointer"><Edit className="w-4 h-4 mr-2" /> Edit Details</DropdownMenuItem>
         <DropdownMenuItem onClick={() => changeStatus({ id: user.id, status: user.status === 'active' ? 'suspended' : 'active' })} className="cursor-pointer">
          <ShieldOff className="w-4 h-4 mr-2" /> {user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
         </DropdownMenuItem>
         <DropdownMenuSeparator />
         <DropdownMenuItem onClick={() => { if (confirm(`Delete user ${user.fullName}?`)) executeDelete({ id: user.id }); }} className="text-destructive cursor-pointer">
          <Trash2 className="w-4 h-4 mr-2" /> Delete Account
         </DropdownMenuItem>
        </DropdownMenuContent>
       </DropdownMenu>
      )}
     </div>
    );
   }
  }
 ], [isAdmin, openEditDialog, changeStatus, executeDelete]);

 return (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
   {/* Header */}
   <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
    <div>
     <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
     <p className="text-muted-foreground font-medium italic text-[11px] mt-1">Manage institutional user accounts and access levels</p>
    </div>
    <div className="flex gap-3">
     <Button variant="outline" className="h-11 border font-bold px-6 rounded-sm">
      <Download className="w-4 h-4 mr-2" /> Export
     </Button>
     {isAdmin && (
      <Button onClick={() => { setEditingUser(null); setForm(emptyForm); setShowDialog(true); }} className="h-11 bg-primary text-white font-bold text-[10px] uppercase tracking-widest rounded-sm px-6">
       <UserPlus className="w-4 h-4 mr-2" /> Add User
      </Button>
     )}
    </div>
   </div>

   {/* Stats */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[
     { label: 'Total Users', value: users.length, icon: UsersIcon, color: 'primary' },
     { label: 'Students', value: countByRole('student'), icon: Shield, color: 'success' },
     { label: 'Faculty', value: countByRole('faculty'), icon: ShieldCheck, color: 'warning' },
     { label: 'Admins', value: countByRole('college_admin'), icon: ShieldOff, color: 'destructive' },
    ].map(({ label, value, icon: Icon, color }) => (
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

   {/* Filters */}
   <div className="flex flex-col md:flex-row gap-4">
    <div className="relative flex-1">
     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
     <Input placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="h-14 pl-12 border rounded-sm font-bold bg-background/50" />
    </div>
    <Select value={roleFilter} onValueChange={setRoleFilter}>
     <SelectTrigger className="h-14 border rounded-sm font-bold w-full md:w-56 bg-background/50">
      <SelectValue placeholder="All Roles" />
     </SelectTrigger>
     <SelectContent className="border rounded-sm">
      <SelectItem value="all" className="font-bold">All Roles</SelectItem>
      <SelectItem value="student" className="font-bold">Students</SelectItem>
      <SelectItem value="faculty" className="font-bold">Faculty</SelectItem>
      <SelectItem value="college_admin" className="font-bold">Admins</SelectItem>
     </SelectContent>
    </Select>
   </div>

   {/* Table */}
   <div className="card-elevated border rounded-sm overflow-hidden shadow-sm">
    <DataTable columns={columns} data={filteredUsers} onRowClick={(row) => router.push(`/users/${row.id}`)} />
    <div className="px-6 py-4 border-t-2 border-border bg-muted/30 flex items-center justify-between">
     <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      Showing {filteredUsers.length} of {users.length} accounts
     </p>
    </div>
   </div>

   {/* Dialog */}
   <Dialog open={showDialog} onOpenChange={setShowDialog}>
    <DialogContent className=" rounded-sm border border-primary shadow-sm">
     <DialogHeader className="space-y-3">
      <DialogTitle className="text-3xl font-bold">{editingUser ? 'Edit User details' : 'Add New User'}</DialogTitle>
      <DialogDescription className="text-[10px] font-bold uppercase tracking-widest bg-muted p-2 rounded-sm italic opacity-60">Institutional User Registration</DialogDescription>
     </DialogHeader>
     <div className="space-y-6 pt-4">
      <div className="space-y-2">
       <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name *</label>
       <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="h-12 border rounded-sm font-bold" />
      </div>
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email Address *</label>
        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-12 border rounded-sm font-bold" />
       </div>
       <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">User Role *</label>
        <Select value={form.role} onValueChange={(v: any) => setForm({ ...form, role: v })}>
         <SelectTrigger className="h-12 border rounded-sm font-bold">
          <SelectValue />
         </SelectTrigger>
         <SelectContent className="border rounded-sm">
          <SelectItem value="student" className="font-bold">STUDENT</SelectItem>
          <SelectItem value="faculty" className="font-bold">FACULTY</SelectItem>
          <SelectItem value="college_admin" className="font-bold">Admin</SelectItem>
         </SelectContent>
        </Select>
       </div>
      </div>
      <div className="space-y-2">
       <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Department / Assignment</label>
       <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="h-12 border rounded-sm font-bold" placeholder="e.g. CSE" />
      </div>
      <div className="flex gap-4 pt-6">
       <Button onClick={handleSubmit} disabled={isCreating || isUpdating} className="flex-1 h-14 bg-primary text-white font-bold uppercase tracking-widest text-[10px] rounded-sm">
        {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {editingUser ? 'Save Changes' : 'Create Account'}
       </Button>
       <Button variant="outline" onClick={() => setShowDialog(false)} className="h-14 border font-bold px-8 uppercase tracking-widest text-[10px] rounded-sm">Cancel</Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>
  </motion.div>
 );
}
