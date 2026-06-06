
'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Segment Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4">
      <div className="card-elevated p-8 max-w-md w-full border-t-4 border-t-destructive shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-4">
           <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
           </div>
           <h2 className="text-xl font-bold text-foreground">Something went wrong!</h2>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg mb-6 text-sm font-mono border border-border/50 text-muted-foreground break-words overflow-auto max-h-32">
           {error.message || "An unexpected error occurred while loading this segment."}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="default" 
            onClick={() => reset()} 
            className="flex-1 gap-2 shadow-lg shadow-primary/20"
          >
            <RotateCcw className="w-4 h-4" /> Try again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1"
          >
            Go to Home
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground opacity-50">Error UID: {error.digest || 'no-digest'}</p>
    </div>
  );
}
