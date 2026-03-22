import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/common/AsyncState';

interface NotificationDetail {
  id: string;
  title: string;
  message: string;
  fullContent: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  time: string;
  date: string;
  read: boolean;
  category: 'academic' | 'placement' | 'finance' | 'system';
  actions?: { label: string; link: string }[];
  relatedItems?: { title: string; description: string }[];
}

const notifications: NotificationDetail[] = [
  {
    id: '1',
    title: 'Assignment Deadline',
    message: 'Your Data Structures assignment is due tomorrow at 11:59 PM.',
    fullContent: 'This is a reminder that your Data Structures & Algorithms Assignment #3 is due tomorrow (December 27, 2024) at 11:59 PM IST. The assignment covers topics including Binary Search Trees, AVL Trees, and Heap data structures. Please ensure you submit your work on the student portal before the deadline to avoid any late penalties. Late submissions will incur a 10% penalty per day.',
    type: 'warning',
    time: '2 hours ago',
    date: 'December 26, 2024',
    read: false,
    category: 'academic',
    actions: [
      { label: 'View Assignment', link: '/courses' },
      { label: 'Submit Work', link: '/courses' },
    ],
    relatedItems: [
      { title: 'Assignment #3', description: 'Binary Trees & AVL Implementation' },
      { title: 'Course', description: 'CS301 - Data Structures & Algorithms' },
    ],
  },
  {
    id: '2',
    title: 'New Job Posted',
    message: 'TechCorp has posted a new Software Engineer position matching your profile.',
    fullContent: 'Great news! A new job opportunity matching your profile has been posted on the placement portal. TechCorp, a leading technology company, is looking for Software Engineers to join their team in Bangalore. Based on your skills and profile, you have a 92% match score for this position. The deadline to apply is January 15, 2025. We recommend applying early as positions fill up quickly.',
    type: 'info',
    time: '5 hours ago',
    date: 'December 26, 2024',
    read: false,
    category: 'placement',
    actions: [
      { label: 'View Job Details', link: '/placements' },
      { label: 'Apply Now', link: '/placements' },
    ],
    relatedItems: [
      { title: 'Position', description: 'Software Engineer' },
      { title: 'Company', description: 'TechCorp' },
      { title: 'Match Score', description: '92%' },
    ],
  },
  {
    id: '3',
    title: 'Fee Payment Received',
    message: 'Your semester fee payment of ₹75,000 has been successfully processed.',
    fullContent: 'Your payment for the Fall 2024 semester has been successfully processed and confirmed. Transaction Details: Amount: ₹75,000, Transaction ID: TXN2024120312345, Payment Method: UPI, Date: December 25, 2024. Your receipt has been generated and is available for download. Thank you for your timely payment.',
    type: 'success',
    time: '1 day ago',
    date: 'December 25, 2024',
    read: true,
    category: 'finance',
    actions: [
      { label: 'Download Receipt', link: '/finance' },
      { label: 'View Details', link: '/finance' },
    ],
    relatedItems: [
      { title: 'Amount', description: '₹75,000' },
      { title: 'Transaction ID', description: 'TXN2024120312345' },
    ],
  },
  {
    id: '4',
    title: 'Exam Schedule Released',
    message: 'The end semester examination schedule has been published. Check your timetable.',
    fullContent: 'The End Semester Examination schedule for Fall 2024 has been released. Exams will be conducted from January 15, 2025 to January 30, 2025. Your personalized exam timetable is now available on the student portal. Please review the schedule carefully and note down your exam dates, times, and venues. Hall tickets will be available for download from January 10, 2025. Make sure you have no pending dues before downloading your hall ticket.',
    type: 'alert',
    time: '2 days ago',
    date: 'December 24, 2024',
    read: true,
    category: 'academic',
    actions: [
      { label: 'View Timetable', link: '/timetable' },
      { label: 'Download Hall Ticket', link: '/examinations' },
    ],
    relatedItems: [
      { title: 'Exam Period', description: 'Jan 15 - Jan 30, 2025' },
      { title: 'Hall Ticket', description: 'Available from Jan 10' },
    ],
  },
  {
    id: '5',
    title: 'Profile Update Required',
    message: 'Please update your contact information to receive important notifications.',
    fullContent: 'We noticed that some of your profile information may be outdated. To ensure you receive all important notifications and communications, please verify and update your contact details including your email address, phone number, and current address. Keeping your profile updated helps us serve you better and ensures you don\'t miss any critical announcements.',
    type: 'warning',
    time: '3 days ago',
    date: 'December 23, 2024',
    read: true,
    category: 'system',
    actions: [
      { label: 'Update Profile', link: '/profile' },
      { label: 'Settings', link: '/settings' },
    ],
  },
];

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const notification = notifications.find(n => n.id === id);
  
  if (!notification) {
    return (
      <div className="py-16">
        <EmptyState
          title="Notification not found"
          description="This notification may have been removed."
          actionLabel="Back to Notifications"
          onAction={() => navigate('/notifications')}
          className="max-w-md mx-auto"
        />
      </div>
    );
  }

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'success': return { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' };
      case 'warning': return { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' };
      case 'alert': return { icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' };
      default: return { icon: Info, color: 'text-primary', bg: 'bg-primary/10' };
    }
  };

  const typeConfig = getTypeConfig(notification.type);
  const TypeIcon = typeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-6 md:space-y-8"
    >
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/notifications')} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Notifications
      </Button>

      {/* Header */}
      <div className="card-elevated ui-card-pad">
        <div className="flex items-start gap-4">
          <div className={cn('w-12 h-12 rounded-full flex items-center justify-center shrink-0', typeConfig.bg)}>
            <TypeIcon className={cn('w-6 h-6', typeConfig.color)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-foreground">{notification.title}</h1>
              <Badge variant="outline" className="capitalize">{notification.category}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {notification.date}
              </span>
              <span>{notification.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card-elevated ui-card-pad">
        <h2 className="font-semibold text-foreground mb-4">Details</h2>
        <p className="text-muted-foreground leading-relaxed">{notification.fullContent}</p>
        
        {notification.relatedItems && (
          <>
            <Separator className="my-6" />
            <h3 className="font-semibold text-foreground mb-4">Related Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {notification.relatedItems.map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                  <p className="font-medium text-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {notification.actions && notification.actions.length > 0 && (
        <div className="card-elevated ui-card-pad">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {notification.actions.map((action, i) => (
              <Button 
                key={i} 
                variant={i === 0 ? 'default' : 'outline'}
                onClick={() => navigate(action.link)}
              >
                {action.label}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
