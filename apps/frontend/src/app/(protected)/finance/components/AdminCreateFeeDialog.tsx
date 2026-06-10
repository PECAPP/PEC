import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@pec/ui';
import { toast } from 'sonner';
import { CATEGORIES } from '../constants';
import api from '@pec/api';

export default function AdminCreateFeeDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [form, setForm] = useState({
    studentId: '',
    description: '',
    category: 'college',
    amount: '',
    dueDate: '',
    semester: '',
    month: '',
  });
  const [bulk, setBulk] = useState({
    category: 'mess',
    amount: '',
    month: '',
    dueDate: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId || !form.description || !form.amount || !form.dueDate || !form.category) {
      toast.error('Fill all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/finance/fees', { ...form, amount: parseFloat(form.amount) });
      toast.success('Fee created');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to create fee');
    } finally {
      setLoading(false);
    }
  };

  const handleBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulk.amount || !bulk.month || !bulk.dueDate || !bulk.description) {
      toast.error('Fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/finance/fees/bulk-monthly', {
        ...bulk,
        amount: parseFloat(bulk.amount),
      });
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      const { created, skipped } = data ?? {};
      toast.success(`Created ${created} fees (${skipped} skipped – already exists)`);
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className=" max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Fee Record</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={mode === 'single' ? 'default' : 'outline'}
            onClick={() => setMode('single')}
          >
            Single Student
          </Button>
          <Button
            size="sm"
            variant={mode === 'bulk' ? 'default' : 'outline'}
            onClick={() => setMode('bulk')}
          >
            Bulk (All Students)
          </Button>
        </div>

        {mode === 'single' ? (
          <form onSubmit={handleSingle} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Student ID *</label>
              <Input
                placeholder="Student UUID"
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <Input
                placeholder="e.g. Tuition Fee Even Sem 2024-25"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Amount (₹) *</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="42500"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Due Date *</label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Semester</label>
                <Input
                  placeholder="2024-25 Even"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}Create
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBulk} className="space-y-3">
            <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 flex gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              This will create fee records for ALL students. Existing records for the same
              category+month are skipped.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={bulk.category}
                  onValueChange={(v) => setBulk({ ...bulk, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Month (YYYY-MM) *</label>
                <Input
                  type="month"
                  value={bulk.month}
                  onChange={(e) => setBulk({ ...bulk, month: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Amount (₹) *</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="3800"
                  value={bulk.amount}
                  onChange={(e) => setBulk({ ...bulk, amount: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Due Date *</label>
                <Input
                  type="date"
                  value={bulk.dueDate}
                  onChange={(e) => setBulk({ ...bulk, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description *</label>
              <Input
                placeholder="Mess Fee – March 2025"
                value={bulk.description}
                onChange={(e) => setBulk({ ...bulk, description: e.target.value })}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}Create for All
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
