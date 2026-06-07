import React from 'react';
import { BookOpen } from 'lucide-react';

interface GradeSubject {
  code: string;
  name: string;
  grade: string;
  gradePoint: number;
  credits: number;
  semester: number;
  type?: string;
}

interface GradesData {
  user?: string | null;
  CGPA?: number | null;
  subjects?: GradeSubject[];
  message?: string;
}

const gradeColor = (grade: string) => {
  if (['A+', 'A'].includes(grade)) return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40';
  if (['B+', 'B'].includes(grade)) return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40';
  if (['C+', 'C'].includes(grade)) return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40';
  return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40';
};

const cgpaBadgeColor = (cgpa: number) => {
  if (cgpa >= 8) return 'bg-emerald-600';
  if (cgpa >= 6.5) return 'bg-blue-600';
  if (cgpa >= 5) return 'bg-amber-500';
  return 'bg-red-600';
};

export const GradesTable = ({ data }: { data: GradesData }) => {
  if (!data) return null;

  const subjects = data.subjects ?? [];
  const cgpa = data.CGPA;

  if (subjects.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 my-3 text-center text-sm text-gray-500">
        {data.message ?? 'No grade records found.'}
      </div>
    );
  }

  const totalCredits = subjects.reduce((s, e) => s + e.credits, 0);

  // Group by semester
  const bySem: Record<number, GradeSubject[]> = {};
  for (const s of subjects) {
    if (!bySem[s.semester]) bySem[s.semester] = [];
    bySem[s.semester].push(s);
  }
  const semesters = Object.keys(bySem)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden my-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <BookOpen className="w-4 h-4" />
          <span className="font-semibold text-sm">
            Academic Transcript{data.user ? ` — ${data.user}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-indigo-200 text-xs">{totalCredits} credits</span>
          {cgpa !== null && cgpa !== undefined && (
            <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${cgpaBadgeColor(cgpa)}`}>
              CGPA {cgpa}
            </span>
          )}
        </div>
      </div>

      {/* Per-semester sections */}
      {semesters.map((sem) => (
        <div key={sem}>
          <div className="bg-gray-50 dark:bg-gray-900/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            Semester {sem}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-4 py-2 font-medium">Subject</th>
                <th className="text-center px-2 py-2 font-medium">Code</th>
                <th className="text-center px-2 py-2 font-medium">GP</th>
                <th className="text-center px-2 py-2 font-medium">Cr</th>
                <th className="text-center px-3 py-2 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {bySem[sem].map((s, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-800 dark:text-gray-200 font-medium truncate max-w-[120px]" title={s.name}>
                    {s.name}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-500 dark:text-gray-400 text-xs font-mono">
                    {s.code}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-600 dark:text-gray-300 font-medium">
                    {s.gradePoint.toFixed(1)}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-500 dark:text-gray-400">
                    {s.credits}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${gradeColor(s.grade)}`}>
                      {s.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-900/30 px-4 py-2.5 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
        <span>{subjects.length} subjects · {totalCredits} total credits</span>
        {cgpa !== null && cgpa !== undefined && (
          <span className="font-bold text-indigo-600 dark:text-indigo-400">CGPA: {cgpa}</span>
        )}
      </div>
    </div>
  );
};
