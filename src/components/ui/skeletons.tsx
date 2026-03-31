
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function JobCardSkeleton() {
  return (
    <div className="card-elevated p-6 border-l-4 border-l-muted">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        <Skeleton className="w-14 h-14 rounded-2xl" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-4">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2 pt-1">
             <Skeleton className="h-5 w-16" />
             <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <div className="flex gap-3">
           <Skeleton className="h-10 w-28" />
           <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-10" />
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="w-full h-48 rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="space-y-4">
         <Skeleton className="h-8 w-48" />
         <div className="grid gap-4 md:grid-cols-2">
            <JobCardSkeleton />
            <JobCardSkeleton />
         </div>
      </div>
    </div>
  )
}

export function AppShellSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function SearchResultsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <div className="space-y-4">
        <JobCardSkeleton />
        <JobCardSkeleton />
      </div>
    </div>
  )
}
