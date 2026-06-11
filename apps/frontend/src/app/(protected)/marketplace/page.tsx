'use client';
import { Button, Input, Badge, Tabs, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea, AppShellSkeleton } from "@pec/ui";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Search,
  X,
  Heart,
  MessageCircle,
  ChevronDown,
  Package,
  Loader2,
  BookOpen,
  Laptop,
  Sofa,
  Shirt,
  Trophy,
  PenTool,
  Grid3X3,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Edit2,
  Trash2,
  IndianRupee,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from "@pec/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Seller {
  id: string;
  name: string;
  avatar?: string;
  studentProfile?: { phone?: string };
}

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  status: string;
  sellerId: string;
  seller: Seller;
  _count?: { bookmarks: number };
  createdAt: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string };
}

interface Chat {
  id: string;
  listingId: string;
  buyerId: string;
  listing: { id: string; title: string; images: string[]; price: number; sellerId: string };
  buyer: { id: string; name: string; avatar?: string };
  messages: ChatMessage[];
  updatedAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'Books', label: 'Books', icon: BookOpen },
  { value: 'Electronics', label: 'Electronics', icon: Laptop },
  { value: 'Furniture', label: 'Furniture', icon: Sofa },
  { value: 'Clothing', label: 'Clothing', icon: Shirt },
  { value: 'Sports', label: 'Sports', icon: Trophy },
  { value: 'Stationery', label: 'Stationery', icon: PenTool },
  { value: 'Other', label: 'Other', icon: Package },
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Used', 'Poor'];

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest First' },
  { value: 'createdAt_asc', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

const CONDITION_COLORS: Record<string, string> = {
  New: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20',
  'Like New': 'bg-blue-500/15 text-blue-600 border-blue-500/20',
  Good: 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20',
  Used: 'bg-orange-500/15 text-orange-600 border-orange-500/20',
  Poor: 'bg-red-500/15 text-red-600 border-red-500/20',
};

import ProductCard from './components/ProductCard';
import ListingFormDialog from './components/ListingFormDialog';
import ListingDetailDialog from './components/ListingDetailDialog';
import ChatPanel from './components/ChatPanel';

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { user, ability, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load initial state from URL
  const [tab, setTab] = useState<'browse' | 'my-listings' | 'saved'>(
    (searchParams.get('tab') as any) || 'browse'
  );
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filterCategory, setFilterCategory] = useState(searchParams.get('category') || '');
  const [filterCondition, setFilterCondition] = useState(searchParams.get('condition') || '');
  const [filterMinPrice, setFilterMinPrice] = useState(searchParams.get('minPrice') || '');
  const [filterMaxPrice, setFilterMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortOption, setSortOption] = useState(searchParams.get('sort') || 'createdAt_desc');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Sync state to URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (tab && tab !== 'browse') params.set('tab', tab);
    else params.delete('tab');
    
    if (search) params.set('q', search);
    else params.delete('q');
    
    if (filterCategory) params.set('category', filterCategory);
    else params.delete('category');
    
    if (filterCondition) params.set('condition', filterCondition);
    else params.delete('condition');
    
    if (filterMinPrice) params.set('minPrice', filterMinPrice);
    else params.delete('minPrice');
    
    if (filterMaxPrice) params.set('maxPrice', filterMaxPrice);
    else params.delete('maxPrice');
    
    if (sortOption && sortOption !== 'createdAt_desc') params.set('sort', sortOption);
    else params.delete('sort');

    // Replace URL without refreshing the page
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    
    router.replace(url as any, { scroll: false });
  }, [tab, search, filterCategory, filterCondition, filterMinPrice, filterMaxPrice, sortOption, pathname, router]);

  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [chats, setChats] = useState<Chat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(2);

  // Auto-detect columns based on window resize
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w >= 1280) setColumns(5);
      else if (w >= 1024) setColumns(4);
      else if (w >= 640) setColumns(3);
      else setColumns(2);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);
  const [viewingListing, setViewingListing] = useState<Listing | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatListing, setChatListing] = useState<Listing | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const [sortBy, sortOrder] = sortOption.split('_');
      const params: Record<string, any> = { sortBy, sortOrder, limit: 40, offset: 0 };
      if (search) params.search = search;
      if (filterCategory) params.category = filterCategory;
      if (filterCondition) params.condition = filterCondition;
      if (filterMinPrice) params.minPrice = filterMinPrice;
      if (filterMaxPrice) params.maxPrice = filterMaxPrice;

      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/marketplace/listings?${query}`);
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      setListings(Array.isArray(data) ? data : []);
      setTotal(raw?.meta?.total ?? 0);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterCondition, filterMinPrice, filterMaxPrice, sortOption]);

  const fetchMyListings = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/listings/my');
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      setMyListings(Array.isArray(data) ? data : []);
    } catch {
      // silent
    }
  }, []);

  const fetchSavedListings = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/bookmarks');
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      setSavedListings(Array.isArray(data) ? data : []);
    } catch {
      // silent
    }
  }, []);

  const fetchBookmarkedIds = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/bookmarks/ids');
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      setBookmarkedIds(new Set(Array.isArray(data) ? data : []));
    } catch {
      // silent
    }
  }, []);

  const fetchChats = useCallback(async () => {
    try {
      const res = await api.get('/marketplace/chats');
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      setChats(Array.isArray(data) ? data : []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      fetchListings();
      fetchBookmarkedIds();
      fetchChats();
    }
  }, [authLoading, user, fetchListings, fetchBookmarkedIds, fetchChats]);

  useEffect(() => {
    if (tab === 'my-listings') fetchMyListings();
    if (tab === 'saved') fetchSavedListings();
  }, [tab, fetchMyListings, fetchSavedListings]);

  // Debounce search is natively handled because the search state updates URL, 
  // and the fetchListings dependency array already includes all filter states.
  // We just want to debounce the API call itself if typing rapidly.
  useEffect(() => {
    const t = setTimeout(() => {
      if (!authLoading && user) {
        fetchListings();
      }
    }, 400);
    return () => clearTimeout(t);
  }, [search, filterCategory, filterCondition, filterMinPrice, filterMaxPrice, sortOption]);

  const handleBookmark = async (id: string) => {
    // Optimistic Update
    const isCurrentlyBookmarked = bookmarkedIds.has(id);
    
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) next.delete(id); else next.add(id);
      return next;
    });

    try {
      const res = await api.post(`/marketplace/bookmarks/${id}`, {});
      const raw = (res as any).data;
      const data = raw?.data ?? raw;
      const { bookmarked } = data;
      
      // Sync with server source of truth
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (bookmarked) next.add(id);
        else next.delete(id);
        return next;
      });
      toast.success(bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
      if (tab === 'saved') fetchSavedListings();
    } catch {
      // Revert if API fails
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) next.add(id); else next.delete(id);
        return next;
      });
      toast.error('Failed to update bookmark');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/marketplace/listings/${id}`);
      toast.success('Listing deleted');
      fetchMyListings();
      fetchListings();
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      await api.patch(`/marketplace/listings/${id}`, { status: 'Sold' });
      toast.success('Marked as sold');
      fetchMyListings();
      fetchListings();
    } catch {
      toast.error('Failed to update listing');
    }
  };

  const openChat = (listing: Listing) => {
    setChatListing(listing);
    setChatOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <AppShellSkeleton />
      </div>
    );
  }

  const currentUserId = (user as any)?.id ?? '';
  const activeListings =
    tab === 'browse' ? listings : tab === 'my-listings' ? myListings : savedListings;

  const rowCount = viewMode === 'grid' ? Math.ceil(activeListings.length / columns) : activeListings.length;
  
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => viewMode === 'grid' ? 320 : 100,
    overscan: 2,
  });

  return (
    <div className="  animate-in fade-in duration-500 flex flex-col min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)]">
      {/* Institutional Header */}
      <div className="pt-2 md:pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-primary/10 rounded-sm border border-primary/20 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <ShoppingBag className="w-8 h-8 text-primary shadow-glow relative z-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Marketplace</h1>
              <p className="text-sm text-muted-foreground font-medium italic mt-1 font-display">
                Buy & Sell within PEC campus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-10 rounded-sm px-4 font-bold text-xs gap-2 relative transition-all"
              onClick={() => {
                setChatListing(null);
                setChatOpen(true);
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Chats
              {chats.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                  {chats.length > 9 ? '9+' : chats.length}
                </span>
              )}
            </Button>
            <Button
              className="h-10 rounded-sm px-6 font-bold text-[10px] uppercase tracking-widest gap-2 bg-primary shadow-glow transition-all"
              onClick={() => {
                setEditingListing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              Sell Item
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border/40">
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
            <TabsList className="h-12 bg-transparent p-0 flex justify-start gap-6 rounded-none">
              <TabsTrigger
                value="browse"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 font-bold text-sm h-full"
              >
                Browse
              </TabsTrigger>
              <TabsTrigger
                value="my-listings"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 font-bold text-sm h-full"
              >
                My Listings
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 font-bold text-sm h-full"
              >
                <Heart className="w-3.5 h-3.5 mr-1.5" /> Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mt-6">
        <div className="space-y-4">
          {/* Search + Filters (browse tab only) */}
          {tab === 'browse' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search listings…"
                    className="pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Button
                  variant={showFilters ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setShowFilters((v) => !v)}
                  className="shrink-0"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1 border border-border rounded-sm p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn('p-1 rounded', viewMode === 'grid' && 'bg-muted')}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn('p-1 rounded', viewMode === 'list' && 'bg-muted')}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-sm border border-border">
                      <Select
                        value={filterCategory || '__all__'}
                        onValueChange={(v) => setFilterCategory(v === '__all__' ? '' : v)}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All Categories</SelectItem>
                          {CATEGORIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={filterCondition || '__all__'}
                        onValueChange={(v) => setFilterCondition(v === '__all__' ? '' : v)}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs">
                          <SelectValue placeholder="Condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Any Condition</SelectItem>
                          {CONDITIONS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-1">
                        <Input
                          placeholder="Min ₹"
                          value={filterMinPrice}
                          onChange={(e) => setFilterMinPrice(e.target.value)}
                          className="w-20 h-8 text-xs"
                          type="number"
                          min="0"
                        />
                        <span className="text-muted-foreground text-xs">–</span>
                        <Input
                          placeholder="Max ₹"
                          value={filterMaxPrice}
                          onChange={(e) => setFilterMaxPrice(e.target.value)}
                          className="w-20 h-8 text-xs"
                          type="number"
                          min="0"
                        />
                      </div>

                      <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-44 h-8 text-xs">
                          <ArrowUpDown className="w-3 h-3 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SORT_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => {
                          setFilterCategory('');
                          setFilterCondition('');
                          setFilterMinPrice('');
                          setFilterMaxPrice('');
                          setSortOption('createdAt_desc');
                        }}
                      >
                        <X className="w-3 h-3 mr-1" /> Clear
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.value}
                      onClick={() =>
                        setFilterCategory(filterCategory === cat.value ? '' : cat.value)
                      }
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors',
                        filterCategory === cat.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                {total} listing{total !== 1 && 's'} found
              </p>
            </div>
          )}

          {/* My Listings – status tabs */}
          {tab === 'my-listings' && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {myListings.length} listing{myListings.length !== 1 && 's'}
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setEditingListing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" /> New Listing
              </Button>
            </div>
          )}

          {/* Grid / List */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <AppShellSkeleton />
            </div>
          ) : activeListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
              <ShoppingBag className="w-12 h-12" />
              <div className="text-center">
                <p className="font-medium">
                  {tab === 'browse'
                    ? 'No listings found'
                    : tab === 'my-listings'
                      ? "You haven't listed anything yet"
                      : 'No saved listings'}
                </p>
                <p className="text-sm mt-1">
                  {tab === 'browse'
                    ? 'Try adjusting your filters or search query'
                    : tab === 'my-listings'
                      ? 'Click "New Listing" to start selling'
                      : 'Browse and save items you like'}
                </p>
              </div>
              {tab !== 'browse' && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (tab === 'my-listings') {
                      setEditingListing(null);
                      setFormOpen(true);
                    } else setTab('browse');
                  }}
                >
                  {tab === 'my-listings' ? 'Create Listing' : 'Browse Listings'}
                </Button>
              )}
            </div>
          ) : (
            <div 
              ref={parentRef} 
              className="flex-1 overflow-y-auto w-full scrollbar-hide" 
              style={{ minHeight: '400px' }}
            >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  if (viewMode === 'list') {
                    const listing = activeListings[virtualRow.index];
                    return (
                      <div
                        key={listing.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                          paddingBottom: '16px'
                        }}
                      >
                        <motion.div
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-4 bg-card border border-border rounded-sm p-3 hover:border-primary/30 hover:shadow-md transition-all h-full"
                        >
                          <div
                            className="w-16 h-16 shrink-0 rounded-sm overflow-hidden bg-muted cursor-pointer"
                            onClick={() => setViewingListing(listing)}
                          >
                            <img
                              src={
                                listing.images[0] ||
                                `https://placehold.co/64x64/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category[0])}`
                              }
                              alt={listing.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  `https://placehold.co/64x64/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category[0])}`;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-medium text-sm truncate cursor-pointer hover:text-primary"
                              onClick={() => setViewingListing(listing)}
                            >
                              {listing.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-primary font-bold text-sm flex items-center gap-0.5">
                                <IndianRupee className="w-3 h-3" />
                                {listing.price.toLocaleString('en-IN')}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] h-4',
                                  CONDITION_COLORS[listing.condition] ?? ''
                                )}
                              >
                                {listing.condition}
                              </Badge>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center">
                            {tab === 'browse' ? (
                              <>
                                {listing.sellerId !== currentUserId ? (
                                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openChat(listing)}>
                                    Chat
                                  </Button>
                                ) : (
                                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Your Listing
                                  </span>
                                )}
                              </>
                            ) : (
                              <div className="flex gap-1">
                            {listing.status === 'Available' && (listing.sellerId === currentUserId) && (
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMarkSold(listing.id)}>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Sold
                              </Button>
                            )}
                            {(listing.sellerId === currentUserId) && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setEditingListing(listing); setFormOpen(true); }}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            )}
                            {(listing.sellerId === currentUserId) && (
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(listing.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              }
              if (viewMode === 'grid') {
                const startIndex = virtualRow.index * columns;
                const rowListings = activeListings.slice(startIndex, startIndex + columns);
                    
                    return (
                      <div
                        key={virtualRow.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                          paddingBottom: '24px'
                        }}
                      >
                        <div className="grid gap-4 h-full" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                          {rowListings.map((listing) => (
                            <ProductCard
                              key={listing.id}
                              listing={listing}
                              isBookmarked={bookmarkedIds.has(listing.id)}
                              currentUserId={currentUserId}
                              onBookmark={() => handleBookmark(listing.id)}
                              onView={() => setViewingListing(listing)}
                              onChat={() => openChat(listing)}
                              onEdit={() => {
                                setEditingListing(listing);
                                setFormOpen(true);
                              }}
                              onDelete={() => handleDelete(listing.id)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                })}
          </div>
        </div>
      )}
    </div>
  </div>

  {/* Dialogs & Panels */}
      <ListingFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingListing(null);
        }}
        onSuccess={() => {
          fetchListings();
          fetchMyListings();
        }}
        existing={editingListing}
      />

      <ListingDetailDialog
        listing={viewingListing}
        isBookmarked={viewingListing ? bookmarkedIds.has(viewingListing.id) : false}
        currentUserId={currentUserId}
        onClose={() => setViewingListing(null)}
        onBookmark={handleBookmark}
        onChat={openChat}
      />

      <ChatPanel
        open={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setChatListing(null);
        }}
        listing={chatListing}
        currentUserId={currentUserId}
        chats={chats}
        onChatsRefresh={fetchChats}
      />
    </div>
  );
}
