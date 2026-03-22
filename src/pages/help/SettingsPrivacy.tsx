import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Clock,
  ShieldCheck,
  UserCog
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpContent } from '@/components/help/HelpContent';

const articles = [
  { 
    icon: Shield, 
    title: 'Profile Completion Guide', 
    description: 'Step-by-step to reach 100% profile strength', 
    readTime: '3 min',
    content: `A 100% complete profile increases your visibility to recruiters and ensures smooth administrative processing:

1. **Basic Info**: Ensure your DOB, bio, and gender are set.
2. **Academic History**: Upload transcripts and certificates for verification.
3. **Contact Info**: Verify your mobile number and add an emergency contact.
4. **Skills & Interests**: Tag your profile with relevant technical and soft skills.

The 'Profile Strength' bar on your dashboard will guide you through missing items.`
  },
  { 
    icon: Bell, 
    title: 'Notification Channels', 
    description: 'Choosing between email, SMS, and in-app alerts', 
    readTime: '3 min',
    content: `Stay informed without the noise. Customize your alerts:

• **In-App Notifications**: Real-time popups while you're using the platform.
• **Email Digests**: Weekly or daily summaries of academic and campus activities.
• **SMS Alerts**: reserved for urgent announcements like exam cancellations or security alerts.
• **Browser Push**: Receive alerts even when PEC is in a background tab.

Toggle these in **Settings > Notifications**.`
  },
  { 
    icon: Moon, 
    title: 'Customizing Appearance', 
    description: 'Managing themes, color palettes, and accessibility modes', 
    readTime: '2 min',
    content: `Make PEC your own:

• **Dark Mode**: Reduces eye strain in low-light environments.
• **Light Mode**: High contrast for daylight use.
• **Ivy-League Theme**: A special curated aesthetic using university colors.
• **Compact Mode**: Reduces white space to show more data in tables.

Access appearance settings via the palette icon in the sidebar.`
  },
  { 
    icon: ShieldCheck, 
    title: 'Two-Factor Auth (2FA)', 
    description: 'Adding an extra layer of security with mobile TOTP', 
    readTime: '4 min',
    content: `Protect your account with another layer of security:

1. Install an authenticator app (Google Authenticator or Authy).
2. Go to **Settings > Security > Two-Factor Authentication**.
3. Scan the provided QR code.
4. Enter the matching 6-digit code to enable.

From now on, you'll need this code to log in from new devices.`
  },
  { 
    icon: Eye, 
    title: 'Data Privacy & Visibility', 
    description: 'Controlling what information is visible to faculty and peers', 
    readTime: '3 min',
    content: `You control your data:

• **Profile Visibility**: Choose if other students can find you in the directory.
• **Academic Records**: Only authorized faculty and administrative staff can see your grades.
• **Contact Privacy**: Hide your phone number or email from peer users.

Adjust these levels in **Settings > Privacy & Safety**.`
  }
];

export default function SettingsPrivacy() {
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
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings & Privacy</h1>
            <p className="text-muted-foreground">{articles.length} articles about settings and privacy</p>
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
                        <UserCog className="w-5 h-5" />
                        <span>Manage your preferences</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/settings">Open Settings</Link>
                        </Button>
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
