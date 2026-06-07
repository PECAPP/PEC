import React from 'react';
import { Wrench } from 'lucide-react';

interface HostelIssue {
  title: string;
  category: string;
  roomNumber: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
}

interface HostelIssuesData {
  issues?: HostelIssue[];
}

export const HostelIssuesList = ({ data }: { data: HostelIssuesData }) => {
  if (!data) return null;
  const issues = data.issues ?? [];

  if (issues.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 my-3 text-center text-sm text-gray-500">
        No maintenance issues reported.
      </div>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved':
        return 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50';
      case 'in progress':
      case 'in_progress':
        return 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50';
      default:
        return 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40';
      case 'medium':
        return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40';
      default:
        return 'text-slate-600 bg-slate-100 dark:text-slate-300 dark:bg-slate-800';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden my-3">
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4" />
          <span className="font-semibold text-sm">Hostel Maintenance Issues</span>
        </div>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
          {issues.length} Reported
        </span>
      </div>
      <div className="p-3 space-y-3 max-h-[320px] overflow-y-auto">
        {issues.map((issue, idx) => (
          <div key={idx} className="border border-gray-100 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
            <div className="flex justify-between items-start gap-2 mb-1.5">
              <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200 line-clamp-1">{issue.title || 'Untitled Issue'}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusStyle(issue.status)}`}>
                {issue.status}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {issue.description}
            </p>
            <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400 border-t border-gray-50 dark:border-gray-700/50 pt-2">
              <div className="flex gap-2">
                <span>Room: <strong className="text-gray-600 dark:text-gray-300 font-medium">{issue.roomNumber}</strong></span>
                <span>Category: <strong className="text-gray-600 dark:text-gray-300 font-medium">{issue.category}</strong></span>
              </div>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] uppercase ${getPriorityStyle(issue.priority)}`}>
                {issue.priority}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
