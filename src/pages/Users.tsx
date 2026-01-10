import { useState, useEffect } from 'react';
import { exportUserListPDF } from '@/lib/pdfExport';
import PDFExportButton from '@/components/common/PDFExportButton';
import {
  Users as UsersIcon,
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  UserPlus,
  Shield,
  Mail,
  Phone,
  Key,
  Upload,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { toast } from 'sonner';
import { sendPasswordResetEmail } from 'firebase/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { useDepartmentFilter } from '@/hooks/useDepartmentFilter';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';

export default function Users() {
  const navigate = useNavigate();
  const { permissions, isAdmin, isFaculty, isPlacementOfficer, user, loading: authLoading } = usePermissions();
  const { filterByDepartment, canManageItem, userDepartment } = useDepartmentFilter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
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
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check access permissions
    if (!isAdmin && !isFaculty && !isPlacementOfficer) {
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
  }, [user, isAdmin, isFaculty, isPlacementOfficer, navigate]);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      // Apply department filtering for faculty
      usersData = filterByDepartment(usersData);
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const userRef = await addDoc(collection(db, 'users'), {
        fullName: userForm.fullName,
        email: userForm.email,
        role: userForm.role,
        profileComplete: false,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create role-specific profile
      if (userForm.role === 'student') {
        await addDoc(collection(db, 'studentProfiles'), {
          uid: userRef.id,
          fullName: userForm.fullName,
          email: userForm.email,
          enrollmentNumber: userForm.enrollmentNumber,
          department: userForm.department,
          semester: userForm.semester,
          phone: userForm.phone,
          dateOfBirth: userForm.dateOfBirth,
          createdAt: serverTimestamp(),
        });
      } else if (userForm.role === 'faculty') {
        await addDoc(collection(db, 'facultyProfiles'), {
          uid: userRef.id,
          fullName: userForm.fullName,
          email: userForm.email,
          employeeId: userForm.employeeId,
          department: userForm.department,
          designation: userForm.designation,
          specialization: userForm.specialization,
          phone: userForm.phone,
          createdAt: serverTimestamp(),
        });
      }

      toast.success('User created successfully!');
      setShowDialog(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        fullName: userForm.fullName,
        email: userForm.email,
        role: userForm.role,
        updatedAt: serverTimestamp(),
      });

      toast.success('User updated successfully!');
      setShowDialog(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      // Soft delete - mark as deleted
      await updateDoc(doc(db, 'users', userId), {
        status: 'deleted',
        deletedAt: serverTimestamp(),
      });
      toast.success('User deleted successfully!');
      fetchUsers();
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
      // Hard delete - permanently remove
      await deleteDoc(doc(db, 'users', userId));
      toast.success('User permanently deleted!');
      fetchUsers();
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
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Failed to send password reset email');
    }
  };

  const handleBulkImport = async (data: any[]) => {
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        const userRef = await addDoc(collection(db, 'users'), {
          fullName: row.fullName || row.name,
          email: row.email,
          role: row.role || 'student',
          profileComplete: false,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Create profile based on role
        if (row.role === 'student' || !row.role) {
          await addDoc(collection(db, 'studentProfiles'), {
            uid: userRef.id,
            fullName: row.fullName || row.name,
            email: row.email,
            enrollmentNumber: row.enrollmentNumber || '',
            department: row.department || '',
            semester: parseInt(row.semester) || 1,
            phone: row.phone || '',
            dateOfBirth: row.dateOfBirth || '',
            createdAt: serverTimestamp(),
          });
        } else if (row.role === 'faculty') {
          await addDoc(collection(db, 'facultyProfiles'), {
            uid: userRef.id,
            fullName: row.fullName || row.name,
            email: row.email,
            employeeId: row.employeeId || '',
            department: row.department || '',
            designation: row.designation || '',
            specialization: row.specialization || '',
            phone: row.phone || '',
            createdAt: serverTimestamp(),
          });
        }

        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`${row.email}: ${(error as Error).message}`);
      }
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
      fullName: user.fullName,
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

  const filteredUsers = users.filter(u => {
    if (u.status === 'deleted') return false;
    
    // Non-admins can only see students
    if (!isAdmin && u.role !== 'student') {
      return false;
    }

    const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'default';
      case 'faculty': return 'secondary';
      case 'college_admin': return 'destructive';
      case 'super_admin': return 'destructive';
      case 'placement_officer': return 'outline';
      case 'recruiter': return 'outline';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all users across the system</p>
        </div>
        <div className="flex gap-2">
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
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-elevated p-5">
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
        <div className="card-elevated p-5">
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
        <div className="card-elevated p-5">
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
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <Shield className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold text-foreground">{users.filter(u => (u.role === 'college_admin' || u.role === 'super_admin') && u.status !== 'deleted').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Students</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="college_admin">College Admins</SelectItem>
            <SelectItem value="super_admin">Super Admins</SelectItem>
            <SelectItem value="placement_officer">Placement Officers</SelectItem>
            <SelectItem value="recruiter">Recruiters</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <td className="p-4 font-medium text-foreground">{user.fullName}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant={getRoleBadgeColor(user.role)}>
                        {user.role?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status || 'active'}
                      </Badge>
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleResetPassword(user.email)} title="Reset Password">
                            <Key className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>{editingUser ? 'Update user details' : 'Create a new user account'}</DialogDescription>
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
                    <SelectItem value="placement_officer">Placement Officer</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
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
