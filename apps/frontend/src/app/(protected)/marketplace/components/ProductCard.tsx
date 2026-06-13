import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Edit2, Trash2, Eye, IndianRupee } from 'lucide-react';
import { Button, Badge } from '@pec/ui';
import { cn } from '@/lib/utils';
import { Listing } from '../types';
import { CONDITION_COLORS } from '../constants';

export default function ProductCard({
  listing,
  isBookmarked,
  currentUserId,
  onBookmark,
  onChat,
  onView,
  onEdit,
  onDelete,
  onToggleHold,
}: {
  listing: Listing;
  isBookmarked: boolean;
  currentUserId: string;
  onBookmark: (id: string) => void;
  onChat: (listing: Listing) => void;
  onView: (listing: Listing) => void;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
  onToggleHold?: (id: string, currentStatus: string) => void;
}) {
  const isMine = listing.sellerId === currentUserId;
  const imgSrc = listing.images[0] || '/placeholder-product.png';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-card/90 backdrop-blur-sm border border-border rounded-sm overflow-hidden shadow-sm hover:shadow-xl hover:border-border/40 transition-all duration-300"
    >
      {/* Image */}
      <div
        className="relative aspect-[4/3] bg-muted cursor-pointer overflow-hidden"
        onClick={() => onView(listing)}
      >
        <img
          src={imgSrc}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://placehold.co/400x300/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category)}`;
          }}
        />
        {listing.status === 'Sold' && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Badge className="bg-red-500/15 text-red-600 border-red-500/20 text-sm px-3 py-1">SOLD</Badge>
          </div>
        )}
        {listing.status === 'On Hold' && (
          <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
            <Badge className="bg-amber-500/80 text-white border-amber-500/20 text-sm px-3 py-1">ON HOLD</Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={cn(
              'text-sm font-medium  border shadow-sm backdrop-blur-md bg-background/80',
              CONDITION_COLORS[listing.condition] ?? ''
            )}
          >
            {listing.condition}
          </Badge>
        </div>
        {!isMine && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmark(listing.id);
            }}
            className="absolute top-3 left-3 p-2 rounded-full bg-background/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110 active:scale-95"
          >
            <Heart
              className={cn(
                'w-4 h-4 transition-colors',
                isBookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
              )}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold text-base leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors text-foreground"
            onClick={() => onView(listing)}
          >
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-primary font-bold bg-primary/10 w-fit px-2.5 py-1 rounded-sm">
          <IndianRupee className="w-4 h-4" />
          <span className="text-lg tracking-tight">{listing.price.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Badge
            variant="secondary"
            className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 transition-colors"
          >
            {listing.category}
          </Badge>
          <span className="text-border">·</span>
          <span className="truncate">{listing.seller.name}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/40">
          {isMine ? (
            <>
              {onToggleHold && listing.status !== 'Sold' && (
                <Button
                  size="sm"
                  variant={listing.status === 'On Hold' ? 'default' : 'outline'}
                  className={cn("flex-1 h-8 rounded-sm font-medium text-xs", listing.status === 'On Hold' ? 'bg-amber-500 hover:bg-amber-600' : '')}
                  onClick={() => onToggleHold(listing.id, listing.status)}
                >
                  {listing.status === 'On Hold' ? 'Resume' : 'Hold'}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 rounded-sm font-medium text-xs "
                onClick={() => onEdit(listing)}
              >
                <Edit2 className="w-3 h-3 mr-1" /> Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-sm text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                onClick={() => onDelete(listing.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 rounded-sm font-medium text-sm "
                onClick={() => onView(listing)}
              >
                <Eye className="w-3 h-3 mr-1.5" /> View
              </Button>
              {listing.status !== 'Sold' && (
                <Button
                  size="sm"
                  className="flex-1 h-8 rounded-sm font-medium text-sm  bg-primary shadow-md border border-border/40 transition-all"
                  onClick={() => onChat(listing)}
                >
                  <MessageCircle className="w-3 h-3 mr-1.5" /> Chat
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
