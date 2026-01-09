import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  ArrowLeft,
  ChevronRight,
  Bell,
  Moon,
  Globe,
  Shield,
  Eye,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const articles = [
  { icon: Bell, title: 'Notification Preferences', description: 'Customize what notifications you receive', readTime: '3 min' },
  { icon: Moon, title: 'Theme & Appearance', description: 'Switch between light and dark modes', readTime: '2 min' },
  { icon: Globe, title: 'Language Settings', description: 'Change your preferred language', readTime: '2 min' },
  { icon: Shield, title: 'Two-Factor Authentication', description: 'Enable extra security for your account', readTime: '4 min' },
  { icon: Eye, title: 'Privacy Controls', description: 'Manage who can see your information', readTime: '3 min' },
  { icon: Settings, title: 'Data Export & Deletion', description: 'Download or delete your personal data', readTime: '4 min' },
];

export default function SettingsPrivacy() {
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
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings & Privacy</h1>
            <p className="text-muted-foreground">{articles.length} articles about settings and privacy</p>
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
