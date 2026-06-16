'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  Building2,
  UserCircle,
  Book,
  Calendar,
  ClipboardCheck,
  FileText,
  MapPin,
  UtensilsCrossed,
  ChefHat,
  Wrench,
  Settings,
  HelpCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Users2,
  GripVertical,
  ShoppingBag,
  Wallet,
  Activity,
  Briefcase,
  Shield,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import ThemeToggler from '@/components/ThemeToggler';
import { LandingColorTheme } from '@/components/LandingColorTheme';
import type { UserRole } from '@pec/shared';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GoogleTranslate } from '@/components/GoogleTranslate';

const SIDEBAR_WIDTH_KEY = 'sidebar-width';
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const _DEFAULT_WIDTH = 256;

interface SidebarProps {
  _role: UserRole;
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  onMobileClose?: () => void;
  width: number;
  onWidthChange: (width: number) => void;
}

interface NavChild {
  icon: React.ElementType;
  label: string;
  path: string;
  permission?: { action: string; subject: string };
  roles?: UserRole[];
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  permission?: { action: string; subject: string };
  roles?: UserRole[];
  children?: NavChild[];
}

// Items whose path starts with '#' are accordion groups (no direct navigation)
const navItems: NavItem[] = [
  // ── Core ──────────────────────────────────────────────────
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  {
    icon: Users,
    label: 'Directory',
    path: '/directory',
    permission: { action: 'read', subject: 'User' },
  },
  {
    icon: MessageCircle,
    label: 'Communications',
    path: '#communications',
    children: [
      { icon: MessageCircle, label: 'Chat', path: '/chat' },
      { icon: Bell, label: 'Noticeboard', path: '/noticeboard' },
    ],
  },
  { icon: Users2, label: 'Clubs', path: '/clubs' },

  // ── Academics ─────────────────────────────────────────────
  {
    icon: Calendar,
    label: 'Academic Schedule',
    path: '/academic-schedule',
    permission: { action: 'read', subject: 'Timetable' },
  },
  {
    icon: Book,
    label: 'Courses',
    path: '#courses',
    children: [
      {
        icon: Book,
        label: 'Course List',
        path: '/courses',
        permission: { action: 'read', subject: 'Course' },
      },
      {
        icon: Book,
        label: 'Course Materials',
        path: '/course-materials',
        permission: { action: 'read', subject: 'Course' },
      },
    ],
  },
  {
    icon: ClipboardCheck,
    label: 'Performance',
    path: '#performance',
    children: [
      { icon: ClipboardCheck, label: 'Attendance', path: '/attendance' },
      {
        icon: FileText,
        label: 'Score Sheet',
        path: '/score-sheet',
        permission: { action: 'read', subject: 'CgpaEntry' },
      },
    ],
  },
  { icon: Briefcase, label: 'Career', path: '/resume-builder' },

  // ── Campus Life ───────────────────────────────────────────
  {
    icon: ShoppingBag,
    label: 'Marketplace',
    path: '/marketplace',
    permission: { action: 'read', subject: 'MarketplaceListing' },
  },
  {
    icon: Building2,
    label: 'Hostels',
    path: '/hostels',
    permission: { action: 'read', subject: 'HostelIssue' },
  },
  {
    icon: UtensilsCrossed,
    label: 'Dining',
    path: '/canteen',
    permission: { action: 'read', subject: 'CanteenItem' },
  },
  { icon: MapPin, label: 'Campus Map', path: '/campus-map' },
  {
    icon: Wallet,
    label: 'Finance',
    path: '/finance',
    permission: { action: 'read', subject: 'FeeRecord' },
  },

  // ── System ────────────────────────────────────────────────
  { icon: Settings, label: 'Settings', path: '/settings' },
  {
    icon: Shield,
    label: 'Roles & Permissions',
    path: '/admin/role-management',
    permission: { action: 'manage', subject: 'Role' },
    roles: ['college_admin'] as UserRole[],
  },
  {
    icon: Activity,
    label: 'Observability',
    path: '/admin/observability',
    permission: { action: 'manage', subject: 'all' },
    roles: ['college_admin'] as UserRole[],
  },
  { icon: HelpCircle, label: 'Help & Support', path: '/help' },
];

const sectionConfig: Array<{ title: string; paths: string[] }> = [
  {
    title: 'Core',
    paths: ['/dashboard', '/directory', '#communications', '/clubs'],
  },
  {
    title: 'Academics',
    paths: ['/academic-schedule', '#courses', '#performance', '/resume-builder'],
  },
  {
    title: 'Campus Life',
    paths: ['/marketplace', '/hostels', '/canteen', '/campus-map', '/finance'],
  },
  {
    title: 'System',
    paths: ['/settings', '/admin/role-management', '/admin/observability', '/help'],
  },
];

export function Sidebar({
  _role,
  collapsed,
  onToggle,
  isMobile,
  mobileMenuOpen,
  onMobileClose,
  width,
  onWidthChange,
}: SidebarProps) {
  const { ability } = useAuth();
  const location = usePathname();
  const appLogoSrc = '/logo.png';

  const [isResizing, setIsResizing] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        onWidthChange(newWidth);
        localStorage.setItem(SIDEBAR_WIDTH_KEY, newWidth.toString());
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, onWidthChange]);

  const canSeeItem = (item: NavChild | NavItem, userRole?: string) => {
    // Role whitelist check — if roles are specified, user's role must be in the list
    if ('roles' in item && item.roles && item.roles.length > 0) {
      if (!userRole || !item.roles.includes(userRole as UserRole)) return false;
    }
    // CASL permission check
    if (!item.permission) return true;
    if (!ability) return false;
    return ability.can(item.permission.action, item.permission.subject as any);
  };

  const filteredItems = navItems.filter((item) => {
    if (item.children) {
      // Show accordion if at least one child is visible to this role
      return item.children.some((child) => canSeeItem(child, _role));
    }
    return canSeeItem(item, _role);
  });

  const groupedItems = sectionConfig
    .map((section) => ({
      title: section.title,
      items: filteredItems.filter((item) => section.paths.includes(item.path)),
    }))
    .filter((section) => section.items.length > 0);

  const isChildActive = (children: NavChild[]) =>
    children.some((c) => {
      const p = location ?? '';
      return p === c.path || p.startsWith(c.path + '/');
    });

  const renderNavItem = (item: NavItem) => {
    const currentPath = location ?? '';
    const isGroup = item.path.startsWith('#');

    // Determine active state
    let isActive: boolean;
    if (isGroup && item.children) {
      isActive = isChildActive(item.children);
    } else if (item.path === '/directory') {
      isActive = currentPath === item.path || currentPath.startsWith('/directory/');
    } else {
      isActive =
        currentPath === item.path || currentPath.startsWith(item.path + '/');
    }

    // Auto-expand active accordion
    const isOpen = isGroup && (expanded[item.path] ?? isActive);
    const Icon = item.icon as any;

    if (isGroup && item.children) {
      const visibleChildren = item.children.filter((child) => canSeeItem(child, _role));

      return (
        <li key={item.path} className={cn('w-full flex flex-col')}>
          {/* Accordion trigger */}
          <button
            onClick={() => {
              if (collapsed) {
                onToggle(); // expand sidebar first on click when collapsed
              } else {
                setExpanded((p) => ({ ...p, [item.path]: !p[item.path] }));
              }
            }}
            className={cn(
              'sidebar-item group w-full text-left',
              collapsed && 'justify-center gap-0 px-0',
              isActive && 'sidebar-item-active',
            )}
          >
            <div
              className={cn(
                'flex items-center',
                collapsed ? 'justify-center w-full' : 'w-full px-2 justify-between',
              )}
            >
              <div className="flex items-center gap-2">
                {collapsed ? (
                  <Icon
                    className={cn(
                      'w-5 h-5 shrink-0 transition-all duration-300',
                      isActive
                        ? 'text-primary scale-110 drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                        : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground group-hover:scale-110',
                    )}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className={cn(
                        "swiss-nav-label truncate flex items-center",
                        isActive ? "font-bold" : "font-medium"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  </AnimatePresence>
                )}
              </div>
              {!collapsed && (
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-sidebar-foreground/40 transition-transform duration-200 shrink-0',
                    isOpen && 'rotate-180',
                  )}
                />
              )}
            </div>
          </button>

          {/* Children */}
          {!collapsed && (
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.ul
                  key="children"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: 'easeInOut' }}
                  className="overflow-hidden pl-3 mt-1 space-y-0.5 border-l border-sidebar-border/50 ml-[22px]"
                >
                  {visibleChildren.map((child) => {
                    const childActive =
                      currentPath === child.path ||
                      currentPath.startsWith(child.path + '/');
                    const ChildIcon = child.icon as any;
                    return (
                      <li key={child.path}>
                        <Link
                          href={child.path as any}
                          className={cn(
                            'flex items-center w-full px-3 py-1.5 rounded-sm text-sm transition-colors',
                            childActive
                              ? 'text-primary bg-primary/10 font-bold'
                              : 'text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-sidebar-accent font-medium',
                          )}
                        >
                          <span className="truncate">{child.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>
          )}
        </li>
      );
    }

    // Plain nav link
    return (
      <li key={item.path} className={cn(!collapsed && 'flex')}>
        <Link
          href={item.path as any}
          className={cn(
            'sidebar-item group',
            !collapsed && 'w-full',
            collapsed && 'justify-center gap-0 px-0',
            isActive && 'sidebar-item-active',
          )}
        >
          <div
            className={cn(
              'flex items-center',
              collapsed ? 'justify-center w-full' : 'w-full px-2',
            )}
          >
            {collapsed ? (
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-all duration-300',
                  isActive
                    ? 'text-primary scale-110 drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]'
                    : 'text-sidebar-foreground/60 group-hover:text-sidebar-foreground group-hover:scale-110',
                )}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.span
                  key="label"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  className={cn(
                    "swiss-nav-label truncate flex items-center",
                    isActive ? "font-bold" : "font-medium"
                  )}
                >
                  {item.label}
                </motion.span>
              </AnimatePresence>
            )}
          </div>
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-[90] bg-background/70 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-[100] h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col shadow-sm',
          isMobile && !mobileMenuOpen && '-translate-x-full',
          isMobile && mobileMenuOpen && 'translate-x-0',
        )}
        style={{
          width: collapsed ? undefined : width,
          minWidth: collapsed ? undefined : width,
          maxWidth: collapsed ? undefined : width,
        }}
      >
        {/* Mesh Atmosphere */}
        <div className="sidebar-mesh" aria-hidden="true" />

        {/* Resize Handle */}
        {!isMobile && !collapsed && (
          <div
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'absolute top-0 right-0 w-1 h-full cursor-ew-resize group z-10',
              'hover:bg-primary/20 flex items-center justify-center',
              isResizing && 'bg-primary/30',
            )}
          >
            <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Sidebar Header */}
        <div
          className={cn(
            'min-h-20 flex items-center border-b border-sidebar-border shrink-0',
            collapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          {isMobile ? (
            <button
              onClick={onMobileClose}
              className="p-1.5 hover:bg-sidebar-accent transition-colors"
              title="Close menu"
            >
              <X className="w-5 h-5 text-sidebar-foreground" />
            </button>
          ) : collapsed ? (
            <button
              onClick={onToggle}
              className="p-2 hover:bg-sidebar-accent transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-5 h-5 text-sidebar-foreground" />
              <span className="sr-only">Expand sidebar</span>
            </button>
          ) : (
            <>
              <div className="h-10 w-10 shrink-0 relative overflow-hidden flex items-center justify-center">
                <Image
                  src={appLogoSrc}
                  alt="App logo"
                  fill
                  sizes="40px"
                  className="object-contain"
                  priority
                />
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 hover:bg-sidebar-accent transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5">
          {collapsed || isMobile ? (
            <ul className="space-y-0.5">{filteredItems.map(renderNavItem)}</ul>
          ) : (
            <div className="space-y-3">
              {groupedItems.map((section) => (
                <div key={section.title}>
                  <p className="text-[10.5px] font-bold  text-sidebar-foreground/50 uppercase px-2 pb-1.5 pt-2">{section.title}</p>
                  <ul className="space-y-0.5">{section.items.map(renderNavItem)}</ul>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Mobile Bottom Controls */}
        {!collapsed && (
          <div className="lg:hidden mt-auto px-4 py-4 border-t border-sidebar-border bg-sidebar-accent/5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="scale-90 origin-left">
                  <ThemeToggler />
                </div>
                <div className="h-6 w-[1px] bg-border" />
                <div className="scale-90">
                  <LandingColorTheme />
                </div>
              </div>
              <div className="w-full pt-2 border-t border-sidebar-border/30">
                <GoogleTranslate containerId="google_translate_sidebar" />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
