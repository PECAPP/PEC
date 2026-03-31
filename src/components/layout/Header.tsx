import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Menu,
  Palette,
  Building2,
} from 'lucide-react';


// import { auth } from '@/config/storage';
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
import { authClient } from '@/lib/auth-client';
import type { User as UserType } from '@/types';

const CommandMenu = dynamic(() => import('@/components/layout/CommandMenu'), {
  ssr: false,
  loading: () => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search... (Ctrl+K)"
        className="pl-10 bg-background border border-input shadow-sm focus-visible:ring-1 focus-visible:ring-primary text-foreground placeholder:text-muted-foreground"
        readOnly
      />
    </div>
  ),
});

const ThemeToggler = dynamic(() => import('../../components/ThemeToggler'), {
  ssr: false,
  loading: () => null,
});

const LandingColorTheme = dynamic(
  () => import('@/components/LandingColorTheme').then((mod) => mod.LandingColorTheme),
  {
    ssr: false,
    loading: () => null,
  },
);

const GoogleTranslate = dynamic(
  () => import('@/components/GoogleTranslate').then((mod) => mod.GoogleTranslate),
  {
    ssr: false,
    loading: () => null,
  },
);

interface HeaderProps {
  user: UserType;
  sidebarCollapsed: boolean;
  isMobile?: boolean;
  onMenuClick?: () => void;
  densityMode: 'comfortable' | 'compact';
  onDensityModeChange: (mode: 'comfortable' | 'compact') => void;
}

export function Header({ user, sidebarCollapsed, isMobile, onMenuClick, densityMode, onDensityModeChange }: HeaderProps) {
  const router = useRouter();

  const appLogoSrc = '/logo.png';
  const showNavbarLogo = Boolean(isMobile) || sidebarCollapsed;

  const handleSignOut = async () => {
    try {
      await authClient.logout();
      window.dispatchEvent(new Event('auth-failed'));
      toast.success('Signed out successfully');
      router.push('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const roleLabels: Record<string, string> = {
    college_admin: 'College Admin',
    faculty: 'Faculty',
    student: 'Student',
    admin: 'System Admin',
    moderator: 'Moderator',
    user: 'Regular User',
    placement_officer: 'Placement Officer',
    recruiter: 'Recruiter',
    super_admin: 'Super Admin',
  };

  const showNoticeboardButton = user.role === 'college_admin' || user.role === 'admin' || user.role === 'super_admin';

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-16 border-b border-sidebar-border bg-background transition-all duration-150 shadow-sm",
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

        {showNavbarLogo && (
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="mr-2 h-10 w-10 md:h-11 md:w-11 shrink-0 overflow-hidden bg-background/60 hover:bg-secondary transition-colors"
            aria-label="Go to dashboard"
          >
            <div className="relative h-full w-full p-1">
              <Image 
                src={appLogoSrc} 
                alt="App logo" 
                fill 
                sizes="44px"
                className="object-contain" 
                priority 
              />
            </div>
          </button>
        )}

        {/* Search */}
        <div className="relative flex-1 max-w-md mx-2 md:w-80 md:flex-none group z-50">
           <CommandMenu />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden lg:flex items-center border border-border">
            <button
              type="button"
              onClick={() => onDensityModeChange('comfortable')}
              className={cn(
                "px-2.5 h-8 text-[11px] font-medium transition-colors",
                densityMode === 'comfortable'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              Comfort
            </button>
            <button
              type="button"
              onClick={() => onDensityModeChange('compact')}
              className={cn(
                "px-2.5 h-8 text-[11px] font-medium transition-colors border-l border-border",
                densityMode === 'compact'
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              Compact
            </button>
          </div>
          <div className="scale-90 sm:scale-100"><GoogleTranslate containerId="google_translate_header" /></div>
          {showNoticeboardButton && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => router.push('/noticeboard')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Noticeboard
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => router.push('/noticeboard')}
                title="Open noticeboard"
              >
                <Bell className="w-4 h-4" />
              </Button>
            </>
          )}
          <div className="hidden md:block"><LandingColorTheme /></div>
          <div className="hidden md:block"><ThemeToggler/></div>


          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-2 py-1.5 border border-transparent hover:border-border hover:bg-secondary transition-colors">
                <div className="relative w-8 h-8 border border-border bg-primary flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.name} 
                      fill 
                      sizes="32px"
                      className="object-cover" 
                    />
                  ) : (
                    <User className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="swiss-meta-label">{roleLabels[user.role]}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="swiss-meta-label normal-case tracking-normal">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="w-4 h-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  void handleSignOut();
                }}
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
