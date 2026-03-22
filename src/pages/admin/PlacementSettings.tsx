import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  GraduationCap,
  FileText,
  Calendar,
  Building2,
  Bell,
  Shield,
  Loader2,
  Info,
  Database,
} from 'lucide-react';
import seedPlacementData from '@/utils/seedPlacementData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import type { PlacementSettings } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface Props {
  embedded?: boolean;
}

export default function PlacementSettingsPage({ embedded }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    // Academic Requirements
    minCgpaForPlacements: 6.0,
    maxBacklogsAllowed: 0,
    
    // Resume Settings
    allowedResumeFormats: ['pdf', 'docx'],
    maxResumeSize: 5,
    
    // Timeline
    placementSeasonStart: '',
    placementSeasonEnd: '',
    
    // Company Settings
    requireCompanyVerification: true,
    
    // Notifications
    notifyOnNewJob: true,
    notifyOnApplicationUpdate: true,
    notifyOnDriveRegistration: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsRef = doc(({} as any), 'placementSettings', 'general');
        const docSnap = await getDoc(settingsRef);
        
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsRef = doc(({} as any), 'placementSettings', 'general');
      await setDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid
      }, { merge: true });
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {!embedded && (
          <div>
            <h1 className="text-3xl font-bold text-foreground">Placement Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure placement module settings for your institution
            </p>
          </div>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </motion.div>

      {/* Academic Requirements */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Academic Requirements
            </CardTitle>
            <CardDescription>
              Set minimum academic criteria for placement eligibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Minimum CGPA for Placements</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={settings.minCgpaForPlacements}
                  onChange={(e) => setSettings({ ...settings, minCgpaForPlacements: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Students below this CGPA won't be eligible for placements
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Maximum Backlogs Allowed</Label>
                <Input
                  type="number"
                  min="0"
                  value={settings.maxBacklogsAllowed}
                  onChange={(e) => setSettings({ ...settings, maxBacklogsAllowed: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  Students with more backlogs won't be eligible
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resume Settings */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Resume Settings
            </CardTitle>
            <CardDescription>
              Configure resume upload requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Allowed Resume Formats</Label>
                <div className="flex flex-wrap gap-2">
                  {['pdf', 'docx', 'doc'].map((format) => (
                    <Badge
                      key={format}
                      variant={settings.allowedResumeFormats.includes(format) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        const formats = settings.allowedResumeFormats.includes(format)
                          ? settings.allowedResumeFormats.filter(f => f !== format)
                          : [...settings.allowedResumeFormats, format];
                        setSettings({ ...settings, allowedResumeFormats: formats });
                      }}
                    >
                      .{format}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Maximum Resume Size (MB)</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={settings.maxResumeSize}
                  onChange={(e) => setSettings({ ...settings, maxResumeSize: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Placement Timeline */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Placement Timeline
            </CardTitle>
            <CardDescription>
              Define the placement season period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Season Start Date</Label>
                <Input
                  type="date"
                  value={settings.placementSeasonStart}
                  onChange={(e) => setSettings({ ...settings, placementSeasonStart: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Season End Date</Label>
                <Input
                  type="date"
                  value={settings.placementSeasonEnd}
                  onChange={(e) => setSettings({ ...settings, placementSeasonEnd: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Company Settings */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Company Settings
            </CardTitle>
            <CardDescription>
              Configure company verification requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Require Company Verification</p>
                <p className="text-sm text-muted-foreground">
                  Companies must be verified before posting jobs
                </p>
              </div>
              <Switch
                checked={settings.requireCompanyVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireCompanyVerification: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure when students receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Job Posted</p>
                <p className="text-sm text-muted-foreground">
                  Notify students when new jobs are posted
                </p>
              </div>
              <Switch
                checked={settings.notifyOnNewJob}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyOnNewJob: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Application Updates</p>
                <p className="text-sm text-muted-foreground">
                  Notify students on application status changes
                </p>
              </div>
              <Switch
                checked={settings.notifyOnApplicationUpdate}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyOnApplicationUpdate: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Drive Registration</p>
                <p className="text-sm text-muted-foreground">
                  Notify students about new placement drives
                </p>
              </div>
              <Switch
                checked={settings.notifyOnDriveRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, notifyOnDriveRegistration: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Developer Tools */}
      <motion.div variants={item}>
        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-500" />
              Developer Tools
            </CardTitle>
            <CardDescription>
              Seed demo data for testing (PEC Chandigarh based)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Seed Placement Data</p>
                <p className="text-sm text-muted-foreground">
                  Creates 40 jobs, 8 drives, 30 student profiles, 100+ applications
                </p>
              </div>
              <Button 
                variant="outline"
                className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                onClick={async () => {
                  try {
                    toast.loading('Seeding placement data...', { id: 'seed' });
                    const result = await seedPlacementData();
                    toast.success(`Seeded: ${result.jobs} jobs, ${result.drives} drives, ${result.profiles} profiles, ${result.applications} applications`, { id: 'seed' });
                  } catch (error) {
                    toast.error('Failed to seed data', { id: 'seed' });
                    console.error(error);
                  }
                }}
              >
                <Database className="w-4 h-4 mr-2" />
                Seed Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
