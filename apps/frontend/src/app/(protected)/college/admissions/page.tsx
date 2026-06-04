'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Download,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const admissions = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    department: 'Computer Science',
    appliedDate: 'Dec 28, 2024',
    status: 'approved',
    entranceScore: 92,
  },
  {
    id: '2',
    name: 'Rahul Verma',
    email: 'rahul.verma@email.com',
    department: 'Electronics',
    appliedDate: 'Dec 27, 2024',
    status: 'pending',
    entranceScore: 85,
  },
  {
    id: '3',
    name: 'Ananya Singh',
    email: 'ananya.singh@email.com',
    department: 'Mechanical',
    appliedDate: 'Dec 26, 2024',
    status: 'approved',
    entranceScore: 88,
  },
  {
    id: '4',
    name: 'Vikram Patel',
    email: 'vikram.patel@email.com',
    department: 'Civil',
    appliedDate: 'Dec 25, 2024',
    status: 'rejected',
    entranceScore: 62,
  },
  {
    id: '5',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@email.com',
    department: 'Information Technology',
    appliedDate: 'Dec 24, 2024',
    status: 'pending',
    entranceScore: 78,
  },
  {
    id: '6',
    name: 'Amit Kumar',
    email: 'amit.kumar@email.com',
    department: 'Electrical',
    appliedDate: 'Dec 23, 2024',
    status: 'approved',
    entranceScore: 95,
  },
];

export default function Admissions() {
  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      rejected: 'bg-destructive/10 text-destructive',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <UserCheck className="w-4 h-4" />;
      case 'rejected':
        return <UserX className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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
            <h1 className="text-2xl font-bold text-foreground">Admissions</h1>
            <p className="text-muted-foreground">Manage student admissions and applications</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl font-bold text-foreground">156</p>
          <p className="text-sm text-muted-foreground">Total Applications</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl font-bold text-success">98</p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl font-bold text-warning">42</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="text-3xl font-bold text-destructive">16</p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." className="pl-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="cse">Computer Science</SelectItem>
            <SelectItem value="ece">Electronics</SelectItem>
            <SelectItem value="me">Mechanical</SelectItem>
            <SelectItem value="ce">Civil</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Admissions List */}
      <div className="card-elevated overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applicant</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Department</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applied Date</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Entrance Score</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map((admission) => (
              <tr key={admission.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-foreground">{admission.name}</p>
                    <p className="text-sm text-muted-foreground">{admission.email}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-foreground">{admission.department}</td>
                <td className="py-4 px-4 text-muted-foreground">{admission.appliedDate}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`font-medium ${admission.entranceScore >= 80 ? 'text-success' : admission.entranceScore >= 65 ? 'text-warning' : 'text-destructive'}`}>
                    {admission.entranceScore}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(admission.status)}`}>
                    {getStatusIcon(admission.status)}
                    {admission.status.charAt(0).toUpperCase() + admission.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
