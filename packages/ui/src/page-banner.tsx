import * as React from "react"
import { cn } from "./utils"

export interface PageBannerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badgeText?: string;
  actions?: React.ReactNode;
}

export function PageBanner({ 
  className, 
  title, 
  subtitle, 
  icon, 
  badgeText, 
  actions, 
  ...props 
}: PageBannerProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden p-4 md:p-6 rounded-sm bg-card/60 backdrop-blur-md border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-sm glass-premium",
        className
      )}
      {...props}
    >
      {/* Subtle Dot Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-screen" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />
      
      <div className="z-10">
        {badgeText && (
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wider mb-2">
            {badgeText}
          </div>
        )}
        <h1 className="text-5xl md:text-6xl tracking-tight font-bold text-foreground flex items-center gap-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground mt-3 text-lg">{subtitle}</p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 z-10">
          {actions}
        </div>
      )}
    </div>
  )
}
