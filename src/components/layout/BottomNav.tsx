
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageCircle, 
  UtensilsCrossed, 
  User 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function BottomNav() {
  const location = useLocation();
  const { orgSlug } = useParams<{ orgSlug: string }>();

  const navItems = [
    {
      label: 'Home',
      icon: LayoutDashboard,
      path: '/dashboard'
    },
    {
      label: 'Chat',
      icon: MessageCircle,
      path: '/chat'
    },
    {
      label: 'Order',
      icon: UtensilsCrossed,
      path: '/canteen'
    },
    {
      label: 'Profile',
      icon: User,
      path: '/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden pb-safe">
      <nav className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const currentPath = orgSlug && location.pathname.startsWith(`/${orgSlug}`)
              ? location.pathname.slice(`/${orgSlug}`.length) || '/'
              : location.pathname;
              
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          const finalPath = orgSlug ? `/${orgSlug}${item.path}` : item.path;

          return (
            <NavLink
              key={item.path}
              to={finalPath}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                {isActive && (
                    <motion.div
                        layoutId="bottom-nav-indicator"
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                    />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
