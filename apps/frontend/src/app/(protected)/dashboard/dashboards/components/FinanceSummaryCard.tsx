'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, CheckCircle2, AlertTriangle, IndianRupee, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface FinanceSummary {
  totalPending: number;
  totalPaid: number;
  overdue: number;
  byCategory: Record<string, { pending: number; paid: number }>;
}

interface PendingFee {
  id: string;
  description: string;
  category: string;
  amount: number;
  lateFeeAmount: number;
  dueDate: string;
  status: string;
}

function fmt(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const CATEGORY_COLORS: Record<string, string> = {
  college: 'bg-violet-500',
  mess: 'bg-orange-500',
  hostel: 'bg-blue-500',
  exam: 'bg-red-500',
  library: 'bg-emerald-500',
  other: 'bg-gray-500',
};

export function FinanceSummaryCard({
  className,
  onViewAll,
}: {
  className?: string;
  onViewAll: () => void;
}) {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sumRes, feesRes] = await Promise.all([
          api.get('/finance/summary'),
          api.get('/finance/fees?status=pending&limit=3'),
        ]);
        setSummary((sumRes as any).data);
        setPendingFees((feesRes as any).data ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className={cn('card-elevated ui-card-pad space-y-4 animate-pulse', className)}>
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="h-16 bg-muted rounded-lg" />
        <div className="h-10 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!summary) return null;

  const totalDue = summary.totalPending;
  const categories = Object.entries(summary.byCategory);
  const totalAll = summary.totalPending + summary.totalPaid;
  const paidPct = totalAll > 0 ? Math.round((summary.totalPaid / totalAll) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('card-elevated ui-card-pad space-y-4', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <Wallet className="w-4 h-4 text-violet-600" />
          </div>
          <h3 className="font-semibold text-sm">Finance</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={onViewAll}>
          View all <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-[10px] text-muted-foreground font-medium">Pending</p>
          <p className="text-sm font-bold text-amber-600">₹{fmt(totalDue)}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-[10px] text-muted-foreground font-medium">Paid</p>
          <p className="text-sm font-bold text-emerald-600">₹{fmt(summary.totalPaid)}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-[10px] text-muted-foreground font-medium">Overdue</p>
          <p className="text-sm font-bold text-red-600">{summary.overdue}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
          <span>Payment progress</span>
          <span className="font-medium">{paidPct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${paidPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </div>
      </div>

      {/* Category breakdown mini */}
      {categories.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {categories.map(([cat, vals]) => (
            <Badge
              key={cat}
              variant="outline"
              className="text-[10px] gap-1 h-5"
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', CATEGORY_COLORS[cat] ?? 'bg-gray-500')} />
              {cat}: ₹{fmt(vals.pending)}
            </Badge>
          ))}
        </div>
      )}

      {/* Pending fees list */}
      {pendingFees.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Upcoming dues</p>
          {pendingFees.map((fee) => {
            const total = fee.amount + (fee.lateFeeAmount ?? 0);
            const overdue = new Date(fee.dueDate) < new Date();
            return (
              <div
                key={fee.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg border text-xs',
                  overdue ? 'border-red-300 bg-red-500/5' : 'border-border',
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{fee.description}</p>
                  <p className={cn('text-[10px]', overdue ? 'text-red-500' : 'text-muted-foreground')}>
                    Due: {new Date(fee.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    {overdue && ' · OVERDUE'}
                  </p>
                </div>
                <span className="font-bold text-sm ml-2 whitespace-nowrap">₹{fmt(total)}</span>
              </div>
            );
          })}
        </div>
      )}

      {pendingFees.length === 0 && summary.totalPending === 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <p className="text-xs text-emerald-600 font-medium">All fees paid! You're up to date.</p>
        </div>
      )}
    </motion.div>
  );
}
