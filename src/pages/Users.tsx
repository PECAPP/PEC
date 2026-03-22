import { useDeferredValue, useMemo, useState, useEffect } from 'react';
import { exportUserListPDF } from '@/lib/pdfExport';
import PDFExportButton from '@/components/common/PDFExportButton';
import {
  Users as UsersIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Shield,
  Upload,
  Download,
  Key,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  collection,
  getDocs,
  query,
  where,
} from '@/lib/dataClient';
import { usePermissions } from '@/hooks/usePermissions';
import { useDepartmentFilter } from '@/hooks/useDepartmentFilter';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { EmptyState, LoadingGrid } from '@/components/common/AsyncState';
import { VirtualList } from '@/components/ui/virtual-list';
import api from '@/lib/api';

export default function Users() {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { isAdmin, isFaculty, user, loading: authLoading } = usePermissions();
  const { filterByDepartment, canManageItem, userDepartment } = useDepartmentFilter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const [showDialog, setShowDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    role: 'student',
    enrollmentNumber: '',
    employeeId: '',
    department: '',
    semester: 1,
    phone: '',
    dateOfBirth: '',
    designation: '',
    specialization: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    // Check access permissions
    if (!isAdmin && !isFaculty) {
      toast.error('Access denied.');
      navigate('/dashboard');
      return;
    }

    const loadUsers = async () => {
      try {
        await fetchUsers();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [user, isAdmin, isFaculty, navigate, authLoading, orgSlug]);

  const fetchUsers = async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const params: Record<string, unknown> = {
        limit: 200,
        offset: 0,
      };

      if (isFaculty && !isAdmin && userDepartment) {
        params.department = userDepartment;
      }

      const usersResponse = await api.get<ApiResponse<any[]>>('/users', { params });
      let usersData = (usersResponse.data.data || []).map((data: any) => {
        return {
          id: data.id,
          ...data,
          fullName: data.fullName || data.name || '',
          status: data.status || 'active',
        };
      });

      // Apply department filtering client-side for faculty (security rule handles server side)
      usersData = filterByDepartment(usersData);

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/users', {
        fullName: userForm.fullName,
        email: userForm.email,
        role: userForm.role,
        department: userForm.department || undefined,
        enrollmentNumber:
          userForm.role === 'student' ? userForm.enrollmentNumber || undefined : undefined,
        semester:
          userForm.role === 'student' ? Number(userForm.semester || 1) : undefined,
      });

      toast.success('User created successfully!');
      setShowDialog(false);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await api.patch(`/users/${editingUser.id}`, {
        fullName: userForm.fullName,
        email: userForm.email,
        role: userForm.role,
        department: userForm.department || undefined,
        enrollmentNumber:
          userForm.role === 'student' ? userForm.enrollmentNumber || undefined : undefined,
        semester:
          userForm.role === 'student' ? Number(userForm.semester || 1) : undefined,
      });

      toast.success('User updated successfully!');
      setShowDialog(false);
      setEditingUser(null);
      resetForm();
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully!');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleHardDelete = async (userId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can permanently delete users');
      return;
    }
    if (!confirm('PERMANENT DELETE: This will completely remove the user from the system. This cannot be undone. Are you absolutely sure?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User permanently deleted!');
      await fetchUsers();
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      toast.error('Failed to permanently delete user');
    }
  };

  const handleSuspend = async (userId: string, currentStatus: string) => {
    if (!canManageItem((users.find(u => u.id === userId) as any)?.department)) {
      toast.error('You can only suspend users in your department');
      return;
    }
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      await api.patch(`/users/${userId}`, {
        status: newStatus,
      });
      toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully!`);
      await fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await authClient.requestPasswordReset(email);
      toast.success(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Failed to send password reset email');
    }
  };

  const handleBulkImport = async (data: any[]) => {
    const CHUNK_SIZE = 40;
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      const requests = chunk.map(async (row) => {
      const role = row.role || 'student';
        try {
        await api.post('/users', {
        fullName: row.fullName || row.name,
        email: row.email,
        role,
        department: row.department || undefined,
        enrollmentNumber:
          role === 'student' ? row.enrollmentNumber || undefined : undefined,
        semester: role === 'student' ? Number(row.semester || 1) : undefined,
        });
        successCount += 1;
        } catch (error) {
        failCount += 1;
        errors.push(
        `${row.email || row.fullName || row.name || 'row'}: ${(error as Error).message}`,
        );
        }
      });

      await Promise.all(requests);
    }

    await fetchUsers();
    return { success: successCount, failed: failCount, errors };
  };

  const exportUsers = () => {
    const exportData = filteredUsers.map(user => ({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      createdAt: user.createdAt?.toDate?.()?.toLocaleDateString() || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Users exported successfully!');
  };

  const resetForm = () => {
    setUserForm({
      fullName: '',
      email: '',
      role: 'student',
      enrollmentNumber: '',
      employeeId: '',
      department: '',
      semester: 1,
      phone: '',
      dateOfBirth: '',
      designation: '',
      specialization: '',
    });
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setUserForm({
      fullName: user.fullName || user.name || '',
      email: user.email,
      role: user.role,
      enrollmentNumber: user.enrollmentNumber || '',
      employeeId: user.employeeId || '',
      department: user.department || '',
      semester: user.semester || 1,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      designation: user.designation || '',
      specialization: user.specialization || '',
    });
    setShowDialog(true);
  };

  const filteredUsers = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase();

    return users.filter((u) => {
      if (u.status === 'deleted') return false;

      if (!isAdmin && u.role !== 'student') {
        return false;
      }

      const matchesSearch =
        normalizedSearch.length === 0 ||
        u.fullName?.toLowerCase().includes(normalizedSearch) ||
        u.name?.toLowerCase().includes(normalizedSearch) ||
        u.email?.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [deferredSearchTerm, isAdmin, roleFilter, users]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'default';
      case 'faculty': return 'secondary';
      case 'college_admin': return 'destructive';
      default: return 'outline';
    }
  };

  const bulkUploadTemplate = [
    'fullName',
    'email',
    'role',
    'department',
    'enrollmentNumber',
    'employeeId',
    'phone',
  ];

  const sampleBulkData = [
    {
      fullName: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      department: 'Computer Science',
      enrollmentNumber: 'CS2024001',
      employeeId: '',
      phone: '+1234567890',
    },
    {
      fullName: 'Dr. Jane Smith',
      email: 'jane@example.com',
      role: 'faculty',
      department: 'Computer Science',
      enrollmentNumber: '',
      employeeId: 'FAC001',
      phone: '+1234567891',
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="space-y-2">
          <p className="h-8 w-52 bg-muted rounded-md animate-pulse" />
          <p className="h-5 w-72 bg-muted rounded-md animate-pulse" />
        </div>
        <LoadingGrid count={4} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" itemClassName="h-24 rounded-md" />
        <div className="h-11 bg-muted rounded-md animate-pulse" />
        <LoadingGrid count={6} className="grid gap-3" itemClassName="h-14 rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all users across the system</p>
        </div>
        <div className="button-group">
          <PDFExportButton
            onExport={async () => {
              exportUserListPDF(filteredUsers, roleFilter === 'all' ? 'All Users' : roleFilter);
            }}
            label="Export PDF"
            variant="outline"
          />
          <Button variant="outline" onClick={exportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={() => { resetForm(); setEditingUser(null); setShowDialog(true); }}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card-elevated ui-card-pad">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <UsersIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold text-foreground">{users.filter(u => u.status !== 'deleted').length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated ui-card-pad">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <UsersIcon className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Students</p>
              <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'student' && u.status !== 'deleted').length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated ui-card-pad">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10">
              <UsersIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Faculty</p>
              <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'faculty' && u.status !== 'deleted').length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated ui-card-pad">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold text-foreground">{users.filter(u => u.role === 'college_admin' && u.status !== 'deleted').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="college_admin">College Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="card-elevated overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1.6fr_0.9fr_0.7fr_0.9fr] gap-4 bg-muted/30 border-b border-border px-[var(--table-cell-x)] py-[var(--table-cell-y)] text-sm font-medium text-muted-foreground">
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div className="text-center">Status</div>
          <div className="text-right">Actions</div>
        </div>
        {filteredUsers.length === 0 ? (
          <EmptyState title="No users found" description="Try adjusting search or role filters." className="m-4" />
        ) : (
          <VirtualList
            items={filteredUsers}
            itemHeight={73}
            height={Math.min(filteredUsers.length, 8) * 73}
            renderItem={(user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1.4fr_1.6fr_0.9fr_0.7fr_0.9fr] gap-4 items-center border-b border-border px-[var(--table-cell-x)] py-[var(--table-cell-y)] hover:bg-muted/20 cursor-pointer transition-colors duration-150"
                onClick={() => navigate(`/users/${user.id}`)}
              >
                <div className="font-medium text-foreground truncate">{user.fullName}</div>
                <div className="text-muted-foreground truncate">{user.email}</div>
                <div>
                  <Badge variant={getRoleBadgeColor(user.role)}>
                    {user.role?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status || 'active'}
                  </Badge>
                </div>
                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                  {isAdmin && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user.email)} title="Reset Password">
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          />
        )}
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Make changes to the user profile here. Click save when you\'re done.'
                : 'Fill in the details below to create a new user account.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role *</label>
                <Select value={userForm.role} onValueChange={(value) => setUserForm({ ...userForm, role: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="college_admin">College Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={userForm.phone}
                  onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Student-specific fields */}
            {userForm.role === 'student' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Enrollment Number</label>
                  <Input
                    value={userForm.enrollmentNumber}
                    onChange={(e) => setUserForm({ ...userForm, enrollmentNumber: e.target.value })}
                    placeholder="STU2024001"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    placeholder="Computer Science"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Semester</label>
                  <Input
                    type="number"
                    value={userForm.semester}
                    onChange={(e) => setUserForm({ ...userForm, semester: parseInt(e.target.value) })}
                    className="mt-1"
                    min="1"
                    max="8"
                  />
                </div>
              </div>
            )}

            {/* Faculty-specific fields */}
            {userForm.role === 'faculty' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Employee ID</label>
                  <Input
                    value={userForm.employeeId}
                    onChange={(e) => setUserForm({ ...userForm, employeeId: e.target.value })}
                    placeholder="FAC001"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={userForm.department}
                    onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                    placeholder="Computer Science"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Designation</label>
                  <Input
                    value={userForm.designation}
                    onChange={(e) => setUserForm({ ...userForm, designation: e.target.value })}
                    placeholder="Professor"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Specialization</label>
                  <Input
                    value={userForm.specialization}
                    onChange={(e) => setUserForm({ ...userForm, specialization: e.target.value })}
                    placeholder="Machine Learning"
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={editingUser ? handleUpdate : handleCreate} className="flex-1">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
              <Button variant="outline" onClick={() => { setShowDialog(false); setEditingUser(null); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Users</DialogTitle>
            <DialogDescription>Upload CSV or Excel file with user data</DialogDescription>
          </DialogHeader>
          <BulkUpload
            entityType="users"
            onImport={handleBulkImport}
            templateColumns={bulkUploadTemplate}
            sampleData={sampleBulkData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
