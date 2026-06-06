import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Listing } from '../types';
import { CATEGORIES, CONDITIONS } from '../constants';
import api from '@/lib/api';

export default function ListingFormDialog({
  open,
  onClose,
  onSuccess,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existing?: Listing | null;
}) {
  const [form, setForm] = useState({
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    price: existing?.price?.toString() ?? '',
    category: existing?.category ?? '',
    condition: existing?.condition ?? '',
    images: existing?.images?.join('\n') ?? '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: existing?.title ?? '',
        description: existing?.description ?? '',
        price: existing?.price?.toString() ?? '',
        category: existing?.category ?? '',
        condition: existing?.condition ?? '',
        images: existing?.images?.join('\n') ?? '',
      });
    }
  }, [open, existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.category || !form.condition) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        condition: form.condition,
        images: form.images
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (existing) {
        await api.patch(`/marketplace/listings/${existing.id}`, payload);
        toast.success('Listing updated!');
      } else {
        await api.post('/marketplace/listings', payload);
        toast.success('Listing created!');
      }
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {existing ? 'Edit Listing' : 'Create New Listing'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
              Title *
            </label>
            <Input
              placeholder="e.g. Physics textbook by H.C. Verma"
              className="h-11 rounded-xl bg-background border-border/60 font-bold px-4 text-sm focus:ring-primary/20"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                Category *
              </label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="h-11 rounded-xl border-border/60 font-bold text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl" portaled={false}>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                Condition *
              </label>
              <Select
                value={form.condition}
                onValueChange={(v) => setForm({ ...form, condition: v })}
              >
                <SelectTrigger className="h-11 rounded-xl border-border/60 font-bold text-sm">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="rounded-xl" portaled={false}>
                  {CONDITIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
              Price (₹) *
            </label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 250"
              className="h-11 rounded-xl bg-background border-border/60 font-bold px-4 text-sm focus:ring-primary/20"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
              Description
            </label>
            <Textarea
              rows={3}
              placeholder="Describe your item — condition details, reason for selling, etc."
              className="rounded-xl bg-background border-border/60 text-sm focus:ring-primary/20 p-4"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
              Image URLs (one per line)
            </label>
            <Textarea
              rows={2}
              placeholder="https://example.com/image.jpg"
              className="rounded-xl bg-background border-border/60 text-sm focus:ring-primary/20 p-4"
              value={form.images}
              onChange={(e) => setForm({ ...form, images: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Paste direct image links. Use Cloudinary or Imgur for uploads.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px]"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-xl font-bold uppercase tracking-widest text-[10px] bg-primary shadow-glow transition-all"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {existing ? 'Update' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
