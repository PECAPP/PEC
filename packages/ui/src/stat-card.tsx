import * as React from "react"
import { cn } from "./utils"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  colorVariant?: 'primary' | 'success' | 'warning' | 'info' | 'danger';
}

const colorStyles = {
  primary: "bg-primary/10 border-primary/20 text-primary",
  success: "bg-green-500/10 border-green-500/20 text-green-500",
  warning: "bg-orange-500/10 border-orange-500/20 text-orange-500",
  info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  danger: "bg-red-500/10 border-red-500/20 text-red-500",
};

export function StatCard({ 
  className, 
  label, 
  value, 
  icon, 
  colorVariant = 'primary', 
  ...props 
}: StatCardProps) {
  return (
    <div 
      className={cn(
        "p-5 md:p-6 rounded-sm border-b border-white/5 bg-card/60 backdrop-blur-sm shadow-sm flex items-center gap-5 hover:bg-card/80 transition-colors group",
        className
      )}
      {...props}
    >
      {icon && (
        <div className={cn(
          "p-4 rounded-lg border group-hover:scale-105 transition-transform flex items-center justify-center",
          colorStyles[colorVariant]
        )}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
      </div>
    </div>
  )
}
