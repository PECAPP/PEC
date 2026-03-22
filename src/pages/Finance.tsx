import { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Download,
  ExternalLink,
  Settings,
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
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
} from '@/lib/dataClient';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';

export default function Finance() {
  const navigate = useNavigate();
  const { isAdmin, user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    amount: 0,
    description: '',
    dueDate: '',
    category: 'tuition',
    status: 'pending',
  });
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleBulkImport = async (data: any[]) => {
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        await addDoc(collection(({} as any), 'feeRecords'), {
          studentId: row.studentId,
          amount: parseFloat(row.amount),
          description: row.description,
          dueDate: row.dueDate, // Assume YYYY-MM-DD
          category: row.category || 'tuition',
          status: row.status || 'pending',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`${row.studentId}: ${(error as Error).message}`);
      }
    }

    await fetchData();
    return { success: successCount, failed: failCount, errors };
  };

  const exportFees = () => {
    const exportData = feeRecords.map(f => ({
      studentId: f.studentId,
      amount: f.amount,
      description: f.description,
      dueDate: f.dueDate,
      category: f.category,
      status: f.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Fees');
    XLSX.writeFile(workbook, `fees_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Fee records exported successfully!');
  };

  const bulkUploadTemplate = [
    'studentId',
    'amount',
    'description',
    'dueDate',
    'category',
    'status'
  ];

  const sampleBulkData = [
    {
      studentId: 'STU001',
      amount: '50000',
      description: 'Semester 1 Tuition',
      dueDate: '2024-12-31',
      category: 'tuition',
      status: 'pending'
    }
  ];

  useEffect(() => {
    if (authLoading) return; // Wait for ({} as any) to load
    
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, user, isAdmin, navigate]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch fee records
      let feeSnapshot;
      if (isAdmin) {
        feeSnapshot = await getDocs(collection(({} as any), 'feeRecords'));
      } else {
        const q = query(collection(({} as any), 'feeRecords'), where('studentId', '==', user.uid));
        feeSnapshot = await getDocs(q);
      }
      const fees = feeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeeRecords(fees);

      // Fetch students for dropdown (only for admin)
      if (isAdmin) {
        // Fetch students filtered by organization
        const orgId = user?.organizationId;
        const usersQuery = orgId
          ? query(collection(({} as any), 'users'),
                  where('organizationId', '==', orgId),
                  where('role', '==', 'student'))
          : query(collection(({} as any), 'users'), where('role', '==', 'student'));
        const usersSnapshot = await getDocs(usersQuery);
        const studentUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudents(studentUsers);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await addDoc(collection(({} as any), 'feeRecords'), {
        ...feeForm,
        createdAt: serverTimestamp(),
      });
      toast.success('Fee record created successfully!');
      setShowDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating fee:', error);
      toast.error('Failed to create fee record');
    }
  };

  const handleUpdate = async () => {
    if (!editingFee) return;
    try {
      await updateDoc(doc(({} as any), 'feeRecords', editingFee.id), {
        ...feeForm,
        updatedAt: serverTimestamp(),
      });
      toast.success('Fee record updated successfully!');
      setShowDialog(false);
      setEditingFee(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating fee:', error);
      toast.error('Failed to update fee record');
    }
  };

  const handleDelete = async (feeId: string) => {
    if (!confirm('Are you sure you want to delete this fee record?')) return;
    try {
      await deleteDoc(doc(({} as any), 'feeRecords', feeId));
      toast.success('Fee record deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting fee:', error);
      toast.error('Failed to delete fee record');
    }
  };

  const resetForm = () => {
    setFeeForm({
      studentId: isAdmin ? '' : (user?.uid || ''),
      amount: 0,
      description: '',
      dueDate: new Date().toISOString().split('T')[0],
      category: 'tuition',
      status: 'pending',
    });
  };

  const openEditDialog = (fee: any) => {
    setEditingFee(fee);
    setFeeForm({
      studentId: fee.studentId,
      amount: fee.amount,
      description: fee.description,
      dueDate: fee.dueDate,
      category: fee.category,
      status: fee.status,
    });
    setShowDialog(true);
  };

  const filteredFees = feeRecords.filter(f => 
    f.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPending = feeRecords.filter(f => f.status === 'pending').reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalPaid = feeRecords.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading finance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance Management</h1>
          <p className="text-muted-foreground mt-1">Manage student fees and payments</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button 
              variant="outline" 
              onClick={() => navigate('/admin/payment-settings')} 
              className="flex-1 lg:flex-none"
              title="Configure payment method (Razorpay or UPI)"
            >
              <Settings className="w-4 h-4 mr-2" />
              Payment Settings
            </Button>
          )}
          <Button variant="outline" onClick={exportFees} className="flex-1 lg:flex-none">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="flex-1 lg:flex-none">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={() => { resetForm(); setEditingFee(null); setShowDialog(true); }} className="flex-1 lg:flex-none">
                <Plus className="w-4 h-4 mr-2" />
                Add Fee Record
              </Button>
            </>
          )}
          {!isAdmin && user && (
            <Button onClick={() => { resetForm(); setEditingFee(null); setShowDialog(true); }} className="flex-1 lg:flex-none">
              <Plus className="w-4 h-4 mr-2" />
              Pay Fee for Semester
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-2xl font-bold text-foreground">{feeRecords.length}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-bold text-success">₹{totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/10">
              <Clock className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pending</p>
              <p className="text-2xl font-bold text-destructive">₹{totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Count</p>
              <p className="text-2xl font-bold text-foreground">{feeRecords.filter(f => f.status === 'pending').length}</p>
            </div>
          </div>
        </div>
      </div>

      <Input
        placeholder="Search by description or student ID..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Student ID</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Due Date</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFees.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No fee records found</td></tr>
              ) : (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-muted/20">
                    <td className="p-4 font-medium text-foreground">{fee.studentId}</td>
                    <td className="p-4 text-foreground">{fee.description}</td>
                    <td className="p-4 text-muted-foreground capitalize">{fee.category}</td>
                    <td className="p-4 text-center font-medium">₹{fee.amount?.toLocaleString()}</td>
                    <td className="p-4 text-center text-muted-foreground">
                      {fee.dueDate?.seconds 
                        ? new Date(fee.dueDate.seconds * 1000).toLocaleDateString() 
                        : fee.dueDate}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={fee.status === 'paid' ? 'default' : 'destructive'}>{fee.status}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/finance/${fee.id}`)}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(fee)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(fee.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingFee ? 'Edit Fee Record' : 'Create Fee Record'}</DialogTitle>
            <DialogDescription>{editingFee ? 'Update fee details' : 'Add a new fee record'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {isAdmin ? (
              <div>
                <label className="text-sm font-medium">Student *</label>
                <Select value={feeForm.studentId} onValueChange={(value) => setFeeForm({ ...feeForm, studentId: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.fullName} ({s.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="text-sm font-medium">Paying for: {user?.fullName || 'My Profile'}</p>
                <p className="text-xs text-muted-foreground">Student ID: {user?.uid}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Input 
                value={feeForm.description} 
                onChange={(e) => setFeeForm({ ...feeForm, description: e.target.value })} 
                placeholder="Tuition Fee - Fall 2024" 
                className="mt-1" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Amount *</label>
                <Input 
                  type="number" 
                  value={feeForm.amount} 
                  onChange={(e) => setFeeForm({ ...feeForm, amount: parseInt(e.target.value) })} 
                  placeholder="50000" 
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input 
                  type="date" 
                  value={feeForm.dueDate} 
                  onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })} 
                  className="mt-1" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={feeForm.category} 
                  onValueChange={(value) => setFeeForm({ ...feeForm, category: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition Fee</SelectItem>
                    <SelectItem value="hostel">Hostel Fee</SelectItem>
                    <SelectItem value="exam">Exam Fee</SelectItem>
                    <SelectItem value="library">Library Fee</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Semester *</label>
                <Select
                  value={feeForm.description?.includes('Semester') ? feeForm.description.split(' - ')[1] : ''}
                  onValueChange={(value) => {
                    setFeeForm({ 
                      ...feeForm, 
                      description: `${feeForm.category.charAt(0).toUpperCase() + feeForm.category.slice(1)} Fee - ${value}` 
                    });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => (
                      <SelectItem key={i + 1} value={`Semester ${i + 1}`}>Semester {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isAdmin && (
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={feeForm.status} onValueChange={(value) => setFeeForm({ ...feeForm, status: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={editingFee ? handleUpdate : handleCreate}>
              {editingFee ? 'Update Record' : (isAdmin ? 'Create Record' : 'Initiate Payment')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Fees</DialogTitle>
            <DialogDescription>Upload CSV or Excel file with fee records</DialogDescription>
          </DialogHeader>
          <BulkUpload
            entityType="fees"
            onImport={handleBulkImport}
            templateColumns={bulkUploadTemplate}
            sampleData={sampleBulkData}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
