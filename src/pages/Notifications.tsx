import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Filter, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/common/AsyncState';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  time: string;
  read: boolean;
  category: 'academic' | 'placement' | 'finance' | 'system';
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Assignment Deadline',
    message: 'Your Data Structures assignment is due tomorrow at 11:59 PM.',
    type: 'warning',
    time: '2 hours ago',
    read: false,
    category: 'academic',
  },
  {
    id: '2',
    title: 'New Job Posted',
    message: 'TechCorp has posted a new Software Engineer position matching your profile.',
    type: 'info',
    time: '5 hours ago',
    read: false,
    category: 'placement',
  },
  {
    id: '3',
    title: 'Fee Payment Received',
    message: 'Your semester fee payment of ₹75,000 has been successfully processed.',
    type: 'success',
    time: '1 day ago',
    read: true,
    category: 'finance',
  },
  {
    id: '4',
    title: 'Exam Schedule Released',
    message: 'The end semester examination schedule has been published. Check your timetable.',
    type: 'alert',
    time: '2 days ago',
    read: true,
    category: 'academic',
  },
  {
    id: '5',
    title: 'Profile Update Required',
    message: 'Please update your contact information to receive important notifications.',
    type: 'warning',
    time: '3 days ago',
    read: true,
    category: 'system',
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.read;
    return n.category === activeTab;
  });

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-foreground/10 text-foreground border-border';
      case 'warning': return 'bg-foreground/5 text-muted-foreground border-border';
      case 'alert': return 'bg-foreground/20 text-foreground border-border font-bold';
      default: return 'bg-foreground/5 text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with important alerts</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
          
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Stats */}
        <Card className="card-elevated">
          <CardContent className="ui-card-pad">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="p-2.5 rounded-md bg-primary/10 shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
                <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">Total Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unread Stats */}
        <Card className="card-elevated">
          <CardContent className="ui-card-pad">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="p-2.5 rounded-md bg-warning/10 shrink-0">
                <Bell className="w-5 h-5 text-warning" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">Unread Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Read Stats */}
        <Card className="card-elevated">
          <CardContent className="ui-card-pad">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="p-2.5 rounded-md bg-success/10 shrink-0">
                <Check className="w-5 h-5 text-success" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl font-bold text-foreground">{notifications.length - unreadCount}</p>
                <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">Read Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Stats */}
        <Card className="card-elevated">
          <CardContent className="ui-card-pad">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="p-2.5 rounded-md bg-accent/10 shrink-0">
                <Filter className="w-5 h-5 text-accent" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl font-bold text-foreground">4</p>
                <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">Active Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Click on a notification to mark it as read</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2 mb-4 scrollbar-none">
              <TabsList className="inline-flex h-auto p-1 bg-secondary/50 backdrop-blur-sm border border-border/50">
                <TabsTrigger value="all" className="px-4 py-2 capitalize transition-all">All</TabsTrigger>
                <TabsTrigger value="unread" className="px-4 py-2 capitalize transition-all">
                  Unread
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 bg-primary text-primary-foreground">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="academic" className="px-4 py-2 capitalize transition-all">Academic</TabsTrigger>
                <TabsTrigger value="placement" className="px-4 py-2 capitalize transition-all">Placement</TabsTrigger>
                <TabsTrigger value="finance" className="px-4 py-2 capitalize transition-all">Finance</TabsTrigger>
              </TabsList>
            </div>

            <div className="space-y-3">
              {filteredNotifications.length === 0 ? (
                <EmptyState title="No notifications" description="You’re all caught up." className="my-4" />
              ) : (
                filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.003 }}
                    transition={{ delay: index * 0.03, duration: 0.16 }}
                    className={cn(
                      'flex items-start gap-4 p-4 rounded-md border-l-[4px] shadow-sm cursor-pointer transition-all duration-150 group',
                      notification.read 
                        ? 'bg-card border-l-muted border-y border-r hover:border-r-border/80' 
                        : 'bg-gradient-to-r from-primary/5 to-transparent border-l-primary border-y border-r border-primary/10'
                    )}
                    onClick={() => {
                      markAsRead(notification.id);
                      // window.location.href = `/notifications/${notification.id}`; // Optional nav
                    }}
                  >
                    <div className={cn(
                      'p-2.5 rounded-full shadow-sm shrink-0 mt-1', 
                      getTypeStyles(notification.type).replace('bg-foreground/10', 'bg-white shadow-inner').replace('text-muted-foreground', 'text-primary')
                    )}>
                       {/* Contextual Icon based on category/type logic could go here, defaulting to Bell */}
                      <Bell className={cn(
                        "w-5 h-5",
                        notification.type === 'alert' ? "text-destructive" : 
                        notification.type === 'success' ? "text-emerald-500" :
                        notification.type === 'warning' ? "text-amber-500" : "text-primary"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={cn(
                            'font-semibold text-lg leading-tight',
                            !notification.read ? 'text-primary' : 'text-foreground/80'
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-foreground/70 mt-1 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-xs font-medium text-muted-foreground/80 bg-background/50 px-2 py-1 rounded-md border">
                            {notification.time}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                         <Badge variant="outline" className={cn(
                           "text-xs px-2 py-0.5 border-primary/20",
                            notification.category === 'academic' && "bg-blue-500/10 text-blue-600 border-blue-200",
                            notification.category === 'placement' && "bg-purple-500/10 text-purple-600 border-purple-200",
                            notification.category === 'finance' && "bg-emerald-500/10 text-emerald-600 border-emerald-200",
                            notification.category === 'system' && "bg-gray-500/10 text-gray-600 border-gray-200",
                         )}>
                            {notification.category}
                          </Badge>
                          {!notification.read && (
                            <span className="flex h-2 w-2 relative">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                          )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
