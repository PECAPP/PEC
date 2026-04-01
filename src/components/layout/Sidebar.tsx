import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MessageCircle,
  Building2,
  UserCog,
  UserCircle,
  Book,
  Calendar,
  CalendarDays,
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
  X,
  Users2,
  GripVertical,
} from "lucide-react";


import { cn } from "@/lib/utils";
import ThemeToggler from "@/components/ThemeToggler";
import { LandingColorTheme } from "@/components/LandingColorTheme";
import type { UserRole } from "@/types";
import { GoogleTranslate } from "@/components/GoogleTranslate";

const SIDEBAR_WIDTH_KEY = 'sidebar-width';
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 256;

interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: Users,
    label: "Users",
    path: "/users",
    roles: ["college_admin", "faculty"],
  },
  {
    icon: MessageCircle,
    label: "Chat",
    path: "/chat",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: Bell,
    label: "Noticeboard",
    path: "/noticeboard",
    roles: [],
  },
  {
    icon: Users2,
    label: "Clubs",
    path: "/clubs",
    roles: ["student", "college_admin"],
  },

  {
    icon: Building2,
    label: "Departments",
    path: "/departments",
    roles: ["college_admin"],
  },
  {
    icon: UserCog,
    label: "Faculty",
    path: "/faculty",
    roles: ["college_admin"],
  },
  {
    icon: UserCircle,
    label: "My Profile",
    path: "/profile",
    roles: ["student"],
  },
  {
    icon: Book,
    label: "Courses",
    path: "/courses",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: Calendar,
    label: "Timetable",
    path: "/timetable",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: CalendarDays,
    label: "Academic Calendar",
    path: "/academic-calendar",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: BarChart3,
    label: "Examinations",
    path: "/examinations",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: ClipboardCheck,
    label: "Attendance",
    path: "/attendance",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: FileText,
    label: "Score Sheet",
    path: "/score-sheet",
    roles: ["student"],
  },
  {
    icon: Book,
    label: "Course Materials",
    path: "/course-materials",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: FileText,
    label: "Resume Builder",
    path: "/resume-builder",
    roles: ["student"],
  },

  {
    icon: Building2,
    label: "Hostel Issues",
    path: "/hostel-issues",
    roles: ["student"],
  },
  {
    icon: UtensilsCrossed,
    label: "Night Canteen",
    path: "/canteen",
    roles: ["student"],
  },
  {
    icon: MapPin,
    label: "Campus Map",
    path: "/campus-map",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: ChefHat,
    label: "Canteen Manager",
    path: "/admin/canteen",
    roles: ["college_admin"],
  },
  {
    icon: Wrench,
    label: "Manage Hostel",
    path: "/admin/hostel",
    roles: ["college_admin"],
  },
  {
    icon: Calendar,
    label: "Manage Academic Calendar",
    path: "/admin/academic-calendar",
    roles: ["college_admin"],
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    path: "/help",
    roles: ["student", "faculty", "college_admin"],
  },
];

export function Sidebar({ 
  role, 
  collapsed, 
  onToggle, 
  isMobile, 
  mobileMenuOpen, 
  onMobileClose 
}: SidebarProps) {
  const location = usePathname();
  const appLogoSrc = '/logo.png';
  
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) return parsed;
      }
    }
    return DEFAULT_WIDTH;
  });
  
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

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
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

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
  }, [isResizing]);
  const filteredItems = navItems.filter((item) => item.roles.includes(role));
  const sectionConfig: Array<{ title: string; paths: string[] }> = [
    {
      title: 'Core',
      paths: ['/dashboard', '/profile', '/chat', '/clubs', '/users', '/departments', '/faculty'],
    },
    {
      title: 'Academics',
      paths: ['/courses', '/timetable', '/examinations', '/academic-calendar', '/attendance', '/score-sheet', '/course-materials', '/resume-builder'],
    },
    {
      title: 'Campus',
      paths: ['/hostel-issues', '/canteen', '/campus-map', '/admin/canteen', '/admin/hostel'],
    },
    {
      title: 'System',
      paths: ['/settings', '/help'],
    },
  ];

  const groupedItems = sectionConfig
    .map((section) => ({
      title: section.title,
      items: filteredItems.filter((item) => section.paths.includes(item.path)),
    }))
    .filter((section) => section.items.length > 0);

  const renderNavItem = (item: NavItem) => {
    const currentPath = location ?? '';
    let isActive = false;

    if (item.path === '/settings') {
      isActive = currentPath === item.path ||
        currentPath === '/admin/college-settings' ||
        currentPath === '/admin/hostel';
    } else if (item.path === '/departments') {
      isActive = currentPath === item.path ||
        currentPath.startsWith('/departments/');
    } else if (item.path === '/faculty') {
      isActive = currentPath === item.path ||
        currentPath.startsWith('/faculty/');
    } else {
      isActive = currentPath === item.path ||
        currentPath.startsWith(item.path + '/') ||
        (item.path !== '/' && currentPath.startsWith(item.path));
    }

    return (
      <li key={item.path} className={cn(!collapsed && "flex")}>
        <Link
          href={item.path as any}
          className={cn(
            "sidebar-item",
            !collapsed && "w-full",
            collapsed && "justify-center gap-0 px-0",
            isActive && "sidebar-item-active"
          )}
        >
          {collapsed ? (() => {
            const Icon = item.icon as any;
            return (
              <Icon
                className={cn(
                  "w-5 h-5 shrink-0 transition-colors",
                  isActive ? "text-primary-foreground" : "text-sidebar-foreground/75"
                )}
                strokeWidth={1.9}
              />
            );
          })() : (
            <AnimatePresence mode="wait">
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="swiss-nav-label truncate"
              >
                {item.label}
              </motion.span>
            </AnimatePresence>
          )}
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
        "fixed left-0 top-0 z-[100] h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col shadow-sm",
        isMobile && !mobileMenuOpen && "-translate-x-full",
        isMobile && mobileMenuOpen && "translate-x-0"
      )}
      style={{
        width: collapsed ? undefined : sidebarWidth,
        minWidth: collapsed ? undefined : sidebarWidth,
        maxWidth: collapsed ? undefined : sidebarWidth,
      }}
    >
      {/* Resize Handle */}
      {!isMobile && !collapsed && (
        <div
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-0 right-0 w-1 h-full cursor-ew-resize group z-10",
            "hover:bg-primary/20",
            "flex items-center justify-center",
            isResizing && "bg-primary/30"
          )}
        >
          <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}

      {/* Sidebar Header Controls */}
      <div
        className={cn(
          "min-h-20 flex items-center border-b border-sidebar-border shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-4"
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
          <ul className="space-y-0.5">
            {filteredItems.map(renderNavItem)}
          </ul>
        ) : (
          <div className="space-y-3">
            {groupedItems.map((section) => (
              <div key={section.title}>
                <p className="sidebar-section-label px-2 pb-1">{section.title}</p>
                <ul className="space-y-0.5">
                  {section.items.map(renderNavItem)}
                </ul>
              </div>
            ))}
          </div>
        )}

      </nav>

      {/* Mobile Fixed Bottom Controls */}
      {!collapsed && (
        <div className="lg:hidden mt-auto px-4 py-4 border-t border-sidebar-border bg-sidebar-accent/5">
            <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between gap-3">
                      <div className="scale-90 origin-left"><ThemeToggler /></div>
                      <div className="h-6 w-[1px] bg-border" />
                      <div className="scale-90"><LandingColorTheme /></div>
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
