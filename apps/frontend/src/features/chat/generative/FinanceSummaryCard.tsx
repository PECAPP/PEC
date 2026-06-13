import { formatDate } from "@pec/ui";
import React from 'react';
import { Wallet, AlertTriangle } from 'lucide-react';

interface PendingFee {
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  semester?: string;
  month?: string;
  overdue: boolean;
}

interface FinanceData {
  totalPending?: number;
  totalPaid?: number;
  overdueCount?: number;
  pendingFees?: PendingFee[];
  message?: string;
}

export const FinanceSummaryCard = ({ data }: { data: FinanceData }) => {
  if (!data) return null;
  const pendingFees = data.pendingFees ?? [];
  const totalPending = data.totalPending ?? 0;
  const totalPaid = data.totalPaid ?? 0;
  const overdueCount = data.overdueCount ?? 0;

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden my-3">
      <div className="bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          <span className="font-semibold text-sm">Finance & Fee Summary</span>
        </div>
        {overdueCount > 0 && (
          <span className="text-[10px] bg-white text-red-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-2.5 h-2.5" /> {overdueCount} Overdue
          </span>
        )}
      </div>

      <div className="p-3">
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100/50 dark:border-red-900/30 rounded-sm p-2 text-center">
            <div className="text-[9px] text-red-600/70 dark:text-red-400/70 uppercase font-semibold">Total Pending</div>
            <div className="text-xs font-bold text-red-600 dark:text-red-400 mt-0.5">₹{totalPending}</div>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-sm p-2 text-center">
            <div className="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 uppercase font-semibold">Total Paid</div>
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{totalPaid}</div>
          </div>
        </div>

        {/* Itemized List */}
        {pendingFees.length > 0 ? (
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Pending Invoices</div>
            {pendingFees.map((fee, idx) => (
              <div key={idx} className={`border rounded-sm p-2 flex justify-between items-center gap-3 ${fee.overdue ? 'bg-red-50/20 border-red-100 dark:border-red-950/50' : 'bg-gray-50/20 border-gray-100 dark:border-gray-800'}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[11px] text-gray-700 dark:text-gray-300 truncate">{fee.description}</span>
                    {fee.overdue && (
                      <span className="text-[8px] bg-red-100 text-red-700 px-1 rounded uppercase font-bold">Overdue</span>
                    )}
                  </div>
                  <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Due: {formatDate(fee.dueDate)}
                  </div>
                </div>
                <span className={`text-xs font-bold shrink-0 ${fee.overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                  ₹{fee.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-2 text-xs text-gray-500">
            {data.message ?? 'No pending invoices found.'}
          </div>
        )}
      </div>
    </div>
  );
};
