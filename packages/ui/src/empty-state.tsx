import * as React from "react"
import { cn } from "./utils"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ 
  className, 
  icon, 
  title, 
  description,
  action,
  ...props 
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "text-center py-10 px-4 text-muted-foreground/40 border border-dashed border-white/5 rounded-sm bg-background/20 flex flex-col items-center justify-center min-h-[160px]",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="mb-3 opacity-20 text-muted-foreground">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-muted-foreground/60">{title}</p>
      {description && (
        <p className="text-xs mt-1 text-muted-foreground/40 max-w-[250px] text-center">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}
