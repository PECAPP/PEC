import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2, IndianRupee, Download } from 'lucide-react';
import { Button } from '@pec/ui';
import { Badge } from '@pec/ui';
import { cn } from '@/lib/utils';
import { Transaction } from '../types';
import { CATEGORIES, STATUS_CONFIG, fmt } from '../constants';

export default function TransactionTable({
  transactions,
  loading,
  isAdmin,
  onDownloadReceipt,
}: {
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
            {isAdmin && (
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
            )}
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
            const cat =
              CATEGORIES.find((c) => c.value === txn.feeRecord?.category) ?? CATEGORIES[5];
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
                    <p className="text-xs text-muted-foreground">
                      {txn.feeRecord?.semester ?? txn.feeRecord?.month}
                    </p>
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
                <td className="px-4 py-3 uppercase text-xs text-muted-foreground">
                  {txn.paymentMethod}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={cn('text-[10px]', statusCfg.color)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusCfg.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
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
