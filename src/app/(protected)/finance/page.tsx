'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  FileSpreadsheet,
  Filter,
  Search,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  UtensilsCrossed,
  Home,
  BookOpen,
  Loader2,
  ChevronDown,
  X,
  Plus,
  RefreshCw,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────���──────────

interface FeeRecord {
  id: string;
  studentId: string;
  description: string;
  category: string;
  amount: number;
  lateFeeAmount: number;
  lateFeeApplied: boolean;
  dueDate: string;
  status: string;
  semester?: string;
  month?: string;
  paidDate?: string;
  paymentTransactionId?: string;
  student?: { id: string; name: string; email: string };
  transactions?: Transaction[];
}

interface Transaction {
  id: string;
  studentId: string;
  feeRecordId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  gatewayTxnId?: string;
  receiptNo: string;
  notes?: string;
  createdAt: string;
  feeRecord?: { category: string; description: string; semester?: string; month?: string };
  student?: { id: string; name: string; email: string; studentProfile?: { enrollmentNumber?: string; department?: string } };
}

interface Summary {
  totalPending: number;
  totalPaid: number;
  overdue: number;
  byCategory: Record<string, { pending: number; paid: number }>;
}

// ─── Constants ────────────────────────────────────────────────────────────��───

const CATEGORIES = [
  { value: 'college', label: 'College Fee', icon: Building2, color: 'text-violet-600', bg: 'bg-violet-500/10 border-violet-500/20' },
  { value: 'mess', label: 'Mess Fee', icon: UtensilsCrossed, color: 'text-orange-600', bg: 'bg-orange-500/10 border-orange-500/20' },
  { value: 'hostel', label: 'Hostel Fee', icon: Home, color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/20' },
  { value: 'exam', label: 'Exam Fee', icon: BookOpen, color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/20' },
  { value: 'library', label: 'Library Fee', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { value: 'other', label: 'Other', icon: Wallet, color: 'text-gray-600', bg: 'bg-gray-500/10 border-gray-500/20' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/15 text-amber-600 border-amber-500/20', icon: Clock },
  paid: { label: 'Paid', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-500/15 text-red-600 border-red-500/20', icon: XCircle },
  waived: { label: 'Waived', color: 'bg-gray-500/15 text-gray-600 border-gray-500/20', icon: ShieldCheck },
};

function fmt(n: number) {
  return (n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}

// ─── FeeCard ──────────────────────────────────────────────────────────────────

function FeeCard({ fee, onPay, onMarkPaid, isAdmin }: {
  fee: FeeRecord;
  onPay: (fee: FeeRecord) => void;
  onMarkPaid: (feeId: string) => void;
  isAdmin: boolean;
}) {
  const cat = CATEGORIES.find((c) => c.value === fee.category) ?? CATEGORIES[5];
  const Icon = cat.icon;
  const overdue = fee.status === 'pending' && isOverdue(fee.dueDate);
  const total = fee.amount + (fee.lateFeeAmount ?? 0);
  const StatusIcon = STATUS_CONFIG[fee.status]?.icon ?? Clock;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative bg-card border rounded-xl p-4 space-y-3 transition-all',
        overdue ? 'border-red-300 dark:border-red-800' : 'border-border hover:border-primary/30',
        fee.status === 'paid' && 'opacity-80',
      )}
    >
      {overdue && (
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-300 text-[10px]">
            <AlertTriangle className="w-3 h-3 mr-1" /> OVERDUE
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={cn('p-2.5 rounded-lg border', cat.bg)}>
          <Icon className={cn('w-4 h-4', cat.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm leading-tight">{fee.description}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className={cn('text-[10px] h-4', cat.bg, cat.color)}>
              {cat.label}
            </Badge>
            {fee.semester && <span className="text-[10px] text-muted-foreground">{fee.semester}</span>}
            {fee.month && <span className="text-[10px] text-muted-foreground">{fee.month}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-0.5 text-lg font-bold">
            <IndianRupee className="w-4 h-4" />
            {fmt(total)}
          </div>
          {fee.lateFeeAmount > 0 && (
            <p className="text-[10px] text-red-500">incl. ₹{fmt(fee.lateFeeAmount)} late fee</p>
          )}
          <p className={cn('text-xs mt-0.5', overdue ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
            Due: {new Date(fee.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn('text-xs', STATUS_CONFIG[fee.status]?.color ?? '')}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {STATUS_CONFIG[fee.status]?.label ?? fee.status}
          </Badge>
        </div>
      </div>

      {fee.status === 'paid' && fee.paidDate && (
        <p className="text-[10px] text-emerald-600 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Paid on {new Date(fee.paidDate).toLocaleDateString('en-IN')}
          {fee.paymentTransactionId && ` · ${fee.paymentTransactionId}`}
        </p>
      )}

      {fee.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          {!isAdmin ? (
            <Button size="sm" className="flex-1 h-8" onClick={() => onPay(fee)}>
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              Pay Now
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => onMarkPaid(fee.id)}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Mark Paid
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── PaymentDialog ────────────────────────────────────────────────────────────

function PaymentDialog({ fee, open, onClose, onSuccess }: {
  fee: FeeRecord | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');
  const [receiptNo, setReceiptNo] = useState('');

  useEffect(() => { if (open) { setStep('form'); setUpiId(''); setMethod('upi'); } }, [open]);

  if (!fee) return null;
  const total = fee.amount + (fee.lateFeeAmount ?? 0);

  const handlePay = async () => {
    if (method === 'upi' && !upiId.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }
    setLoading(true);
    setStep('processing');
    try {
      // Simulate gateway delay
      await new Promise((r) => setTimeout(r, 1800));
      const res = await api.post('/finance/pay', {
        feeRecordId: fee.id,
        paymentMethod: method,
        gatewayTxnId: `SIM-${method.toUpperCase()}-${Date.now()}`,
        notes: upiId ? `UPI ID: ${upiId}` : undefined,
      });
      setReceiptNo((res as any).data?.transaction?.receiptNo ?? '');
      setStep('done');
      onSuccess();
    } catch {
      toast.error('Payment failed. Please try again.');
      setStep('form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Pay Fee
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Fee summary */}
              <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
                <p className="text-sm font-medium">{fee.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Base Amount</span>
                  <span>₹{fmt(fee.amount)}</span>
                </div>
                {fee.lateFeeAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Late Fee</span>
                    <span>+₹{fmt(fee.lateFeeAmount)}</span>
                  </div>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary text-lg">₹{fmt(total)}</span>
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['upi', 'neft', 'dd'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={cn(
                        'py-2 px-3 rounded-lg border text-sm font-medium transition-colors',
                        method === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted',
                      )}
                    >
                      {m.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {method === 'upi' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium">UPI ID</label>
                  <Input
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600">
                  This is a simulated payment in test mode. No real money will be charged.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button className="flex-1" onClick={handlePay}>
                  Pay ₹{fmt(total)}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="font-medium">Processing Payment…</p>
              <p className="text-sm text-muted-foreground">Please wait, do not close this window</p>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-emerald-600">Payment Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">₹{fmt(total)} paid successfully</p>
                {receiptNo && (
                  <p className="text-xs text-muted-foreground mt-1">Receipt: <span className="font-mono font-medium">{receiptNo}</span></p>
                )}
              </div>
              <Button onClick={onClose} className="w-full">Done</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ─── TransactionTable ─────────────────────────────────────────────────────────

function TransactionTable({ transactions, loading, isAdmin, onDownloadReceipt }: {
  transactions: Transaction[];
  loading: boolean;
  isAdmin: boolean;
  onDownloadReceipt: (txn: Transaction) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-muted-foreground">
        <Receipt className="w-10 h-10" />
        <p className="font-medium">No transactions found</p>
        <p className="text-sm">Transactions will appear here after payments are made</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Receipt No.</th>
            {isAdmin && <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>}
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Method</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, idx) => {
            const cat = CATEGORIES.find((c) => c.value === txn.feeRecord?.category) ?? CATEGORIES[5];
            const statusCfg = STATUS_CONFIG[txn.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;
            return (
              <motion.tr
                key={txn.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.02 }}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-primary">{txn.receiptNo}</td>
                {isAdmin && (
                  <td className="px-4 py-3 text-xs">
                    <p className="font-medium">{txn.student?.name}</p>
                    <p className="text-muted-foreground">{txn.student?.email}</p>
                  </td>
                )}
                <td className="px-4 py-3 max-w-[160px]">
                  <p className="truncate">{txn.feeRecord?.description ?? '—'}</p>
                  {(txn.feeRecord?.semester ?? txn.feeRecord?.month) && (
                    <p className="text-xs text-muted-foreground">{txn.feeRecord?.semester ?? txn.feeRecord?.month}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn('text-[10px]', cat.bg, cat.color)}>
                    {cat.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-semibold">
                  <span className="flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />
                    {fmt(txn.amount)}
                  </span>
                </td>
                <td className="px-4 py-3 uppercase text-xs text-muted-foreground">{txn.paymentMethod}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn('text-[10px]', statusCfg.color)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusCfg.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  {txn.status === 'success' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => onDownloadReceipt(txn)}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── AdminCreateFeeDialog ─────────────────────────────────────────────────────

function AdminCreateFeeDialog({ open, onClose, onSuccess }: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [form, setForm] = useState({ studentId: '', description: '', category: 'college', amount: '', dueDate: '', semester: '', month: '' });
  const [bulk, setBulk] = useState({ category: 'mess', amount: '', month: '', dueDate: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.description || !form.amount || !form.dueDate || !form.category) {
      toast.error('Fill all required fields'); return;
    }
    setLoading(true);
    try {
      await api.post('/finance/fees', { ...form, amount: parseFloat(form.amount) });
      toast.success('Fee created');
      onSuccess(); onClose();
    } catch { toast.error('Failed to create fee'); }
    finally { setLoading(false); }
  };

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulk.amount || !bulk.month || !bulk.dueDate || !bulk.description) {
      toast.error('Fill all fields'); return;
    }
    setLoading(true);
    try {
      const res = await api.post('/finance/fees/bulk-monthly', { ...bulk, amount: parseFloat(bulk.amount) });
      const { created, skipped } = (res as any).data ?? {};
      toast.success(`Created ${created} fees (${skipped} skipped – already exists)`);
      onSuccess(); onClose();
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Fee Record</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <Button size="sm" variant={mode === 'single' ? 'default' : 'outline'} onClick={() => setMode('single')}>Single Student</Button>
          <Button size="sm" variant={mode === 'bulk' ? 'default' : 'outline'} onClick={() => setMode('bulk')}>Bulk (All Students)</Button>
        </div>

        {mode === 'single' ? (
          <form onSubmit={handleSingle} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Student ID *</label>
              <Input placeholder="Student UUID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <Input placeholder="e.g. Tuition Fee Even Sem 2024-25" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Category *</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Amount (₹) *</label>
                <Input type="number" min="0" placeholder="42500" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Due Date *</label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Semester</label>
                <Input placeholder="2024-25 Even" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}Create</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBulk} className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              This will create fee records for ALL students. Existing records for the same category+month are skipped.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Category *</label>
                <Select value={bulk.category} onValueChange={(v) => setBulk({ ...bulk, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Month (YYYY-MM) *</label>
                <Input type="month" value={bulk.month} onChange={(e) => setBulk({ ...bulk, month: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Amount (₹) *</label>
                <Input type="number" min="0" placeholder="3800" value={bulk.amount} onChange={(e) => setBulk({ ...bulk, amount: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Due Date *</label>
                <Input type="date" value={bulk.dueDate} onChange={(e) => setBulk({ ...bulk, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <Input placeholder="Mess Fee – March 2025" value={bulk.description} onChange={(e) => setBulk({ ...bulk, description: e.target.value })} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}Create for All</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const { permissions, loading: permLoading } = usePermissions();
  const isAdmin = permissions?.isAdmin || (permissions as any)?.role === 'college_admin';
  const [tab, setTab] = useState('overview');
  const [feeCategory, setFeeCategory] = useState('');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [feesLoading, setFeesLoading] = useState(true);
  const [txnsLoading, setTxnsLoading] = useState(false);
  const [payingFee, setPayingFee] = useState<FeeRecord | null>(null);
  const [createFeeOpen, setCreateFeeOpen] = useState(false);

  // Transaction filters
  const [txnCat, setTxnCat] = useState('');
  const [txnStatus, setTxnStatus] = useState('');
  const [txnFrom, setTxnFrom] = useState('');
  const [txnTo, setTxnTo] = useState('');
  const [txnSearch, setTxnSearch] = useState('');

  const adminRole = !permLoading && (permissions as any)?.role === 'college_admin';

  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get('/finance/summary');
      const raw = (res as any).data;
      setSummary(raw?.totalPending !== undefined ? raw : raw?.data ?? null);
    } catch { /* silent */ }
  }, []);

  const fetchFees = useCallback(async () => {
    setFeesLoading(true);
    try {
      const params: Record<string, any> = { limit: 100 };
      if (feeCategory) params.category = feeCategory;
      const res = await api.get(`/finance/fees?${new URLSearchParams(params)}`);
      setFees((res as any).data ?? []);
    } catch { toast.error('Failed to load fees'); }
    finally { setFeesLoading(false); }
  }, [feeCategory]);

  const fetchTransactions = useCallback(async () => {
    setTxnsLoading(true);
    try {
      const params: Record<string, any> = { limit: 100 };
      if (txnCat) params.category = txnCat;
      if (txnStatus) params.status = txnStatus;
      if (txnFrom) params.from = txnFrom;
      if (txnTo) params.to = txnTo;
      const res = await api.get(`/finance/transactions?${new URLSearchParams(params)}`);
      setTransactions((res as any).data ?? []);
    } catch { toast.error('Failed to load transactions'); }
    finally { setTxnsLoading(false); }
  }, [txnCat, txnStatus, txnFrom, txnTo]);

  useEffect(() => {
    if (!permLoading) {
      fetchSummary();
      fetchFees();
    }
  }, [permLoading, fetchSummary, fetchFees]);

  useEffect(() => {
    if (tab === 'transactions' && !permLoading) fetchTransactions();
  }, [tab, permLoading, fetchTransactions]);

  const handleMarkPaid = async (feeId: string) => {
    try {
      await api.post(`/finance/fees/${feeId}/mark-paid`, {});
      toast.success('Fee marked as paid');
      fetchFees(); fetchSummary();
    } catch { toast.error('Failed to mark paid'); }
  };

  const handleDownloadReceipt = async (txn: Transaction) => {
    try {
      // Fetch full transaction details for the PDF
      const res = await api.get(`/finance/transactions/${txn.id}`);
      const full = (res as any).data;
      const { exportFeeReceipt } = await import('@/lib/pdfExport');
      exportFeeReceipt(full);
    } catch {
      toast.error('Failed to generate receipt');
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) { toast.error('No transactions to export'); return; }
    const headers = ['Receipt No', 'Description', 'Category', 'Amount', 'Method', 'Status', 'Date'];
    const rows = transactions.map((t) => [
      t.receiptNo,
      t.feeRecord?.description ?? '',
      t.feeRecord?.category ?? '',
      t.amount,
      t.paymentMethod,
      t.status,
      new Date(t.createdAt).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'finance_transactions.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const pendingFees = fees.filter((f) => f.status === 'pending');
  const paidFees = fees.filter((f) => f.status === 'paid');
  const filteredByCategory = feeCategory ? fees.filter((f) => f.category === feeCategory) : fees;

  const filteredTxns = transactions.filter((t) =>
    !txnSearch ||
    t.receiptNo.toLowerCase().includes(txnSearch.toLowerCase()) ||
    (t.feeRecord?.description ?? '').toLowerCase().includes(txnSearch.toLowerCase()),
  );

  if (permLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Finance</h1>
                <p className="text-xs text-muted-foreground">Fees, Payments & Transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { fetchFees(); fetchSummary(); }}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              {adminRole && (
                <Button size="sm" onClick={() => setCreateFeeOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Create Fee
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="h-9">
                <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
                <TabsTrigger value="fees" className="text-sm">
                  My Fees
                  {pendingFees.length > 0 && (
                    <span className="ml-1.5 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                      {pendingFees.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="transactions" className="text-sm">Transactions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">

          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Pending',
                    value: summary ? `₹${fmt(summary.totalPending)}` : '—',
                    icon: Clock,
                    color: 'text-amber-600',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                  },
                  {
                    label: 'Total Paid',
                    value: summary ? `₹${fmt(summary.totalPaid)}` : '—',
                    icon: CheckCircle2,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                  },
                  {
                    label: 'Overdue',
                    value: summary ? `${summary.overdue} fee${summary.overdue !== 1 ? 's' : ''}` : '—',
                    icon: AlertTriangle,
                    color: 'text-red-600',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                  },
                  {
                    label: 'Total Paid Fees',
                    value: paidFees.length.toString(),
                    icon: Receipt,
                    color: 'text-blue-600',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                  },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className={cn('p-4 rounded-xl border bg-card flex items-start gap-3', card.border)}>
                      <div className={cn('p-2.5 rounded-lg', card.bg)}>
                        <Icon className={cn('w-5 h-5', card.color)} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{card.label}</p>
                        <p className={cn('text-xl font-bold mt-0.5', card.color)}>{card.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Category breakdown */}
              {summary && Object.keys(summary.byCategory).length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">By Category</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(summary.byCategory).map(([cat, vals]) => {
                      const catCfg = CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[5];
                      const Icon = catCfg.icon;
                      const total = vals.pending + vals.paid;
                      const paidPct = total > 0 ? Math.round((vals.paid / total) * 100) : 0;
                      return (
                        <div key={cat} className={cn('p-4 rounded-xl border bg-card', catCfg.bg)}>
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className={cn('w-4 h-4', catCfg.color)} />
                            <span className={cn('text-sm font-semibold', catCfg.color)}>{catCfg.label}</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Paid</span>
                              <span className="font-medium text-emerald-600">₹{fmt(vals.paid)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Pending</span>
                              <span className="font-medium text-amber-600">₹{fmt(vals.pending)}</span>
                            </div>
                            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${paidPct}%` }}
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                            <p className="text-[10px] text-right text-muted-foreground">{paidPct}% paid</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Pending fees preview */}
              {pendingFees.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pending Fees</h2>
                    <Button size="sm" variant="link" className="text-xs h-auto p-0" onClick={() => setTab('fees')}>
                      View all →
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pendingFees.slice(0, 3).map((fee) => (
                      <FeeCard key={fee.id} fee={fee} onPay={setPayingFee} onMarkPaid={handleMarkPaid} isAdmin={adminRole} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── FEES TAB ── */}
          {tab === 'fees' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => setFeeCategory('')}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
                    !feeCategory ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted')}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setFeeCategory(feeCategory === cat.value ? '' : cat.value)}
                      className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
                        feeCategory === cat.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-muted')}
                    >
                      <Icon className="w-3 h-3" /> {cat.label}
                    </button>
                  );
                })}
              </div>

              {feesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredByCategory.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-14 text-muted-foreground">
                  <Wallet className="w-10 h-10" />
                  <p className="font-medium">No fees found</p>
                </div>
              ) : (
                <>
                  {/* Pending section */}
                  {filteredByCategory.filter((f) => f.status === 'pending').length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500" /> Pending
                        <Badge className="bg-amber-500 text-white">{filteredByCategory.filter((f) => f.status === 'pending').length}</Badge>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredByCategory.filter((f) => f.status === 'pending').map((fee) => (
                          <FeeCard key={fee.id} fee={fee} onPay={setPayingFee} onMarkPaid={handleMarkPaid} isAdmin={adminRole} />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Paid section */}
                  {filteredByCategory.filter((f) => f.status === 'paid').length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Paid
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredByCategory.filter((f) => f.status === 'paid').map((fee) => (
                          <FeeCard key={fee.id} fee={fee} onPay={setPayingFee} onMarkPaid={handleMarkPaid} isAdmin={adminRole} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── TRANSACTIONS TAB ── */}
          {tab === 'transactions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-3 p-3 bg-muted/30 border border-border rounded-lg">
                <div className="relative flex-1 min-w-40">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search receipt, description…"
                    className="pl-8 h-8 text-xs"
                    value={txnSearch}
                    onChange={(e) => setTxnSearch(e.target.value)}
                  />
                </div>
                <Select value={txnCat || '__all__'} onValueChange={(v) => setTxnCat(v === '__all__' ? '' : v)}>
                  <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={txnStatus || '__all__'} onValueChange={(v) => setTxnStatus(v === '__all__' ? '' : v)}>
                  <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" className="h-8 text-xs w-36" value={txnFrom} onChange={(e) => setTxnFrom(e.target.value)} />
                <Input type="date" className="h-8 text-xs w-36" value={txnTo} onChange={(e) => setTxnTo(e.target.value)} />
                {(txnCat || txnStatus || txnFrom || txnTo || txnSearch) && (
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => { setTxnCat(''); setTxnStatus(''); setTxnFrom(''); setTxnTo(''); setTxnSearch(''); }}>
                    <X className="w-3 h-3 mr-1" /> Clear
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-8 text-xs ml-auto" onClick={handleExportCSV}>
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Export CSV
                </Button>
              </div>

              <TransactionTable
                transactions={filteredTxns}
                loading={txnsLoading}
                isAdmin={adminRole}
                onDownloadReceipt={handleDownloadReceipt}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <PaymentDialog
        fee={payingFee}
        open={!!payingFee}
        onClose={() => setPayingFee(null)}
        onSuccess={() => { fetchFees(); fetchSummary(); }}
      />

      {adminRole && (
        <AdminCreateFeeDialog
          open={createFeeOpen}
          onClose={() => setCreateFeeOpen(false)}
          onSuccess={() => { fetchFees(); fetchSummary(); }}
        />
      )}
    </div>
  );
}
