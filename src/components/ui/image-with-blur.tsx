
import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Database, Laptop, Calculator, Microscope, Palette, Globe, Book, Activity } from 'lucide-react';

interface ImageWithBlurProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackColor?: string;
}

export function ImageWithBlur({ src, alt, className, fallbackColor = "bg-muted", ...props }: ImageWithBlurProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const fallbackAvatarSrc = useMemo(
    () =>
      `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=random&size=400&font-size=0.33`,
    [alt],
  );

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  if (error) {
     return (
        <div className={cn(`w-full h-full flex items-center justify-center ${fallbackColor} text-muted-foreground/50`, className)}>
            <img 
              src={fallbackAvatarSrc}
              alt={alt}
              className="w-full h-full object-cover opacity-80" 
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
        </div>
     )
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div 
        className={cn(
            "absolute inset-0 bg-muted/20 backdrop-blur-xl transition-opacity duration-700",
            loaded ? "opacity-0" : "opacity-100"
        )}
      />
      <img
        src={src}
        alt={alt}
        loading={props.loading ?? "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        className={cn(
          "w-full h-full object-cover transition-all duration-700 ease-in-out scale-105",
          loaded ? "grayscale-0 blur-0 scale-100" : "grayscale blur-lg"
        )}
        sizes={props.sizes ?? "(max-width: 768px) 100vw, 50vw"}
        {...props}
      />
    </div>
  );
}

export function CourseSkeleton() {
  return (
    <div className="card-elevated overflow-hidden border border-border/50">
      <div className="h-32 w-full bg-muted/50 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted/50 animate-pulse rounded" />
        <div className="space-y-2">
          <div className="flex gap-2">
             <div className="h-3 w-3 bg-muted/50 rounded-full" />
             <div className="h-3 w-1/2 bg-muted/50 animate-pulse rounded" />
          </div>
          <div className="flex gap-2">
             <div className="h-3 w-3 bg-muted/50 rounded-full" />
             <div className="h-3 w-1/3 bg-muted/50 animate-pulse rounded" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 flex-1 bg-muted/50 animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}
