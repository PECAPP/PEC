import React from 'react';
import { Users } from 'lucide-react';

interface Club {
  name: string;
  createdAt: string;
}

interface ClubsData {
  clubs?: Club[];
}

export const ClubsList = ({ data }: { data: ClubsData }) => {
  if (!data) return null;
  const clubs = data.clubs ?? [];

  if (clubs.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 my-3 text-center text-sm text-gray-500">
        No active student clubs found.
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden my-3">
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span className="font-semibold text-sm">Student Clubs</span>
        </div>
      </div>
      <div className="p-3 divide-y divide-gray-50 dark:divide-gray-700 max-h-[250px] overflow-y-auto">
        {clubs.map((club, idx) => (
          <div key={idx} className="py-2 flex justify-between items-center gap-2 first:pt-0 last:pb-0">
            <span className="font-medium text-xs text-gray-800 dark:text-gray-200 truncate">{club.name}</span>
            <span className="text-[9px] text-gray-400 shrink-0">
              Est. {new Date(club.createdAt).getFullYear()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
