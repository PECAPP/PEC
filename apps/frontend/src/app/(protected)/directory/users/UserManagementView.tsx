'use client';
import { Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, PageBanner, StatCard, StatusBadge } from "@pec/ui";


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
  student:    { label: 'Student',  color: 'bg-blue-500/15 text-blue-500' },
  faculty:    { label: 'Faculty',  color: 'bg-purple-500/15 text-purple-500' },
  college_admin: { label: 'Admin',   color: 'bg-emerald-500/15 text-emerald-500' },
  super_admin: { label: 'Admin',   color: 'bg-emerald-500/15 text-emerald-500' },
};

const STATUS_META: Record<string, string> = {
 active:  'bg-emerald-500/15 text-emerald-500',
 inactive: 'bg-muted text-muted-foreground',
 suspended: 'bg-destructive/15 text-destructive',
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
   cell: ({ row }) => <span className="font-semibold text-sm">{row.original.fullName}</span>
  },
  {
   accessorKey: 'email',
   header: 'Email Address',
   cell: ({ row }) => <span className="text-sm text-muted-foreground font-medium">{row.original.email}</span>
  },
  {
   accessorKey: 'role',
   header: 'Role',
   cell: ({ row }) => {
    const user = row.original;
    return (
     <Badge variant="secondary" className={`font-semibold text-[10px] uppercase px-2.5 py-0.5 ${ROLE_META[user.role]?.color || 'bg-muted text-muted-foreground'}`}>
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
     <StatusBadge status={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'danger' : 'default'}>
      {(user.status || 'active').toUpperCase()}
     </StatusBadge>
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
        <DropdownMenuContent align="end" className="border border-border/40 rounded-sm w-52 font-bold">
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
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

   {/* Stats */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    <StatCard
      label="Total Users"
      value={users.length}
      icon={<UsersIcon className="w-6 h-6" />}
      colorVariant="primary"
    />
    <StatCard
      label="Students"
      value={countByRole('student')}
      icon={<Shield className="w-6 h-6" />}
      colorVariant="success"
    />
    <StatCard
      label="Faculty"
      value={countByRole('faculty')}
      icon={<ShieldCheck className="w-6 h-6" />}
      colorVariant="info"
    />
    <StatCard
      label="Admins"
      value={countByRole('college_admin')}
      icon={<ShieldOff className="w-6 h-6" />}
      colorVariant="danger"
    />
   </div>

   {/* Filters */}
   {/* Filters and Actions */}
   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
     <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 h-10 w-full" />
     </div>
     <Select value={roleFilter} onValueChange={setRoleFilter}>
      <SelectTrigger className="h-10 border rounded-sm w-full md:w-48 bg-background/50">
       <SelectValue placeholder="Filter by role" />
      </SelectTrigger>
      <SelectContent className="rounded-sm border-border/40">
       <SelectItem value="all" className="font-medium">All Roles</SelectItem>
       <SelectItem value="student" className="font-medium">Students</SelectItem>
       <SelectItem value="faculty" className="font-medium">Faculty</SelectItem>
       <SelectItem value="college_admin" className="font-medium">Admins</SelectItem>
      </SelectContent>
     </Select>
    </div>
    
    <div className="flex items-center gap-3 w-full md:w-auto">
     <Button variant="outline" className="h-10 font-medium px-4 rounded-sm shadow-sm bg-background">
      <Download className="w-4 h-4 mr-2" /> Export Users
     </Button>
     {isAdmin && (
      <Button onClick={() => { setEditingUser(null); setForm(emptyForm); setShowDialog(true); }} className="h-10 bg-primary text-primary-foreground font-medium rounded-sm px-4 whitespace-nowrap">
       <UserPlus className="w-4 h-4 mr-2" /> Add User
      </Button>
     )}
    </div>
   </div>

   {/* Table */}
   {/* Table */}
   <div className="flex flex-col gap-4">
    <DataTable columns={columns} data={filteredUsers} onRowClick={(row) => router.push(`/directory/users/${row.id}`)} />
    <div className="flex items-center justify-between">
     <p className="text-sm font-medium text-muted-foreground">
      Showing {filteredUsers.length} of {users.length} accounts
     </p>
    </div>
   </div>

   {/* Dialog */}
   <Dialog open={showDialog} onOpenChange={setShowDialog}>
    <DialogContent className=" rounded-sm border border-border/40 shadow-sm">
     <DialogHeader className="space-y-3">
      <DialogTitle className="text-3xl font-bold">{editingUser ? 'Edit User details' : 'Add New User'}</DialogTitle>
      <DialogDescription className="text-sm font-medium  bg-muted p-2 rounded-sm italic opacity-60">Institutional User Registration</DialogDescription>
     </DialogHeader>
     <div className="space-y-6 pt-4">
      <div className="space-y-2">
       <label className="text-sm font-medium  text-muted-foreground">Full Name *</label>
       <Input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="h-12 border rounded-sm font-bold" />
      </div>
      <div className="grid grid-cols-2 gap-6">
       <div className="space-y-2">
        <label className="text-sm font-medium  text-muted-foreground">Email Address *</label>
        <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="h-12 border rounded-sm font-bold" />
       </div>
       <div className="space-y-2">
        <label className="text-sm font-medium  text-muted-foreground">User Role *</label>
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
       <label className="text-sm font-medium  text-muted-foreground">Department / Assignment</label>
       <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="h-12 border rounded-sm font-bold" placeholder="e.g. CSE" />
      </div>
      <div className="flex gap-4 pt-6">
       <Button onClick={handleSubmit} disabled={isCreating || isUpdating} className="flex-1 h-14 bg-primary text-white font-bold  text-[10px] rounded-sm">
        {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {editingUser ? 'Save Changes' : 'Create Account'}
       </Button>
       <Button variant="outline" onClick={() => setShowDialog(false)} className="h-14 border font-bold px-4 md:px-8  text-[10px] rounded-sm">Cancel</Button>
      </div>
     </div>
    </DialogContent>
   </Dialog>
  </motion.div>
 );
}
