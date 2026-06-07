import { BookOpen, Laptop, Sofa, Shirt, Trophy, PenTool, Package } from 'lucide-react';

export const CATEGORIES = [
  { value: 'Books', label: 'Books', icon: BookOpen },
  { value: 'Electronics', label: 'Electronics', icon: Laptop },
  { value: 'Furniture', label: 'Furniture', icon: Sofa },
  { value: 'Clothing', label: 'Clothing', icon: Shirt },
  { value: 'Sports', label: 'Sports', icon: Trophy },
  { value: 'Stationery', label: 'Stationery', icon: PenTool },
  { value: 'Other', label: 'Other', icon: Package },
];

export const CONDITIONS = ['New', 'Like New', 'Good', 'Used', 'Poor'];

export const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export const CONDITION_COLORS: Record<string, string> = {
  New: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  'Like New': 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  Good: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  Used: 'bg-orange-500/15 text-orange-600 border-orange-500/20',
  Poor: 'bg-red-500/15 text-red-600 border-red-500/20',
};
