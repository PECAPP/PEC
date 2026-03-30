import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconLayoutDashboard,
  IconUsers,
  IconChartBar,
  IconMessageCircle,
  IconBuilding,
  IconUserCog,
  IconUserCircle,
  IconBook,
  IconCalendar,
  IconClipboardCheck,
  IconFileText,
  IconMapPin,
  IconToolsKitchen2,
  IconChefHat,
  IconTool,
  IconSettings,
  IconHelpCircle,
} from "@tabler/icons-react";
import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";


import { cn } from "@/lib/utils";
import ThemeToggler from "@/components/ThemeToggler"; // Import ThemeToggler
import { LandingColorTheme } from "@/components/LandingColorTheme"; // Import Accent Picker
import type { UserRole } from "@/types";

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
    icon: IconLayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    roles: ["student", "faculty", "college_admin", "admin"],
  },
  {
    icon: IconUsers,
    label: "Users",
    path: "/users",
    roles: ["college_admin", "admin", "faculty"],
  },
  {
    icon: IconMessageCircle,
    label: "Chat",
    path: "/chat",
    roles: ["student", "faculty", "college_admin", "admin"],
  },

  {
    icon: IconBuilding,
    label: "Departments",
    path: "/departments",
    roles: ["college_admin", "admin"],
  },
  {
    icon: IconUserCog,
    label: "Faculty",
    path: "/faculty",
    roles: ["college_admin", "admin"],
  },
  {
    icon: IconUserCircle,
    label: "My Profile",
    path: "/profile",
    roles: ["student"],
  },
  {
    icon: IconBook,
    label: "Courses",
    path: "/courses",
    roles: ["student", "faculty", "college_admin", "admin"],
  },
  {
    icon: IconCalendar,
    label: "Timetable",
    path: "/timetable",
    roles: ["student", "faculty", "college_admin", "admin"],
  },
  {
    icon: IconClipboardCheck,
    label: "Attendance",
    path: "/attendance",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: IconBook,
    label: "Course Materials",
    path: "/course-materials",
    roles: ["student", "faculty", "college_admin", "admin"],
  },
  {
    icon: IconFileText,
    label: "Resume Builder",
    path: "/resume-builder",
    roles: ["student"],
  },

  {
    icon: IconBuilding,
    label: "Hostel Issues",
    path: "/hostel-issues",
    roles: ["student"],
  },
  {
    icon: IconToolsKitchen2,
    label: "Night Canteen",
    path: "/canteen",
    roles: ["student"],
  },
  {
    icon: IconMapPin,
    label: "Campus Map",
    path: "/campus-map",
    roles: ["student", "faculty", "college_admin", "admin"],
  },
  {
    icon: IconChefHat,
    label: "Canteen Manager",
    path: "/admin/canteen",
    roles: ["college_admin", "admin"],
  },
  {
    icon: IconTool,
    label: "Manage Hostel",
    path: "/admin/hostel",
    roles: ["college_admin", "admin"],
  },
  {
    icon: IconSettings,
    label: "Settings",
    path: "/settings",
    roles: ["student", "faculty", "college_admin", "admin"],
  },
  {
    icon: IconHelpCircle,
    label: "Help & Support",
    path: "/help",
    roles: ["student", "faculty", "college_admin", "admin"],
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
  const filteredItems = navItems.filter((item) => item.roles.includes(role));
  const sectionConfig: Array<{ title: string; paths: string[] }> = [
    {
      title: 'Core',
      paths: ['/dashboard', '/profile', '/chat', '/users', '/departments', '/faculty'],
    },
    {
      title: 'Academics',
      paths: ['/courses', '/timetable', '/attendance', '/course-materials', '/resume-builder'],
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
          href={item.path}
          className={cn(
            "sidebar-item",
            !collapsed && "w-full",
            collapsed && "justify-center gap-0 px-0",
            isActive && "sidebar-item-active"
          )}
        >
          {collapsed ? (
            <item.icon
              className={cn(
                "w-5 h-5 shrink-0 transition-colors",
                isActive ? "text-primary-foreground" : "text-sidebar-foreground/75"
              )}
              stroke={1.9}
            />
          ) : (
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
      className={cn(
        "fixed left-0 top-0 z-[100] h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col shadow-sm",
        collapsed ? "w-16" : "w-64",
        isMobile && !mobileMenuOpen && "-translate-x-full",
        isMobile && mobileMenuOpen && "translate-x-0 w-64"
      )}
    >
      {/* Sidebar Header Controls */}
      <div
        className={cn(
          "min-h-20 flex items-center border-b border-sidebar-border",
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
            <div className="h-10 w-10 shrink-0 overflow-hidden flex items-center justify-center">
              <img src={appLogoSrc} alt="App logo" className="h-8 w-8 object-contain" />
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
            <div className="flex items-center justify-between gap-3">
                 <div className="scale-90 origin-left"><ThemeToggler /></div>
                 <div className="h-6 w-[1px] bg-border" />
                 <div className="scale-90"><LandingColorTheme /></div>
                 <div className="h-6 w-[1px] bg-border" />
                 {/* <div className="flex-1 min-w-0 overflow-hidden"><GoogleTranslate containerId="google_translate_sidebar" /></div> */}
            </div>
        </div>
      )}
    </aside>
    </>
  );
}
