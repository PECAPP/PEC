'use client';
import { Button, Input, Badge, Tabs, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pec/ui";


import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Plus,
  RefreshCw,
  Search,
  X,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';

import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import api from "@pec/api";

// Shared types and constants
import { FeeRecord, Transaction, Summary } from './types';
import { CATEGORIES, fmt } from './constants';

// Subcomponents
import FeeCard from './components/FeeCard';
import PaymentDialog from './components/PaymentDialog';
import TransactionTable from './components/TransactionTable';
import AdminCreateFeeDialog from './components/AdminCreateFeeDialog';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const { permissions, loading: permLoading } = usePermissions();
  const _isAdmin = (permissions as any)?.isAdmin || (permissions as any)?.role === 'college_admin';
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
      const data = raw?.data ?? raw;
      setSummary(data && typeof data === 'object' && !Array.isArray(data) ? data : null);
    } catch {
      /* silent */
    }
  }, []);

  const fetchFees = useCallback(async () => {
    setFeesLoading(true);
    try {
      const params: Record<string, any> = { limit: 100 };
      if (feeCategory) params.category = feeCategory;
      const res = await api.get(`/finance/fees?${new URLSearchParams(params)}`);
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      setFees(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load fees');
    } finally {
      setFeesLoading(false);
    }
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
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      setTransactions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setTxnsLoading(false);
    }
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
      fetchFees();
      fetchSummary();
    } catch {
      toast.error('Failed to mark paid');
    }
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
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }
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
    a.href = url;
    a.download = 'finance_transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const pendingFees = fees.filter((f) => f.status === 'pending');
  const paidFees = fees.filter((f) => f.status === 'paid');
  const filteredByCategory = feeCategory ? fees.filter((f) => f.category === feeCategory) : fees;

  const filteredTxns = transactions.filter(
    (t) =>
      !txnSearch ||
      t.receiptNo.toLowerCase().includes(txnSearch.toLowerCase()) ||
      (t.feeRecord?.description ?? '').toLowerCase().includes(txnSearch.toLowerCase())
  );

  if (permLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl animate-in fade-in duration-500 flex flex-col min-h-0">
      {/* Institutional Header */}
      <div className="pt-2 md:pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <Wallet className="w-8 h-8 text-primary relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Finance</h1>
              <p className="text-sm text-muted-foreground font-medium italic mt-1 font-display">
                Fees, Payments &amp; Transactions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 rounded-xl px-4 font-bold text-xs gap-2"
              onClick={() => {
                fetchFees();
                fetchSummary();
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            {adminRole && (
              <Button
                className="h-10 rounded-xl px-6 font-bold text-[10px] uppercase tracking-widest gap-2 bg-primary shadow-glow transition-all"
                onClick={() => setCreateFeeOpen(true)}
              >
                <Plus className="w-4 h-4" />
                Create Fee
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/40">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="h-12 bg-transparent p-0 flex justify-start gap-6 rounded-none">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 font-bold text-sm h-full"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="fees"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 font-bold text-sm h-full"
              >
                My Fees
                {pendingFees.length > 0 && (
                  <span className="ml-1.5 w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingFees.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 font-bold text-sm h-full"
              >
                Transactions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-6">
        <div className="space-y-5">
          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Pending',
                    value: summary ? `₹${fmt(summary.totalPending || 0)}` : '—',
                    icon: Clock,
                    color: 'text-amber-600',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                  },
                  {
                    label: 'Total Paid',
                    value: summary ? `₹${fmt(summary.totalPaid || 0)}` : '—',
                    icon: CheckCircle2,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                  },
                  {
                    label: 'Overdue',
                    value: summary
                      ? `${summary.overdue || 0} fee${(summary.overdue || 0) !== 1 ? 's' : ''}`
                      : '—',
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
                    <div
                      key={card.label}
                      className={cn(
                        'p-4 rounded-xl border bg-card flex items-start gap-3',
                        card.border
                      )}
                    >
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
              {summary && Object.keys(summary.byCategory || {}).length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    By Category
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(summary.byCategory || {}).map(([cat, vals]) => {
                      const catCfg = CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[5];
                      const Icon = catCfg.icon;
                      const total = vals.pending + vals.paid;
                      const paidPct = total > 0 ? Math.round((vals.paid / total) * 100) : 0;
                      return (
                        <div key={cat} className={cn('p-4 rounded-xl border bg-card', catCfg.bg)}>
                          <div className="flex items-center gap-2 mb-3">
                            <Icon className={cn('w-4 h-4', catCfg.color)} />
                            <span className={cn('text-sm font-semibold', catCfg.color)}>
                              {catCfg.label}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Paid</span>
                              <span className="font-medium text-emerald-600">
                                ₹{fmt(vals.paid)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Pending</span>
                              <span className="font-medium text-amber-600">
                                ₹{fmt(vals.pending)}
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${paidPct}%` }}
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                            <p className="text-[10px] text-right text-muted-foreground">
                              {paidPct}% paid
                            </p>
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
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      Pending Fees
                    </h2>
                    <Button
                      size="sm"
                      variant="link"
                      className="text-xs h-auto p-0"
                      onClick={() => setTab('fees')}
                    >
                      View all →
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pendingFees.slice(0, 3).map((fee) => (
                      <FeeCard
                        key={fee.id}
                        fee={fee}
                        onPay={setPayingFee}
                        onMarkPaid={handleMarkPaid}
                        isAdmin={adminRole}
                      />
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
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
                    !feeCategory
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-muted'
                  )}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      onClick={() => setFeeCategory(feeCategory === cat.value ? '' : cat.value)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
                        feeCategory === cat.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      )}
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
                        <Badge className="bg-amber-500 text-white">
                          {filteredByCategory.filter((f) => f.status === 'pending').length}
                        </Badge>
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredByCategory
                          .filter((f) => f.status === 'pending')
                          .map((fee) => (
                            <FeeCard
                              key={fee.id}
                              fee={fee}
                              onPay={setPayingFee}
                              onMarkPaid={handleMarkPaid}
                              isAdmin={adminRole}
                            />
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
                        {filteredByCategory
                          .filter((f) => f.status === 'paid')
                          .map((fee) => (
                            <FeeCard
                              key={fee.id}
                              fee={fee}
                              onPay={setPayingFee}
                              onMarkPaid={handleMarkPaid}
                              isAdmin={adminRole}
                            />
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
                <Select
                  value={txnCat || '__all__'}
                  onValueChange={(v) => setTxnCat(v === '__all__' ? '' : v)}
                >
                  <SelectTrigger className="w-32 h-8 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={txnStatus || '__all__'}
                  onValueChange={(v) => setTxnStatus(v === '__all__' ? '' : v)}
                >
                  <SelectTrigger className="w-28 h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  className="h-8 text-xs w-36"
                  value={txnFrom}
                  onChange={(e) => setTxnFrom(e.target.value)}
                />
                <Input
                  type="date"
                  className="h-8 text-xs w-36"
                  value={txnTo}
                  onChange={(e) => setTxnTo(e.target.value)}
                />
                {(txnCat || txnStatus || txnFrom || txnTo || txnSearch) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => {
                      setTxnCat('');
                      setTxnStatus('');
                      setTxnFrom('');
                      setTxnTo('');
                      setTxnSearch('');
                    }}
                  >
                    <X className="w-3 h-3 mr-1" /> Clear
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs ml-auto"
                  onClick={handleExportCSV}
                >
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
        onSuccess={() => {
          fetchFees();
          fetchSummary();
        }}
      />

      {adminRole && (
        <AdminCreateFeeDialog
          open={createFeeOpen}
          onClose={() => setCreateFeeOpen(false)}
          onSuccess={() => {
            fetchFees();
            fetchSummary();
          }}
        />
      )}
    </div>
  );
}
