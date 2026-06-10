import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ImagePlus, X } from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@pec/ui';
import { toast } from 'sonner';
import { Listing } from '../types';
import { CATEGORIES, CONDITIONS } from '../constants';
import api from '@pec/api';

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
  const [previewImages, setPreviewImages] = useState<string[]>(existing?.images || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setPreviewImages(existing?.images || []);
    }
  }, [open, existing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Client-side image optimization (resize & convert to WebP)
    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      
      const compressedDataUrl = await compressImageToWebP(file);
      if (compressedDataUrl) newImages.push(compressedDataUrl);
    }
    
    setPreviewImages(prev => [...prev, ...newImages]);
  };

  const compressImageToWebP = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension 800px to save bandwidth
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to WebP at 80% quality
          resolve(canvas.toDataURL('image/webp', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

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
        images: previewImages,
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
      <DialogContent className=" max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-sm">
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
              className="h-11 rounded-sm bg-background border-border/60 font-bold px-4 text-sm focus:ring-primary/20"
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
                <SelectTrigger className="h-11 rounded-sm border-border/60 font-bold text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="rounded-sm" portaled={false}>
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
                <SelectTrigger className="h-11 rounded-sm border-border/60 font-bold text-sm">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="rounded-sm" portaled={false}>
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
              className="h-11 rounded-sm bg-background border-border/60 font-bold px-4 text-sm focus:ring-primary/20"
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
              className="rounded-sm bg-background border-border/60 text-sm focus:ring-primary/20 p-4"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
              Images (Optimized Client-Side)
            </label>
            <div 
              className="border border-dashed border-border/60 rounded-sm p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
              />
              <ImagePlus className="w-8 h-8 text-muted-foreground  mb-2 opacity-50" />
              <p className="text-sm font-medium text-muted-foreground">
                Click or drag images to upload
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Images are automatically compressed to WebP
              </p>
            </div>
            
            {previewImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {previewImages.map((src, idx) => (
                  <div key={idx} className="relative w-20 h-20 shrink-0 rounded-sm overflow-hidden border border-border group">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      className="absolute top-1 right-1 w-5 h-5 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(idx)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-border/40">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-sm font-bold uppercase tracking-widest text-[10px]"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-sm font-bold uppercase tracking-widest text-[10px] bg-primary shadow-glow transition-all"
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
