import {
  Home,
  Settings,
  User,
  Bell,
  HelpCircle,
  Briefcase,
  FileText,
  Calendar,
  Users,
  Building2,
  BookOpen,
  MapPin,
  Coffee,
  Shield,
  LayoutDashboard,
} from "lucide-react";

export const searchableRoutes = [
  // Core
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    keywords: ["home", "main", "overview"],
  },
  {
    title: "Profile",
    path: "/profile",
    icon: User,
    keywords: ["account", "me", "avatar"],
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    keywords: ["config", "preferences", "security", "admin"],
  },


  // Academics
  {
    title: "Courses",
    path: "/courses",
    icon: BookOpen,
    keywords: ["classes", "subjects", "learning"],
  },
  {
    title: "Timetable",
    path: "/timetable",
    icon: Calendar,
    keywords: ["schedule", "routine"],
  },
  {
    title: "Attendance",
    path: "/attendance",
    icon: Calendar,
    keywords: ["present", "absent"],
  },
  {
    title: "Score Sheet",
    path: "/score-sheet",
    icon: FileText,
    keywords: ["marks", "grades", "results", "gpa"],
  },




  // Admin
  {
    title: "User Management",
    path: "/users",
    icon: Users,
    keywords: ["students", "faculty", "staff", "people"],
  },
  {
    title: "College Settings",
    path: "/admin/college-settings",
    icon: Building2,
    keywords: ["config", "institution"],
  },

  // Campus
  {
    title: "Campus Map",
    path: "/campus-map",
    icon: MapPin,
    keywords: ["location", "directions", "buildings"],
  },
  {
    title: "Night Canteen",
    path: "/canteen",
    icon: Coffee,
    keywords: ["food", "order", "snacks"],
  },
  {
    title: "Hostel Issues",
    path: "/hostel-issues",
    icon: Home,
    keywords: ["complaints", "support", "maintenance"],
  },

  // Help
  {
    title: "Help Center",
    path: "/help",
    icon: HelpCircle,
    keywords: ["support", "faq", "docs"],
  },
  {
    title: "Privacy Policy",
    path: "/privacy",
    icon: Shield,
    keywords: ["legal", "gdpr", "data"],
  },
];
