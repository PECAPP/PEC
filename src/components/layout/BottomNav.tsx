"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  MessageCircle,
  UtensilsCrossed,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname() || "/";
  const params = useParams<{ orgSlug?: string | string[] }>();
  const orgSlug = typeof params?.orgSlug === "string" ? params.orgSlug : null;

  const navItems = [
    {
      label: "Home",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Chat",
      icon: MessageCircle,
      path: "/chat",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden pb-safe">
      <nav className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const orgPrefix = orgSlug ? `/${orgSlug}` : "";
          const currentPath =
            orgPrefix && pathname.startsWith(orgPrefix)
              ? pathname.slice(orgPrefix.length) || "/"
              : pathname;

          const itemPath = item.path || "/";
          const isActive =
            currentPath === itemPath || currentPath.startsWith(itemPath + "/");
          const finalPath = orgSlug ? `/${orgSlug}${itemPath}` : itemPath;

          return (
            <Link
              key={itemPath}
              href={finalPath}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div className="relative">
                <item.icon
                  className={cn("w-6 h-6", isActive && "fill-current")}
                />
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
