'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  PieChart,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const feeBreakdown = [
  { category: 'Tuition Fee', collected: 28000000, total: 35000000 },
  { category: 'Hostel Fee', collected: 8500000, total: 10000000 },
  { category: 'Library Fee', collected: 1800000, total: 2000000 },
  { category: 'Lab Fee', collected: 3200000, total: 4000000 },
  { category: 'Exam Fee', collected: 1500000, total: 2000000 },
];

const recentTransactions = [
  { id: '1', student: 'Rahul Verma', amount: 85000, date: 'Dec 30, 2024', type: 'Tuition' },
  { id: '2', student: 'Priya Sharma', amount: 45000, date: 'Dec 29, 2024', type: 'Hostel' },
  { id: '3', student: 'Amit Kumar', amount: 85000, date: 'Dec 29, 2024', type: 'Tuition' },
  { id: '4', student: 'Sneha Patel', amount: 12000, date: 'Dec 28, 2024', type: 'Exam' },
  { id: '5', student: 'Vikram Singh', amount: 85000, date: 'Dec 28, 2024', type: 'Tuition' },
];

export default function FinancialReport() {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  const totalCollected = feeBreakdown.reduce((sum, item) => sum + item.collected, 0);
  const totalExpected = feeBreakdown.reduce((sum, item) => sum + item.total, 0);
  const collectionPercentage = Math.round((totalCollected / totalExpected) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard?role=college_admin">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Financial Report</h1>
            <p className="text-muted-foreground">Fee collection analytics and insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2024-25">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2023-24">2023-24</SelectItem>
              <SelectItem value="2022-23">2022-23</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-success" />
            </div>
            <TrendingUp className="w-4 h-4 text-success ml-auto" />
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalCollected)}</p>
          <p className="text-sm text-muted-foreground">Total Collected</p>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalExpected)}</p>
          <p className="text-sm text-muted-foreground">Expected Revenue</p>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-warning" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalExpected - totalCollected)}</p>
          <p className="text-sm text-muted-foreground">Pending Amount</p>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{collectionPercentage}%</p>
          <p className="text-sm text-muted-foreground">Collection Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Category Breakdown */}
        <div className="lg:col-span-2 card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Fee Category Breakdown</h2>
          <div className="space-y-4">
            {feeBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">{item.category}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(item.collected)} / {formatCurrency(item.total)}
                  </span>
                </div>
                <Progress value={(item.collected / item.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Collection Summary */}
        <div className="card-elevated p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Collection Summary</h2>
          <div className="space-y-4">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-secondary"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-success"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${collectionPercentage * 3.52} 352`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                  {collectionPercentage}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Overall Collection</p>
            </div>
            <div className="space-y-2 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  Collected
                </span>
                <span className="font-medium text-success">78%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning"></span>
                  Pending
                </span>
                <span className="font-medium text-warning">15%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-destructive"></span>
                  Overdue
                </span>
                <span className="font-medium text-destructive">7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-border last:border-0">
                  <td className="py-3 px-4 font-medium text-foreground">{txn.student}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {txn.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">{txn.date}</td>
                  <td className="py-3 px-4 text-right font-medium text-success">
                    +₹{txn.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
