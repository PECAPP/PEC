import {
  Building2,
  UtensilsCrossed,
  Home,
  BookOpen,
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from 'lucide-react';

export const CATEGORIES = [
  {
    value: 'college',
    label: 'College Fee',
    icon: Building2,
    color: 'text-violet-600',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    value: 'mess',
    label: 'Mess Fee',
    icon: UtensilsCrossed,
    color: 'text-orange-600',
    bg: 'bg-orange-500/10 border-orange-500/20',
  },
  {
    value: 'hostel',
    label: 'Hostel Fee',
    icon: Home,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    value: 'exam',
    label: 'Exam Fee',
    icon: BookOpen,
    color: 'text-red-600',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  {
    value: 'library',
    label: 'Library Fee',
    icon: BookOpen,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  {
    value: 'other',
    label: 'Other',
    icon: Wallet,
    color: 'text-gray-600',
    bg: 'bg-gray-500/10 border-gray-500/20',
  },
];

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  pending: {
    label: 'Pending',
    color: 'bg-amber-500/15 text-amber-600 border-amber-500/20',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
    icon: CheckCircle2,
  },
  failed: { label: 'Failed', color: 'bg-red-500/15 text-red-600 border-red-500/20', icon: XCircle },
  waived: {
    label: 'Waived',
    color: 'bg-gray-500/15 text-gray-600 border-gray-500/20',
    icon: ShieldCheck,
  },
};

export function fmt(n: number) {
  return (n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function isOverdue(dueDate: string) {
  return new Date(dueDate) < new Date();
}
