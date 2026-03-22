import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpContent } from '@/components/help/HelpContent';

const articles = [
  { 
    icon: User, 
    title: 'Viewing Your Profile', 
    description: 'How to access and view your profile information', 
    readTime: '2 min',
    content: `Your profile is your digital identity on PEC. To view it:

1. Click on your profile picture in the top-right corner of the header.
2. Select **'View Profile'** from the dropdown menu.
3. You'll see your academic summary, attendance trends, and contact details.

Faculty and administrators can also view your profile to provide academic support or manage administrative tasks.`
  },
  { 
    icon: Edit, 
    title: 'Editing Personal Information', 
    description: 'Update your name, bio, and personal details', 
    readTime: '3 min',
    content: `Keeping your information up to date is crucial for effective communication:

• **Bio**: Share a brief professional or academic summary.
• **Personal Details**: Update your date of birth, gender, or nationality if needed.
• **Academics**: Some academic fields (like expected graduation year) can be updated from here.

Note: Certain primary information (like your Full Name or Enrollment Number) might require administrative approval to change.`
  },
  { 
    icon: Camera, 
    title: 'Profile Picture Management', 
    description: 'Upload or update your profile photo', 
    readTime: '2 min',
    content: `A professional profile picture helps faculty and peers recognize you:

1. Go to **Settings > Profile**.
2. Click on the camera icon over your current avatar.
3. Upload a square image (JPEG or PNG) for the best fit.
4. Click 'Save Changes' to update across the platform.`
  },
  { 
    icon: Key, 
    title: 'Changing Your Password', 
    description: 'Steps to update your account password', 
    readTime: '3 min',
    content: `Security first. To change your password:

1. Navigate to **Settings > Security**.
2. Enter your **Current Password** to verify your identity.
3. Type your **New Password** twice to confirm.
4. Ensure your password is at least 8 characters long and includes a mix of letters, numbers, and symbols.`
  },
  { 
    icon: FileText, 
    title: 'Managing Documents', 
    description: 'Upload and manage your academic documents', 
    readTime: '4 min',
    content: `Store your important academic files securely:

• **Uploads**: You can upload transcripts, certificates, and ID proofs.
• **Verification**: Once uploaded, the administration will review and mark them as 'Verified'.
• **Access**: Access these files anytime for placement applications or external requirements.

Supported formats: PDF, JPG, PNG (Max size: 5MB per file).`
  }
];

export default function AccountProfile() {
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

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
                        <ShieldCheck className="w-5 h-5" />
                        <span>Is your profile secured?</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Yes</Button>
                        <Button variant="outline" size="sm">Review</Button>
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
