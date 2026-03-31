import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Professional Content-Shaped Skeletons for PEC APP
 * Eliminates Layout Shift (CLS) by mirroring actual component geometry.
 */

export function StatsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className={cn("grid gap-4 mb-6", count === 3 ? "md:grid-cols-3" : "md:grid-cols-2")}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-elevated p-6 border-b-4 border-r-4 border-primary/20 flex items-center gap-4 bg-muted/30">
          <Skeleton className="w-12 h-12 rounded-sm bg-muted-foreground/10" />
          <div className="space-y-2">
            <Skeleton className="h-2 w-20 bg-muted-foreground/10" />
            <Skeleton className="h-8 w-12 bg-muted-foreground/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number, cols?: number }) {
  return (
    <div className="card-elevated overflow-hidden border-2 rounded-sm border-border/50">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b-2 border-border">
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="p-5 text-left">
                  <Skeleton className="h-3 w-20 bg-muted-foreground/10" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="bg-background">
                {Array.from({ length: cols }).map((_, j) => (
                  <td key={j} className="p-5">
                    <Skeleton className={cn("h-5 bg-muted-foreground/5", j === 1 ? "w-48" : "w-24")} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-3">
        <Skeleton className="h-9 w-64 bg-muted-foreground/10" />
        <Skeleton className="h-4 w-40 bg-muted-foreground/5" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-11 w-28 bg-muted-foreground/5 rounded-sm" />
        <Skeleton className="h-11 w-28 bg-muted-foreground/5 rounded-sm" />
      </div>
    </div>
  );
}

export function AttendanceManagerSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 bg-muted-foreground/10" />
          <Skeleton className="h-3 w-32 bg-muted-foreground/5" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-28 bg-muted-foreground/5 rounded-sm" />
          <Skeleton className="h-11 w-28 bg-muted-foreground/5 rounded-sm" />
        </div>
      </div>
      <div className="card-elevated p-10 border-2 border-primary/20 bg-muted/5 space-y-10">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24 bg-muted-foreground/10" />
            <Skeleton className="h-14 w-full bg-muted-foreground/5 rounded-sm" />
          </div>
          <div className="w-full md:w-64 space-y-2">
            <Skeleton className="h-3 w-24 bg-muted-foreground/10" />
            <Skeleton className="h-14 w-full bg-muted-foreground/5 rounded-sm" />
          </div>
        </div>
        <TableSkeleton rows={4} cols={2} />
      </div>
    </div>
  );
}

export function StudentAttendanceSkeleton() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48 bg-muted-foreground/10" />
          <Skeleton className="h-3 w-32 bg-muted-foreground/5" />
        </div>
        <Skeleton className="h-12 w-40 bg-muted-foreground/10 rounded-sm" />
      </div>
      <div className="card-elevated p-12 border-2 border-primary/20 bg-muted/5 flex flex-col lg:flex-row items-center gap-16">
        <Skeleton className="w-48 h-48 rounded-full bg-muted-foreground/10" />
        <div className="flex-1 grid grid-cols-2 gap-12">
          <div className="space-y-2"><Skeleton className="h-3 w-24 bg-muted-foreground/10" /><Skeleton className="h-12 w-16 bg-muted-foreground/10" /></div>
          <div className="space-y-2"><Skeleton className="h-3 w-24 bg-muted-foreground/10" /><Skeleton className="h-12 w-16 bg-muted-foreground/10" /></div>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-elevated p-8 border-2 border-border/50 bg-muted/5 space-y-8">
            <div className="flex justify-between border-b pb-4 border-border/50">
               <Skeleton className="h-6 w-24 bg-muted-foreground/10" />
               <Skeleton className="h-8 w-12 bg-muted-foreground/10" />
            </div>
            <Skeleton className="h-4 w-full bg-muted-foreground/5 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GenericLoading() {
  return (
    <div className="animate-in fade-in duration-500">
      <HeaderSkeleton />
      <StatsSkeleton count={3} />
      <div className="h-6" />
      <Skeleton className="h-12 w-full mb-6 bg-muted-foreground/5 rounded-sm" />
      <TableSkeleton />
    </div>
  );
}

