'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  GraduationCap,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const reportCategories = [
  {
    title: 'Academic Reports',
    icon: GraduationCap,
    reports: [
      { name: 'Student Performance Report', type: 'PDF', lastGenerated: 'Dec 28, 2024' },
      { name: 'Attendance Analytics', type: 'Excel', lastGenerated: 'Dec 27, 2024' },
      { name: 'Course Completion Status', type: 'PDF', lastGenerated: 'Dec 25, 2024' },
      { name: 'Semester Results Summary', type: 'PDF', lastGenerated: 'Dec 20, 2024' },
    ],
  },
  {
    title: 'Financial Reports',
    icon: CreditCard,
    reports: [
      { name: 'Fee Collection Report', type: 'Excel', lastGenerated: 'Dec 30, 2024' },
      { name: 'Outstanding Dues Report', type: 'PDF', lastGenerated: 'Dec 29, 2024' },
      { name: 'Department-wise Revenue', type: 'Excel', lastGenerated: 'Dec 28, 2024' },
    ],
  },
  {
    title: 'Faculty Reports',
    icon: Users,
    reports: [
      { name: 'Faculty Workload Report', type: 'PDF', lastGenerated: 'Dec 28, 2024' },
      { name: 'Leave Management Report', type: 'Excel', lastGenerated: 'Dec 27, 2024' },
      { name: 'Performance Evaluation', type: 'PDF', lastGenerated: 'Dec 15, 2024' },
    ],
  },
  {
    title: 'Placement Reports',
    icon: TrendingUp,
    reports: [
      { name: 'Placement Statistics', type: 'PDF', lastGenerated: 'Dec 28, 2024' },
      { name: 'Company-wise Placements', type: 'Excel', lastGenerated: 'Dec 27, 2024' },
      { name: 'Package Analysis', type: 'PDF', lastGenerated: 'Dec 25, 2024' },
    ],
  },
];

export default function Reports() {
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
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and download institution reports</p>
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
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-sm text-muted-foreground">Reports Generated</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">156</p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Today</p>
              <p className="text-sm text-muted-foreground">Last Generated</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">4</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportCategories.map((category, idx) => (
          <div key={idx} className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <category.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{category.title}</h2>
            </div>
            <div className="space-y-3">
              {category.reports.map((report, rIdx) => (
                <div key={rIdx} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground text-sm">{report.name}</p>
                      <p className="text-xs text-muted-foreground">Last: {report.lastGenerated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">{report.type}</span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
