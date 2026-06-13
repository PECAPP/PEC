import React from 'react';
import { Utensils } from 'lucide-react';

interface CanteenItem {
  name: string;
  price: number;
  category: string;
  description?: string;
  stock: number;
}

interface CanteenData {
  items?: CanteenItem[];
  note?: string;
}

export const CanteenMenuList = ({ data, isNight = false }: { data: CanteenData; isNight?: boolean }) => {
  if (!data) return null;
  const items = data.items ?? [];

  if (items.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm p-5 my-3 text-center text-sm text-gray-500">
        No canteen items available at the moment.
      </div>
    );
  }

  const gradient = isNight ? 'from-purple-600 to-indigo-800' : 'from-emerald-600 to-teal-600';
  const title = isNight ? 'Night Canteen Menu' : 'Day Canteen Menu';

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden my-3">
      <div className={`bg-gradient-to-r ${gradient} px-4 py-3 flex items-center justify-between text-white`}>
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
      </div>
      <div className="p-3 divide-y divide-gray-100 dark:divide-gray-700 max-h-[300px] overflow-y-auto">
        {items.map((item, idx) => (
          <div key={idx} className="py-2.5 flex justify-between items-center gap-3 first:pt-0 last:pb-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-xs text-gray-800 dark:text-gray-200 truncate">{item.name}</span>
                <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.2 rounded-full uppercase">
                  {item.category}
                </span>
              </div>
              {item.description && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5" title={item.description}>
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">₹{item.price}</span>
              {item.stock > 0 ? (
                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">
                  In stock
                </span>
              ) : (
                <span className="text-[10px] text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-950/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30">
                  Out
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
