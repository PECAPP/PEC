import * as React from "react"
import { Badge, BadgeProps } from "./badge"
import { cn } from "./utils"

export interface StatusBadgeProps extends BadgeProps {
  status: 'pending' | 'success' | 'warning' | 'danger' | 'info' | 'default';
}

const statusStyles = {
  success: "bg-green-500/20 text-green-500 hover:bg-green-500/30 border-green-500/20 shadow-none",
  warning: "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border-orange-500/20 shadow-none",
  danger: "bg-red-500/20 text-red-500 hover:bg-red-500/30 border-red-500/20 shadow-none",
  info: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 border-blue-500/20 shadow-none",
  pending: "bg-indigo-500/20 text-indigo-500 hover:bg-indigo-500/30 border-indigo-500/20 shadow-none",
  default: "bg-muted text-muted-foreground border-border/40 shadow-none",
};

export function StatusBadge({ 
  className, 
  status, 
  children,
  ...props 
}: StatusBadgeProps) {
  return (
    <Badge 
      className={cn(statusStyles[status], className)}
      {...props}
    >
      {children}
    </Badge>
  )
}
