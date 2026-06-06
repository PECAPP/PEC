'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import {
  Users as UsersIcon,
  Search,
  UserPlus,
  Download,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/common/AsyncState';
import { VirtualList } from '@/components/ui/virtual-list';
import { toast } from 'sonner';

interface UserManagementProps {
  initialUsers: any[];
  isAdmin: boolean;
  isFaculty: boolean;
}

export function UserManagementView({ initialUsers, isAdmin, isFaculty }: UserManagementProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();
    return users.filter((u: any) => {
      const matchesSearch = normalizedSearch.length === 0 ||
        u.fullName?.toLowerCase().includes(normalizedSearch) ||
        u.email?.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [deferredSearchTerm, roleFilter, users]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'default';
      case 'faculty': return 'secondary';
      case 'college_admin': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all users across the system</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
           {isAdmin && (
              <Button><UserPlus className="w-4 h-4 mr-2" /> Add User</Button>
           )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
         <div className="card-elevated p-4">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{users.length}</p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="md:w-48"><SelectValue placeholder="All Roles" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="college_admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-muted/20">
                  <td className="p-4 font-medium text-foreground">{user.fullName}</td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <Badge variant={getRoleBadgeColor(user.role)}>
                      {user.role?.replace('_', ' ') || 'No Role'}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                      {user.status || 'active'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
