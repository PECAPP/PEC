import React, { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Receipt, Loader2, IndianRupee, Download } from 'lucide-react';
import { Button, Badge, formatDate } from "@pec/ui";
import { cn } from '@/lib/utils';
import { Transaction } from '../types';
import { CATEGORIES, STATUS_CONFIG, fmt } from '../constants';
import { DataTable } from '@/components/common/DataTable';

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
  const columns = useMemo<ColumnDef<Transaction>[]>(() => {
    const cols: ColumnDef<Transaction>[] = [
      {
        accessorKey: 'receiptNo',
        header: 'Receipt No.',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-primary">{row.original.receiptNo}</span>
        ),
      },
    ];

    if (isAdmin) {
      cols.push({
        accessorKey: 'student',
        header: 'Student',
        cell: ({ row }) => (
          <div className="text-xs">
            <p className="font-medium">{row.original.student?.name}</p>
            <p className="text-muted-foreground">{row.original.student?.email}</p>
          </div>
        ),
      });
    }

    cols.push(
      {
        id: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-[160px]">
            <p className="truncate">{row.original.feeRecord?.description ?? '—'}</p>
            {(row.original.feeRecord?.semester ?? row.original.feeRecord?.month) && (
              <p className="text-xs text-muted-foreground">
                {row.original.feeRecord?.semester ?? row.original.feeRecord?.month}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const cat =
            CATEGORIES.find((c) => c.value === row.original.feeRecord?.category) ??
            CATEGORIES[5];
          return (
            <Badge variant="outline" className={cn('text-[10px]', cat.bg, cat.color)}>
              {cat.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="flex items-center gap-0.5 font-semibold">
            <IndianRupee className="w-3 h-3" />
            {fmt(row.original.amount)}
          </span>
        ),
      },
      {
        accessorKey: 'paymentMethod',
        header: 'Method',
        cell: ({ row }) => (
          <span className="uppercase text-xs text-muted-foreground">
            {row.original.paymentMethod}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const statusCfg = STATUS_CONFIG[row.original.status] ?? STATUS_CONFIG.pending;
          const StatusIcon = statusCfg.icon;
          return (
            <Badge variant="outline" className={cn('text-[10px]', statusCfg.color)}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusCfg.label}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          if (row.original.status === 'success') {
            return (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
                onClick={() => onDownloadReceipt(row.original)}
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            );
          }
          return null;
        },
      }
    );

    return cols;
  }, [isAdmin, onDownloadReceipt]);

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
    <div className="w-full">
      <DataTable columns={columns} data={transactions} />
    </div>
  );
}
