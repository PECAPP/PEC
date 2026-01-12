import { useState } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileText,
  CreditCard,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Shield,
  UserCog,
  Menu,
  X,
  UtensilsCrossed,
  Wrench,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCollegeSettings } from "@/hooks/useCollegeSettings";
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
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    roles: [
      "student",
      "faculty",
      "college_admin",
      "super_admin",
      "placement_officer",
      "recruiter",
    ],
  },
  {
    icon: Users,
    label: "Users",
    path: "/users",
    roles: ["college_admin", "super_admin", "faculty", "placement_officer"],
  },
  {
    icon: Building2,
    label: "Departments",
    path: "/departments",
    roles: ["college_admin", "super_admin"],
  },
  {
    icon: UserCog,
    label: "Faculty",
    path: "/faculty",
    roles: ["college_admin", "super_admin"],
  },
  {
    icon: GraduationCap,
    label: "My Profile",
    path: "/profile",
    roles: ["student"],
  },
  {
    icon: BookOpen,
    label: "Courses",
    path: "/courses",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: Calendar,
    label: "Timetable",
    path: "/timetable",
    roles: ["student", "faculty", "college_admin", "super_admin"],
  },
  {
    icon: ClipboardCheck,
    label: "Attendance",
    path: "/attendance",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: FileText,
    label: "Examinations",
    path: "/examinations",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: FileText,
    label: "Assignments",
    path: "/assignments",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: BookOpen,
    label: "Course Materials",
    path: "/course-materials",
    roles: ["student", "faculty", "college_admin"],
  },
  {
    icon: CreditCard,
    label: "Finance",
    path: "/finance",
    roles: ["student", "college_admin", "super_admin"],
  },
  {
    icon: Briefcase,
    label: "Job Board",
    path: "/placements/jobs",
    roles: ["student", "placement_officer", "recruiter"],
  },
  {
    icon: Calendar,
    label: "Placement Drives",
    path: "/placements/drives",
    roles: ["student", "placement_officer", "recruiter", "faculty"],
  },
  {
    icon: Users,
    label: "Applications",
    path: "/placements/applications",
    roles: ["recruiter", "placement_officer"],
  },
  {
    icon: Building2,
    label: "Recruiters",
    path: "/placements/recruiters",
    roles: ["placement_officer", "super_admin"],
  },
  {
    icon: FileText,
    label: "Resume Builder",
    path: "/resume-builder",
    roles: ["student"],
  },
  {
    icon: FileText,
    label: "AI Analyzer",
    path: "/resume-analyzer",
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
    icon: UtensilsCrossed,
    label: "Canteen Manager",
    path: "/admin/canteen",
    roles: ["super_admin", "college_admin"],
  },
  {
    icon: Wrench,
    label: "Manage Hostel",
    path: "/admin/hostel",
    roles: ["super_admin", "college_admin"],
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
    roles: [
      "student",
      "faculty",
      "college_admin",
      "super_admin",
      "placement_officer",
      "recruiter",
    ],
  },
  {
    icon: HelpCircle,
    label: "Help & Support",
    path: "/help",
    roles: [
      "student",
      "faculty",
      "college_admin",
      "super_admin",
      "placement_officer",
      "recruiter",
    ],
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
  const location = useLocation();
  const { settings } = useCollegeSettings();
  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  const handleLogoClick = () => {
    if (settings?.website) {
      window.open(settings.website, '_blank');
    }
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
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}
    </AnimatePresence>

    <aside
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64",
        isMobile && !mobileMenuOpen && "-translate-x-full",
        isMobile && mobileMenuOpen && "translate-x-0 w-64 shadow-2xl"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "min-h-20 flex items-center border-b border-sidebar-border",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        {collapsed ? (
          <button
            onClick={onToggle}
            className="group relative p-2 rounded-md hover:bg-sidebar-accent transition-colors"
            title="Expand sidebar"
          >
            <GraduationCap className="absolute inset-0 m-auto w-5 h-5  text-primary-foreground transition-transform duration-200 scale-100 group-hover:scale-0 group-hover:-rotate-90" />

            <ChevronRight className="absolute inset-0 m-auto w-5 h-5 text-primary-foreground transition-transform duration-200 rotate-90 scale-0 group-hover:rotate-0 group-hover:scale-100" />

            <span className="sr-only">Expand sidebar</span>
          </button>
        ) : (
          <>
            <Link to="/">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer flex-1 min-w-0"
                onClick={handleLogoClick}
              >
                {(settings?.logoDisplayMode === 'logo-only' || settings?.logoDisplayMode === 'both') && settings?.logoUrl ? (
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <img 
                      src={settings.logoUrl} 
                      alt={settings.collegeName}
                      className="max-w-16 max-h-16 w-auto h-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 flex-shrink-0 bg-primary rounded flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary-foreground" />
                  </div>
                )}
                {(settings?.logoDisplayMode === 'text-only' || settings?.logoDisplayMode === 'both') && (
                  <span className="font-semibold text-sidebar-foreground truncate">
                    {settings?.collegeShortName || 'OmniFlow'}
                  </span>
                )}
              </motion.div>
            </Link>
            <button
              onClick={isMobile ? onMobileClose : onToggle}
              className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
              title={isMobile ? "Close menu" : "Collapse sidebar"}
            >
              {isMobile ? (
                <X className="w-5 h-5 text-sidebar-foreground" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            // Smart path matching for different route types
            let isActive = false;
            
            if (item.path === '/finance') {
              // Finance includes payment settings and other finance routes
              isActive = location.pathname === item.path || 
                        location.pathname.startsWith('/finance/') ||
                        location.pathname === '/admin/payment-settings';
            } else if (item.path === '/settings') {
              // Settings includes college settings admin page
              isActive = location.pathname === item.path || 
                        location.pathname === '/admin/college-settings' ||
                        location.pathname === '/admin/hostel';
            } else if (item.path === '/departments') {
              // Departments
              isActive = location.pathname === item.path || 
                        location.pathname.startsWith('/departments/');
            } else if (item.path === '/faculty') {
              // Faculty
              isActive = location.pathname === item.path || 
                        location.pathname.startsWith('/faculty/');
            } else {
              // Default matching for other routes
              isActive = location.pathname === item.path || 
                        location.pathname.startsWith(item.path + '/') ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));
            }
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    "sidebar-item",
                    isActive && "sidebar-item-active"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                      isActive ? "text-primary-foreground" : "text-sidebar-foreground/70"
                    )}
                  />
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
    </>
  );
}
