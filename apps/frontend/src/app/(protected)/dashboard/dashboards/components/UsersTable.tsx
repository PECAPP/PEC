'use client';
import { Button, Badge, Input } from "@pec/ui";

import { UserPlus, Edit, Trash2, Search } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface UsersTableProps {
  users: any[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddUser: () => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (userId: string) => void;
}

export function UsersTable({ 
  users, 
  searchQuery,
  onSearchChange,
  onAddUser, 
  onEditUser, 
  onDeleteUser 
}: UsersTableProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'default';
      case 'faculty': return 'secondary';
      case 'college_admin': return 'destructive';
      case 'super_admin': return 'destructive';
      default: return 'outline';
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.fullName}</span>
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => (
        <Badge variant={getRoleBadgeColor(row.original.role)}>
          {row.original.role?.replace('_', ' ') || 'No Role'}
        </Badge>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status || 'active'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-muted transition-colors" onClick={() => onEditUser(row.original)}>
            <Edit className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md hover:bg-destructive/10 transition-colors" onClick={() => onDeleteUser(row.original.id)}>
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ], [onEditUser, onDeleteUser]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-9 h-10 w-full border rounded-sm bg-background/50" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button onClick={onAddUser} className="w-full sm:w-auto h-10 bg-primary text-primary-foreground font-medium rounded-sm px-4 whitespace-nowrap">
          <UserPlus className="w-4 h-4 mr-2" />Add User
        </Button>
      </div>

      <DataTable columns={columns} data={users} />
    </div>
  );
}
