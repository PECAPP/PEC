import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ArrowLeft,
  ChevronRight,
  User,
  Mail,
  Phone,
  Camera,
  Key,
  Edit,
  FileText,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const articles = [
  { icon: User, title: 'Viewing Your Profile', description: 'How to access and view your profile information', readTime: '2 min' },
  { icon: Edit, title: 'Editing Personal Information', description: 'Update your name, bio, and personal details', readTime: '3 min' },
  { icon: Camera, title: 'Changing Your Profile Picture', description: 'Upload or update your profile photo', readTime: '2 min' },
  { icon: Mail, title: 'Updating Email Address', description: 'How to change your registered email', readTime: '3 min' },
  { icon: Phone, title: 'Managing Contact Information', description: 'Update phone number and emergency contacts', readTime: '2 min' },
  { icon: Key, title: 'Changing Your Password', description: 'Steps to update your account password', readTime: '3 min' },
  { icon: FileText, title: 'Managing Documents', description: 'Upload and manage your academic documents', readTime: '4 min' },
  { icon: Users, title: 'Parent/Guardian Information', description: 'Add or update guardian details', readTime: '3 min' },
];

export default function AccountProfile() {
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
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Account & Profile</h1>
            <p className="text-muted-foreground">{articles.length} articles about managing your account</p>
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
