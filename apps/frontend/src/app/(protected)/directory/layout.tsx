'use client';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, UserCog, Building2 } from 'lucide-react';

export default function DirectoryLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const tabs = [
    { name: 'Users', path: '/directory/users', icon: Users },
    { name: 'Faculty', path: '/directory/faculty', icon: UserCog },
    { name: 'Departments', path: '/directory/departments', icon: Building2 },
  ];

  return (
    <div className="flex flex-col h-full space-y-6   w-full p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Directory</h1>
        <p className="text-muted-foreground">Manage institution users, faculty members, and departments from a centralized view.</p>
      </div>
      
      <div className="border-b border-border">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <Link 
                key={tab.path} 
                href={tab.path as any}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2",
                  isActive 
                    ? "border-primary text-foreground" 
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex-1 mt-6">
        {children}
      </div>
    </div>
  );
}
