import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "./utils"
import { Badge } from "./badge"

export interface GlassBoardColumnProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  count?: number;
  children: React.ReactNode;
}

export function GlassBoardColumn({ 
  className, 
  title, 
  count,
  children,
  ...props 
}: GlassBoardColumnProps) {
  return (
    <div 
      className={cn(
        "flex-1 min-w-[320px] bg-card/40 border border-white/5 rounded-sm p-4 flex flex-col h-[650px] shadow-sm glass-panel",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-lg text-foreground/90">{title}</h3>
        {count !== undefined && (
          <Badge variant="secondary" className="rounded-sm bg-background border-border/50 text-foreground font-bold px-2 py-0.5 shadow-sm">
            {count}
          </Badge>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {children}
      </div>
    </div>
  )
}

export interface GlassBoardCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function GlassBoardCard({ 
  className, 
  children,
  ...props 
}: GlassBoardCardProps) {
  return (
    <motion.div 
      className={cn(
        "p-5 rounded-sm border-b border-white/5 bg-background/60 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 group hover:bg-background/80",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
