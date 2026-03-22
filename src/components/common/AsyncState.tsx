import { CheckCircle2, AlertCircle, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
    <div className={cn('ui-state-box rounded-md text-center', className)}>
      {Icon ? <Icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" /> : null}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="text-xs text-muted-foreground mt-1">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="outline" size="sm" className="mt-3" onClick={onAction}>
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
        <Skeleton key={index} className={cn('h-24 rounded-md', itemClassName)} />
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
