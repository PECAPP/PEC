import { Button, Skeleton } from "@pec/ui";
import { CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from "react";

interface StatePanelProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

function StatePanel({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
  className,
}: StatePanelProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center rounded-sm border border-dashed border-border bg-card/30', className)}>
      {Icon ? (() => { 
        const IconComponent = Icon as any; 
        return (
          <div className="mb-4 p-4 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 shadow-glow relative">
             <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
             <IconComponent className="w-8 h-8 relative z-10" />
          </div>
        ); 
      })() : null}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description ? <p className="text-sm text-muted-foreground max-w-[250px] mb-4 leading-relaxed mx-auto">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button size="sm" className="rounded-sm shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

interface LoadingGridProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

function LoadingGrid({ count = 4, className, itemClassName }: LoadingGridProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className={cn('h-24 rounded-sm', itemClassName)} />
      ))}
    </div>
  );
}

function EmptyState({
  title = 'No data found',
  description = 'There is nothing to show right now.',
  actionLabel,
  onAction,
  className,
}: Omit<StatePanelProps, 'icon'>) {
  return (
    <StatePanel
      title={title}
      description={description}
      icon={Inbox}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
    />
  );
}

function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  actionLabel = 'Retry',
  onAction,
  className,
}: Omit<StatePanelProps, 'icon'>) {
  return (
    <StatePanel
      title={title}
      description={description}
      icon={AlertCircle}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
    />
  );
}

function SuccessState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: Omit<StatePanelProps, 'icon'>) {
  return (
    <StatePanel
      title={title}
      description={description}
      icon={CheckCircle2}
      actionLabel={actionLabel}
      onAction={onAction}
      className={className}
    />
  );
}

export { StatePanel, LoadingGrid, EmptyState, ErrorState, SuccessState };
