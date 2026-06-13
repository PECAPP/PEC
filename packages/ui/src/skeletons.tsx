"use client";


import { Skeleton } from "./skeleton"
import { Card, CardContent } from "./card"

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-sm" />
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
      <Skeleton className="w-full h-48 rounded-sm" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="space-y-4">
         <Skeleton className="h-8 w-48" />
         <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-32 rounded-sm" />
            <Skeleton className="h-32 rounded-sm" />
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
          <Skeleton className="h-28 rounded-sm" />
          <Skeleton className="h-28 rounded-sm" />
          <Skeleton className="h-28 rounded-sm" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 rounded-sm" />
          <Skeleton className="h-20 rounded-sm" />
          <Skeleton className="h-20 rounded-sm" />
          <Skeleton className="h-20 rounded-sm" />
        </div>
      </div>
    </div>
  )
}

export function SearchResultsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-sm" />
        <Skeleton className="h-32 rounded-sm" />
        <Skeleton className="h-32 rounded-sm" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-sm" />
        <Skeleton className="h-32 rounded-sm" />
      </div>
    </div>
  )
}
