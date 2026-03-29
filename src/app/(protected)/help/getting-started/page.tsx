'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  ArrowLeft,
  ChevronRight,
  Rocket,
  UserPlus,
  LogIn,
  Layout,
  Navigation,
  Bell,
  Settings,
  Shield,
  Smartphone,
  HelpCircle,
  Bookmark,
  Clock,
  UtensilsCrossed,
  Wrench,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpContent } from '@/components/help/HelpContent';
import Link from 'next/link';

const articles = [
  { 
    icon: Rocket, 
    title: 'Welcome to PEC', 
    description: 'An introduction to the platform and its capabilities', 
    readTime: '3 min',
    content: `PEC is a comprehensive Campus Operating System designed to streamline every aspect of university life. From academic tracking to late-night snacking, it brings everything into one unified dashboard.

Key modules include:
• Academic Management (Courses, Grades, Attendance)
• Financial Services (Fee payment, Transactions)
• Social & Campus Life (Night Canteen, Hostel issues)
• Career Services (Placement board, AI Resume tools)

Our goal is to reduce administrative friction and let you focus on what matters most: your growth.`
  },
  { 
    icon: UserCheck, 
    title: 'Student Dashboard Guide', 
    description: 'Complete walkthrough of the student experience and modules', 
    readTime: '5 min',
    content: `The Student Dashboard is your central hub. Here's how to navigate it:

1. **Main Overview**: See your current GPA, attendance summary, and upcoming classes at a glance.
2. **Side Module Links**: Access courses and materials directly.
3. **Quick Actions**: Use the plus icon or search bar to quickly find people or documents.
4. **Theme Customization**: Switch between Dark, Light, and Ivy-League themes in the bottom sidebar.

Pro Tip: Use the 'Stat Cards' to quickly jump to detailed reports for Finance or Placements.`
  },
  { 
    icon: UserPlus, 
    title: 'Admin Panel Overview', 
    description: 'Guide for administrators to manage users and campus services', 
    readTime: '6 min',
    content: `Administrators have access to a specialized set of tools:

• **User Management**: Add, edit, and audit user profiles (Students, Faculty, Staff).
• **Organization Config**: Set up academic years, semester dates, and department hierarchies.
• **System Logs**: Monitor platform activity and security events.
• **Service Management**: Oversee the Night Canteen inventory and Hostel maintenance queue.

Admins can access these through the specific 'Admin' labeled links in the sidebar.`
  },
  { 
    icon: Layout, 
    title: 'Understanding Navigation', 
    description: 'How to use the sidebar and quick actions efficiently', 
    readTime: '3 min',
    content: `Navigation in PEC is designed for speed:

• **Sidebar**: Your primary tool. It collapses to save space on desktop and hides on mobile (accessible via the hamburger menu).
• **Search Bar**: Press (Ctrl + K) to search across students, courses, and documents.
• **Breadcrumbs**: Use the path at the top to quickly navigate back to parent categories.
• **Mobile Friendly**: The interface automatically adjusts for Android and iOS screens, moving the Help icon to the sidebar for better reach.`
  },
  { 
    icon: UtensilsCrossed, 
    title: 'Night Canteen Introduction', 
    description: 'How to browse menu and order late-night meals', 
    readTime: '2 min',
    content: `Hungry late at night? The Night Canteen module lets you:

1. **Browse Menu**: Sort by categories like 'Snacks', 'Drinks', or 'Meals'.
2. **Live Inventory**: See what's actually in stock before you order.
3. **Real-time Tracking**: Watch your order go from 'Preparing' to 'Out for Delivery'.
4. **History**: Re-order your favorites with one click from your order history.

The canteen usually operates from 9:00 PM to 4:00 AM.`
  },
  { 
    icon: Wrench, 
    title: 'Hostel Maintenance Guide', 
    description: 'Reporting and tracking hostel infrastructure issues', 
    readTime: '3 min',
    content: `Maintenance made easy. If something in your room or hostel is broken:

1. Click **Report Issue**.
2. **Category**: Choose between Plumbing, Electrical, Internet, or Carpentry.
3. **Evidence**: You can upload photos to help the maintenance team understand the problem.
4. **Chat**: Once reported, you can chat directly with the assigned technician for updates.

Status levels: Pending → Assigned → In-Progress → Resolved.`
  }
];

export default function GettingStarted() {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/help">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help
          </Link>
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-primary/10">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Getting Started</h1>
            <p className="text-muted-foreground">{articles.length} articles to help you begin</p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {selectedArticle === null ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-3"
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedArticle(index)}
              >
                <Card className="hover:shadow-md transition-all cursor-pointer group hover:border-primary/50">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-secondary group-hover:bg-primary/10 transition-colors">
                        <article.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium group-hover:text-primary transition-colors">{article.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{article.description}</p>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span className="text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                        <ChevronRight className="w-5 h-5 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="article"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card className="border-none shadow-none bg-transparent">
              <CardContent className="p-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedArticle(null)}
                  className="mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      {(() => {
                        const Icon = articles[selectedArticle].icon;
                        return <Icon className="w-8 h-8" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-foreground">{articles[selectedArticle].title}</h2>
                      <p className="text-muted-foreground mt-1">{articles[selectedArticle].description}</p>
                    </div>
                  </div>

                  <div className="prose prose-invert max-w-none">
                    <HelpContent content={articles[selectedArticle].content} />
                  </div>

                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <Rocket className="w-5 h-5" />
                        <span>Was this helpful?</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Yes</Button>
                        <Button variant="outline" size="sm">No</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
