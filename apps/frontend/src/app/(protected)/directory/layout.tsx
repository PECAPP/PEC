'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, UserCog, Building2 } from 'lucide-react';
import { PageBanner } from '@pec/ui';

export default function DirectoryLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const tabs = [
    { name: 'Users', path: '/directory/users', icon: Users },
    { name: 'Faculty', path: '/directory/faculty', icon: UserCog },
    { name: 'Departments', path: '/directory/departments', icon: Building2 },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 w-full">
      <PageBanner
        title="Directory"
        subtitle="Manage institution users, faculty members, and departments from a centralized view."
        icon={<Building2 className="w-7 h-7 text-primary" />}
        badgeText="Core System"
      />
      
      <div className="inline-flex h-10 items-center justify-start rounded-xl bg-muted/40 p-1 text-muted-foreground border border-white/5 shadow-inner overflow-x-auto overflow-y-hidden flex-nowrap tabs-list-scroll max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.path);
          const Icon = tab.icon;
          return (
            <Link 
              key={tab.path} 
              href={tab.path as any}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-all gap-2 hover:text-foreground",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md border border-white/10" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              {tab.name}
            </Link>
          );
        })}
      </div>
      <div className="flex-1 mt-6">
        {children}
      </div>
    </div>
  );
}
