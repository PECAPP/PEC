import React, { useState } from 'react';
import { IndianRupee, Heart, MessageCircle } from 'lucide-react';
import { Badge, Button, Dialog, DialogContent, DialogTitle } from '@pec/ui';
import { cn } from '@/lib/utils';
import { Listing } from '../types';
import { CONDITION_COLORS } from '../constants';

export default function ListingDetailDialog({
  listing,
  isBookmarked,
  currentUserId,
  onClose,
  onBookmark,
  onChat,
}: {
  listing: Listing | null;
  isBookmarked: boolean;
  currentUserId: string;
  onClose: () => void;
  onBookmark: (id: string) => void;
  onChat: (listing: Listing) => void;
}) {
  const [imgIdx, setImgIdx] = useState(0);
  if (!listing) return null;
  const isMine = listing.sellerId === currentUserId;
  const images =
    listing.images.length > 0
      ? listing.images
      : [`https://placehold.co/600x400/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category)}`];

  return (
    <Dialog open={!!listing} onOpenChange={onClose}>
      <DialogContent className=" max-h-[90vh] overflow-y-auto p-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-sm">
        <DialogTitle className="sr-only">{listing.title}</DialogTitle>
        {/* Image Carousel */}
        <div className="relative bg-muted/30 h-[250px] sm:h-[350px] w-full flex items-center justify-center overflow-hidden rounded-t-2xl">
          <img
            src={images[imgIdx]}
            alt={listing.title}
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                `https://placehold.co/600x400/f3f4f6/9ca3af?text=${encodeURIComponent(listing.category)}`;
            }}
          />
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i === imgIdx ? 'bg-white' : 'bg-white/50'
                  )}
                />
              ))}
            </div>
          )}
          {listing.status === 'Sold' && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <Badge className="bg-red-500/15 text-red-600 border-red-500/20 text-lg px-4 py-1.5">SOLD</Badge>
            </div>
          )}
        </div>

        <div className="p-3 md:p-6 space-y-5">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">{listing.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-sm font-medium ',
                    CONDITION_COLORS[listing.condition] ?? ''
                  )}
                >
                  {listing.condition}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-secondary/20 text-secondary-foreground text-sm font-medium  hover:bg-secondary/30"
                >
                  {listing.category}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-3xl font-bold text-primary shrink-0 bg-primary/10 px-4 py-2 rounded-sm">
              <IndianRupee className="w-6 h-6" />
              <span className="tracking-tight">{listing.price.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {listing.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
          )}

          {/* Seller Info */}
          <div className="flex items-center gap-4 p-4 rounded-sm bg-card border border-border shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-border/40 flex items-center justify-center text-primary font-bold text-lg shrink-0">
              {listing.seller.avatar ? (
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                listing.seller.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base text-foreground">{listing.seller.name}</p>
              {listing.seller.studentProfile?.phone && (
                <p className="text-sm font-medium text-muted-foreground mt-0.5 flex items-center gap-1">
                   {listing.seller.studentProfile.phone}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isMine && listing.status !== 'Sold' && (
            <div className="flex gap-4 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                className="flex-1 h-11 rounded-sm font-bold  text-[10px]"
                onClick={() => onBookmark(listing.id)}
              >
                <Heart
                  className={cn('w-4 h-4 mr-2', isBookmarked ? 'fill-red-500 text-red-500' : '')}
                />
                {isBookmarked ? 'Saved' : 'Save Item'}
              </Button>
              <Button
                className="flex-1 h-11 rounded-sm font-bold  text-[10px] bg-primary shadow-md border border-border/40 transition-all"
                onClick={() => {
                  onChat(listing);
                  onClose();
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Seller
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
