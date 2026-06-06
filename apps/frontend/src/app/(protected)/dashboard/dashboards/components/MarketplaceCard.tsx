'use client';
import { Badge, Button } from "@pec/ui";


import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Tag, Heart, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import api from "@pec/api";
import { Can } from '@/lib/casl-context';

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: string;
  seller: { id: string; name: string };
  createdAt: string;
}

function fmt(n: number) {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

const CONDITION_COLORS: Record<string, string> = {
  new: 'bg-emerald-500/15 text-emerald-600',
  like_new: 'bg-blue-500/15 text-blue-600',
  good: 'bg-amber-500/15 text-amber-600',
  used: 'bg-orange-500/15 text-orange-600',
  poor: 'bg-red-500/15 text-red-600',
};

const CATEGORY_ICONS: Record<string, string> = {
  books: '📚',
  electronics: '💻',
  furniture: '🪑',
  clothing: '👕',
  sports: '⚽',
  stationery: '✏️',
  other: '📦',
};

export function MarketplaceCard({
  className,
  onViewAll,
  onCreateListing,
}: {
  className?: string;
  onViewAll: () => void;
  onCreateListing: () => void;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [listingsRes, savedRes] = await Promise.all([
          api.get('/marketplace/listings?limit=4&sortBy=createdAt&sortOrder=desc'),
          api.get('/marketplace/bookmarks/ids'),
        ]);
        const raw = (listingsRes as any).data;
        const data = raw?.data ?? raw;
        setListings(Array.isArray(data) ? data : []);
        const idsRaw = (savedRes as any).data;
        const ids = idsRaw?.data ?? idsRaw;
        setSavedCount(Array.isArray(ids) ? ids.length : 0);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className={cn('card-elevated ui-card-pad space-y-4 animate-pulse', className)}>
        <div className="h-5 w-32 bg-muted rounded" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('card-elevated ui-card-pad flex h-full flex-col', className)}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <ShoppingBag className="h-5 w-5 text-orange-500" />
          Buy & Sell
          {savedCount > 0 && (
            <Badge variant="outline" className="ml-2 text-[10px] h-5 gap-1 bg-background/40">
              <Heart className="w-2.5 h-2.5 text-red-500" /> {savedCount}
            </Badge>
          )}
        </h2>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {/* Listings grid */}
      {listings.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="group relative border border-border bg-secondary/10 rounded-lg overflow-hidden cursor-pointer hover:bg-secondary/20 hover:border-primary/40 transition-colors"
              onClick={onViewAll}
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/200x150/f4f4f5/a1a1aa?text=${encodeURIComponent(listing.category)}`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    {CATEGORY_ICONS[listing.category.toLowerCase()] ?? '📦'}
                  </div>
                )}
                {listing.status === 'sold' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge className="bg-red-500 text-white text-[10px]">SOLD</Badge>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-2">
                <p className="text-xs font-medium truncate">{listing.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary">₹{fmt(listing.price)}</span>
                  <Badge
                    variant="outline"
                    className={cn('text-[9px] h-4 px-1', CONDITION_COLORS[listing.condition] ?? '')}
                  >
                    {listing.condition.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
          <ShoppingBag className="w-8 h-8" />
          <p className="text-xs">No listings yet</p>
        </div>
      )}

      <div className="mt-auto pt-4">
        {/* Quick action */}
        <Can I="create" a="MarketplaceListing">
          <Button
            className="w-full h-10 rounded-xl font-bold text-[10px] uppercase tracking-widest gap-2 bg-primary shadow-glow transition-all"
            onClick={onCreateListing}
          >
            <Plus className="w-4 h-4" />
            Sell something
          </Button>
        </Can>
      </div>
    </motion.div>
  );
}
