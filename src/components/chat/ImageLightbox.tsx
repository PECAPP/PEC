import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  imageUrl: string;
  onClose: () => void;
}

export function ImageLightbox({ imageUrl, onClose }: Props) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>
      
      <img
        src={imageUrl}
        alt="Full size"
        className="max-w-full max-h-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      
      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        Open in new tab
      </a>
    </div>
  );
}
