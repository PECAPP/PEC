import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  orderBy,
} from '@/lib/dataClient';
import { Leave, LeaveBalance, LeaveType as LeaveTypeType } from '../types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function LeaveManagement() {
  const { user } = useAuth();
  const { role } = usePermissions();
  const isAdmin = role === 'college_admin';
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeType[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState('');

  const [newLeave, setNewLeave] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: '',
  });

  // Fetch leave types
  useEffect(() => {
    const leaveTypesRef = collection(({} as any), 'leaveTypes');
    const unsubscribe = onSnapshot(
      query(leaveTypesRef, orderBy('name')),
      (snapshot) => {
        const leaveTypesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LeaveTypeType[];
        setLeaveTypes(leaveTypesData);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Fetch user's leave balance
  useEffect(() => {
    if (!user) return;

    const balanceRef = collection(({} as any), 'leaveBalance');
    const unsubscribe = onSnapshot(
      query(balanceRef, where('userId', '==', user.uid)),
      (snapshot) => {
        const balance: Record<string, number> = {};
        snapshot.docs.forEach((doc) => {
          balance[doc.data().leaveTypeId] = doc.data().balance;
        });
        setLeaveBalance(balance);
      }
    );

    return unsubscribe;
  }, [user]);

  // Fetch user's leaves
  useEffect(() => {
    if (!user) return;

    const leavesRef = collection(({} as any), 'leaves');
    let q;

    if (isAdmin) {
      // Admins see all leaves
      q = query(leavesRef, orderBy('startDate', 'desc'));
    } else {
      // Users see only their leaves
      q = query(leavesRef, where('userId', '==', user.uid), orderBy('startDate', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leavesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Leave[];
      setLeaves(leavesData);
    });

    return unsubscribe;
  }, [user, isAdmin]);

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleApplyLeave = async () => {
    if (!user) {
      toast.error('Please log in to apply for leave');
      return;
    }

    if (!newLeave.startDate || !newLeave.endDate || !newLeave.leaveType || !newLeave.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const selectedLeaveTypeObj = leaveTypes.find((lt) => lt.id === newLeave.leaveType);
      if (!selectedLeaveTypeObj) {
        toast.error('Invalid leave type selected');
        return;
      }

      const days = calculateDays(newLeave.startDate, newLeave.endDate);
      const balance = leaveBalance[newLeave.leaveType] || selectedLeaveTypeObj.defaultDays;

      if (days > balance) {
        toast.error(
          `Not enough balance. You have ${balance} days available.`
        );
        return;
      }

      await addDoc(collection(({} as any), 'leaves'), {
        userId: user.uid,
        userName: user.fullName || user.email,
        startDate: new Date(newLeave.startDate),
        endDate: new Date(newLeave.endDate),
        leaveTypeId: newLeave.leaveType,
        leaveType: selectedLeaveTypeObj.name,
        reason: newLeave.reason,
        days,
        status: 'pending',
        createdAt: new Date(),
      });

      toast.success('Leave request submitted successfully');
      setNewLeave({
        startDate: '',
        endDate: '',
        leaveType: '',
        reason: '',
      });
      setOpenDialog(false);
    } catch (error) {
      console.error('Error applying leave:', error);
      toast.error('Failed to apply for leave');
    }
  };

  const handleApproveLeave = async (leaveId: string) => {
    try {
      const leave = leaves.find((l) => l.id === leaveId);
      if (!leave) return;

      // Update leave status
      await updateDoc(doc(({} as any), 'leaves', leaveId), {
        status: 'approved',
      });

      // Update leave balance
      const balanceRef = collection(({} as any), 'leaveBalance');
      const balanceDocs = await query(
        balanceRef,
        where('userId', '==', leave.userId),
        where('leaveTypeId', '==', leave.leaveTypeId)
      );

      // Just approve the leave
      toast.success('Leave approved successfully');
    } catch (error) {
      console.error('Error approving leave:', error);
      toast.error('Failed to approve leave');
    }
  };

  const handleRejectLeave = async (leaveId: string) => {
    try {
      await updateDoc(doc(({} as any), 'leaves', leaveId), {
        status: 'rejected',
      });
      toast.success('Leave rejected');
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error('Failed to reject leave');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const approvedLeaves = leaves.filter((l) => l.status === 'approved');

  return (
    <div className="space-y-6">
      {/* ADMIN VIEW */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Leave Management</h1>
          </div>

          {/* Pending Approvals - Admin Only */}
          {pendingLeaves.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Pending Approvals ({pendingLeaves.length})
              </h3>
              <div className="space-y-3">
                {pendingLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded"
                  >
                    <div>
                      <p className="font-medium">{leave.userName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {leave.leaveType} - {leave.days} days
                      </p>
                      <p className="text-sm">
                        {new Date(leave.startDate).toLocaleDateString()} to{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">{leave.reason}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveLeave(leave.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectLeave(leave.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Leaves for Admin */}
          <div>
            <h2 className="text-xl font-bold mb-4">All Leave Requests</h2>
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className={`border rounded-lg p-4 ${
                    leave.status === 'approved'
                      ? 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-700'
                      : leave.status === 'rejected'
                      ? 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700'
                      : 'border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{leave.userName}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            leave.status === 'approved'
                              ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                              : leave.status === 'rejected'
                              ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                              : 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                          }`}
                        >
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {leave.leaveType} - {leave.days} days
                      </p>
                      <p className="text-sm mt-2">
                        {new Date(leave.startDate).toLocaleDateString()} to{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-2">{leave.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FACULTY/USER VIEW */}
      {!isAdmin && (
        <div className="space-y-6">
          {/* Faculty Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Leave Management</h1>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Leave Type
                    </label>
                    <select
                      value={newLeave.leaveType}
                      onChange={(e) => {
                        setNewLeave({ ...newLeave, leaveType: e.target.value });
                        setSelectedLeaveType(e.target.value);
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} ({leaveBalance[type.id] || type.defaultDays} days available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newLeave.startDate}
                        onChange={(e) =>
                          setNewLeave({
                            ...newLeave,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={newLeave.endDate}
                        onChange={(e) =>
                          setNewLeave({
                            ...newLeave,
                            endDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  {newLeave.startDate && newLeave.endDate && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium">
                        Days: {calculateDays(newLeave.startDate, newLeave.endDate)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Reason
                    </label>
                    <textarea
                      value={newLeave.reason}
                      onChange={(e) =>
                        setNewLeave({ ...newLeave, reason: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Reason for leave..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleApplyLeave} className="w-full">
                    Submit Leave Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Leave Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {leaveTypes.map((type) => (
              <div
                key={type.id}
                className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {type.name}
                </p>
                <p className="text-2xl font-bold text-primary">
                  {leaveBalance[type.id] !== undefined
                    ? leaveBalance[type.id]
                    : type.defaultDays}
                </p>
                <p className="text-xs text-gray-500">days available</p>
              </div>
            ))}
          </div>

          {/* Leave History */}
          <div>
            <h2 className="text-xl font-bold mb-4">Leave History</h2>
            <div className="space-y-3">
              {leaves.map((leave) => (
                <div
                  key={leave.id}
                  className={`border rounded-lg p-4 ${
                    leave.status === 'approved'
                      ? 'border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-700'
                      : leave.status === 'rejected'
                      ? 'border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-700'
                      : 'border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{leave.leaveType}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            leave.status === 'approved'
                              ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                              : leave.status === 'rejected'
                              ? 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                              : 'bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200'
                          }`}
                        >
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(leave.startDate).toLocaleDateString()} to{' '}
                        {new Date(leave.endDate).toLocaleDateString()} ({leave.days} days)
                      </p>
                      <p className="text-sm mt-2">{leave.reason}</p>
                    </div>
                  </div>
                </div>
              ))}
              {leaves.length === 0 && (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  No leave records
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
