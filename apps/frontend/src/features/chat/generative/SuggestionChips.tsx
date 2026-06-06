import React from 'react';

export const SuggestionChips = ({
  chips,
  onSelect,
}: {
  chips: string[];
  onSelect: (text: string) => void;
}) => {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(chip)}
          className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full transition-all duration-150 border border-indigo-100 dark:border-indigo-800/50 hover:scale-105 active:scale-95 shadow-sm"
        >
          {chip}
        </button>
      ))}
    </div>
  );
};
