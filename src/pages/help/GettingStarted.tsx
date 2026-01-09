import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const articles = [
  { icon: Rocket, title: 'Welcome to OmniFlow', description: 'An introduction to the platform and its capabilities', readTime: '3 min' },
  { icon: UserPlus, title: 'Creating Your Account', description: 'Step-by-step guide to setting up your OmniFlow account', readTime: '5 min' },
  { icon: LogIn, title: 'Logging In for the First Time', description: 'How to access your dashboard after registration', readTime: '2 min' },
  { icon: Layout, title: 'Understanding the Dashboard', description: 'Overview of your main dashboard and key features', readTime: '4 min' },
  { icon: Navigation, title: 'Navigating the Platform', description: 'How to find and access different modules', readTime: '3 min' },
  { icon: Bell, title: 'Setting Up Notifications', description: 'Configure alerts for important updates', readTime: '3 min' },
  { icon: Settings, title: 'Initial Settings Configuration', description: 'Essential settings to configure when you start', readTime: '4 min' },
  { icon: Shield, title: 'Security Best Practices', description: 'Keep your account secure from day one', readTime: '5 min' },
  { icon: Smartphone, title: 'Mobile Access Guide', description: 'Using OmniFlow on your mobile device', readTime: '3 min' },
  { icon: HelpCircle, title: 'Getting Help & Support', description: 'How to reach our support team', readTime: '2 min' },
  { icon: Bookmark, title: 'Quick Tips for New Users', description: 'Pro tips to get the most out of OmniFlow', readTime: '4 min' },
  { icon: Clock, title: 'Setting Up Your Schedule', description: 'How to view and manage your timetable', readTime: '3 min' },
];

export default function GettingStarted() {
  return (
    <div className="space-y-6">
      <div>
        <Link to="/help">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help
          </Button>
        </Link>
        
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

      <div className="grid gap-3">
        {articles.map((article, index) => (
          <motion.div
            key={article.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
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
      </div>
    </div>
  );
}
