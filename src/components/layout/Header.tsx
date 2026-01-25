import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, ChevronDown, LogOut, Settings, HelpCircle, Menu, Palette, Building2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import ThemeToggler from "../../components/ThemeToggler";
import { LandingColorTheme } from '@/components/LandingColorTheme';
import { GoogleTranslate } from '@/components/GoogleTranslate';
import type { User as UserType } from '@/types';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { searchableRoutes } from '@/utils/searchableRoutes';
import { useEffect } from 'react';

interface HeaderProps {
  user: UserType;
  sidebarCollapsed: boolean;
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export function Header({ user, sidebarCollapsed, isMobile, onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [hasNotifications] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    college_admin: 'College Admin',
    placement_officer: 'Placement Officer',
    faculty: 'Faculty',
    student: 'Student',
    recruiter: 'Recruiter',
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-16 border-b border-sidebar-border bg-background/60 backdrop-blur-md transition-all duration-300",
        isMobile ? "left-0" : (sidebarCollapsed ? "left-16" : "left-64")
      )}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}
        {/* Search */}
        <div className="relative flex-1 max-w-md mx-2 md:w-80 md:flex-none group z-50">
           <CommandMenu navigate={navigate} />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:block scale-90 sm:scale-100"><GoogleTranslate /></div>
          <div className="hidden md:block"><LandingColorTheme /></div>
          <div className="hidden md:block"><ThemeToggler/></div>
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function CommandMenu({ navigate }: { navigate: any }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div 
        className="relative" 
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search... (Ctrl+K)"
          className="pl-10 bg-background border border-input shadow-sm focus-visible:ring-1 focus-visible:ring-primary cursor-pointer text-foreground placeholder:text-muted-foreground"
          readOnly
        />
      </div>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search pages, students, or data..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>
             <div className="py-2 px-4 text-sm">
                No results found. 
                <Button 
                  variant="link" 
                  className="px-1 h-auto font-normal text-primary" 
                  onClick={() => {
                    setOpen(false);
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                  }}
                >
                  Search for "{query}"
                </Button>
             </div>
          </CommandEmpty>
          
          <CommandGroup heading="Pages">
            {searchableRoutes.filter(route => 
               route.title.toLowerCase().includes(query.toLowerCase()) || 
               route.keywords.some(k => k.includes(query.toLowerCase()))
            ).slice(0, 5).map((route) => (
              <CommandItem
                key={route.path}
                onSelect={() => {
                  setOpen(false);
                  navigate(route.path);
                }}
              >
                <route.icon className="mr-2 h-4 w-4" />
                <span>{route.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Actions">
             <CommandItem
                onSelect={() => {
                  setOpen(false);
                  navigate(`/search?q=${encodeURIComponent(query)}`);
                }}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search all for "{query}"</span>
                <CommandShortcut>↵</CommandShortcut>
              </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
