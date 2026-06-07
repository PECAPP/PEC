import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle2, IndianRupee, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FeeRecord } from '../types';
import { CATEGORIES, STATUS_CONFIG, fmt, isOverdue } from '../constants';

export default function FeeCard({
  fee,
  onPay,
  onMarkPaid,
  isAdmin,
}: {
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
        fee.status === 'paid' && 'opacity-80'
      )}
    >
      {overdue && (
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-600 border-red-300 text-[10px]"
          >
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
            {fee.semester && (
              <span className="text-[10px] text-muted-foreground">{fee.semester}</span>
            )}
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
          <p
            className={cn(
              'text-xs mt-0.5',
              overdue ? 'text-red-500 font-medium' : 'text-muted-foreground'
            )}
          >
            Due:{' '}
            {new Date(fee.dueDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn('text-xs', STATUS_CONFIG[fee.status]?.color ?? '')}
          >
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
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8"
              onClick={() => onMarkPaid(fee.id)}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Mark Paid
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
