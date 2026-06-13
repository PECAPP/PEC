import { Skeleton } from "@pec/ui";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="w-full h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64 rounded-sm" />
        <Skeleton className="h-8 w-24 rounded-sm" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-sm" />
        <Skeleton className="h-32 rounded-sm" />
        <Skeleton className="h-32 rounded-sm" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[400px] lg:col-span-2 rounded-sm" />
        <Skeleton className="h-[400px] rounded-sm" />
      </div>

      <div className="flex items-center justify-center pt-8 opacity-20">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    </div>
  );
}
