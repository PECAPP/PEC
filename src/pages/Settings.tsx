import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Lock,
  Globe,
  Shield,
  Smartphone,
  Mail,
  Github,
  Linkedin,
  Save,
  LogOut,
  ChevronRight,
  Loader2,
  Palette,
  Check,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { authClient } from '@/lib/auth-client';
import { LoadingGrid } from '@/components/common/AsyncState';
// Admin Settings
import CollegeSettings from './admin/CollegeSettings';
import PaymentSettings from './admin/PaymentSettings';
import PlacementSettingsPage from './admin/PlacementSettings';
import { Building2, CreditCard, Cog } from 'lucide-react';

interface ConnectedAccount {
  id: string;
  name: string;
  icon: React.ElementType;
  connected: boolean;
  username?: string;
}

const connectedAccounts: ConnectedAccount[] = [
  { id: 'github', name: 'GitHub', icon: Github, connected: false },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, connected: false },
  { id: 'google', name: 'Google', icon: Mail, connected: false },
];

const extractData = <T,>(payload: any): T => {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const profilePrefsKey = user?.uid ? `profile-prefs:${user.uid}` : null;

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    placements: true,
    attendance: true,
    grades: true,
    deadlines: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
  });

  // Accent color themes
  const accentColors = [
    { id: 'obsidian', name: 'Obsidian', color: '#18181B' },
    { id: 'emerald', name: 'Emerald', color: '#10B981' },
    { id: 'sapphire', name: 'Sapphire', color: '#3B82F6' },
    { id: 'amethyst', name: 'Amethyst', color: '#8B5CF6' },
    { id: 'coral', name: 'Gold', color: '#EAB308' },
  ];

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accent-color') || 'obsidian';
  });

  // Apply accent color to body class
  useEffect(() => {
    const root = document.documentElement;
    // Remove all existing accent classes
    accentColors.forEach(({ id }) => root.classList.remove(`accent-${id}`));
    // Add the new accent class
    root.classList.add(`accent-${accentColor}`);
    localStorage.setItem('accent-color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    if (authLoading) return; // Wait for ({} as any) to load
    
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    const loadUserData = async () => {
      try {
        const profileRes = await api.get('/auth/profile');
        const profile = extractData<any>(profileRes.data) || {};
        const localPrefs = profilePrefsKey
          ? JSON.parse(localStorage.getItem(profilePrefsKey) || '{}')
          : {};
        const mergedProfile = { ...profile, ...localPrefs };

        setUserData(mergedProfile);
        setProfileData(mergedProfile);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadUserData();
  }, [authLoading, navigate, profilePrefsKey, user]);

  const saveLocalProfilePrefs = (changes: Record<string, any>) => {
    if (!profilePrefsKey) return;
    const current = JSON.parse(localStorage.getItem(profilePrefsKey) || '{}');
    localStorage.setItem(profilePrefsKey, JSON.stringify({ ...current, ...changes }));
  };

  const persistProfile = async (changes: Record<string, any>) => {
    if (!user) return false;

    const merged = {
      ...(profileData || {}),
      ...(userData || {}),
      ...changes,
    };

    try {
      const role = merged.role || userData?.role || user.role;
      await api.post('/auth/complete-profile', {
        role,
        fullName: merged.fullName || merged.name || '',
        enrollmentNumber: merged.enrollmentNumber,
        department: merged.department,
        semester: merged.semester,
        employeeId: merged.employeeId,
        designation: merged.designation,
        phone: merged.phone,
        dob: merged.dob,
        address: merged.address,
        bio: merged.bio,
        specialization: merged.specialization,
        qualifications: merged.qualifications,
        githubUsername: merged.githubUsername || null,
        linkedinUsername: merged.linkedinUsername || null,
        isPublic: merged.isPublic !== false,
      });

      saveLocalProfilePrefs({
        githubUsername: merged.githubUsername || null,
        linkedinUsername: merged.linkedinUsername || null,
        isPublic: merged.isPublic !== false,
      });

      setProfileData(merged);
      setUserData((prev: any) => ({ ...prev, ...merged }));
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.logout();
      window.dispatchEvent(new Event('auth-change'));
      toast.success('Signed out successfully');
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="h-8 w-56 bg-muted rounded-md animate-pulse" />
        <LoadingGrid count={3} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-28 rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-2">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="gap-2">
            <Lock className="w-4 h-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="connected" className="gap-2">
            <Globe className="w-4 h-4" />
            Connected
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          
          {/* Admin Settings Tabs */}
          {user?.role === 'college_admin' && (
            <>
              <TabsTrigger value="college" className="gap-2">
                <Building2 className="w-4 h-4" />
                College
              </TabsTrigger>
              <TabsTrigger value="payment" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="placement" className="gap-2">
                <Cog className="w-4 h-4" />
                Placement
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card-elevated ui-card-pad">
              <h3 className="font-semibold text-foreground mb-6">Personal Information</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input value={userData?.fullName || profileData?.fullName || ''} className="mt-1" readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">
                    {userData?.role === 'student' ? 'Enrollment Number' : 'Employee ID'}
                  </label>
                  <Input 
                    value={profileData?.enrollmentNumber || profileData?.employeeId || 'N/A'} 
                    disabled 
                    className="mt-1 bg-muted" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input value={userData?.email || profileData?.email || ''} disabled className="mt-1 bg-muted" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <Input defaultValue={profileData?.phone || ''} className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-foreground">Department</label>
                  <Input value={profileData?.department || 'N/A'} disabled className="mt-1 bg-muted" />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

            <div className="card-elevated ui-card-pad">
              <h3 className="font-semibold text-foreground mb-6">Preferences</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Language</label>
                  <Select defaultValue="en">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                      <SelectItem value="ta">Tamil</SelectItem>
                      <SelectItem value="te">Telugu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Timezone</label>
                  <Select defaultValue="ist">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ist">IST (UTC+5:30)</SelectItem>
                      <SelectItem value="pst">PST (UTC-8)</SelectItem>
                      <SelectItem value="est">EST (UTC-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card-elevated ui-card-pad">
              <h3 className="font-semibold text-foreground mb-2">Accent Color</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Choose your preferred accent color for buttons, links, and highlights.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setAccentColor(color.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      accentColor === color.id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-full shadow-lg ring-2 ring-white/20"
                      style={{ background: color.color }}
                    />
                    <span className="text-sm font-medium text-foreground">
                      {color.name}
                    </span>
                    {accentColor === color.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-elevated ui-card-pad">
              <h3 className="font-semibold text-foreground mb-2">Theme</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Light and dark modes are automatically managed by your system preferences.
              </p>
              <Badge variant="outline">System Preference</Badge>
            </div>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card-elevated ui-card-pad">
              <h3 className="font-semibold text-foreground mb-6">Notification Channels</h3>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', description: 'Receive updates via email', icon: Mail },
                  { key: 'push', label: 'Push Notifications', description: 'Browser push notifications', icon: Bell },
                  { key: 'sms', label: 'SMS Alerts', description: 'Important alerts via SMS', icon: Smartphone },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-foreground/10">
                        <item.icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="card-elevated ui-card-pad">
              <h3 className="font-semibold text-foreground mb-6">Notification Types</h3>
              <div className="space-y-4">
                {[
                  { key: 'placements', label: 'Placement Updates', description: 'New jobs and application status' },
                  { key: 'attendance', label: 'Attendance Alerts', description: 'Low attendance warnings' },
                  { key: 'grades', label: 'Grade Updates', description: 'New grades and results' },
                  { key: 'deadlines', label: 'Deadline Reminders', description: 'Assignment and fee deadlines' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated ui-card-pad"
          >
            <h3 className="font-semibold text-foreground mb-6">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">Public Profile</p>
                  <p className="text-sm text-muted-foreground">Allow others to view your profile via shareable link</p>
                  {profileData?.isPublic !== false && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/student/${user?.uid}`);
                        toast.success('Link copied');
                      }}
                      className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
                    >
                      Copy Link <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <Switch
                  checked={profileData?.isPublic !== false}
                  onCheckedChange={async (checked) => {
                    try {
                      const ok = await persistProfile({ isPublic: checked });
                      if (!ok) throw new Error('Unable to persist');
                      toast.success(`Profile is now ${checked ? 'Public' : 'Private'}`);
                    } catch (error) {
                      toast.error('Failed to update privacy');
                    }
                  }}
                />
              </div>

              {[
                { key: 'showEmail', label: 'Show Email', description: 'Display email on public profile' },
                { key: 'showPhone', label: 'Show Phone', description: 'Display phone on public profile' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={privacy[item.key as keyof typeof privacy]}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, [item.key]: checked })
                    }
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        {/* Connected Accounts Tab */}
        <TabsContent value="connected">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-elevated ui-card-pad"
          >
            <h3 className="font-semibold text-foreground mb-6">Connected Accounts</h3>
            <div className="space-y-4">
              {/* GitHub */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Github className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">GitHub</p>
                    {profileData?.githubUsername ? (
                      <p className="text-sm text-muted-foreground">@{profileData.githubUsername}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                {profileData?.githubUsername ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const ok = await persistProfile({ githubUsername: null });
                        if (!ok) throw new Error('Unable to persist');
                        toast.success('GitHub disconnected');
                      } catch (err) {
                        toast.error('Failed to disconnect');
                      }
                    }}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={async () => {
                      const username = prompt('Enter your GitHub username:');
                      if (!username) return;
                      
                      try {
                        const normalized = username.replace('@', '').trim();
                        const ok = await persistProfile({ githubUsername: normalized });
                        if (!ok) throw new Error('Unable to persist');
                        toast.success('GitHub connected!');
                      } catch (err) {
                        toast.error('Failed to connect GitHub');
                      }
                    }}
                  >
                    Connect
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>

              {/* LinkedIn */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Linkedin className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">LinkedIn</p>
                    {profileData?.linkedinUsername ? (
                      <p className="text-sm text-muted-foreground">@{profileData.linkedinUsername}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                {profileData?.linkedinUsername ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const ok = await persistProfile({ linkedinUsername: null });
                        if (!ok) throw new Error('Unable to persist');
                        toast.success('LinkedIn disconnected');
                      } catch (err) {
                        toast.error('Failed to disconnect');
                      }
                    }}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button 
                    size="sm"
                    onClick={async () => {
                      const username = prompt('Enter your LinkedIn username:');
                      if (!username) return;
                      
                      try {
                        const normalized = username.replace('@', '').trim();
                        const ok = await persistProfile({ linkedinUsername: normalized });
                        if (!ok) throw new Error('Unable to persist');
                        toast.success('LinkedIn connected!');
                      } catch (err) {
                        toast.error('Failed to connect LinkedIn');
                      }
                    }}
                  >
                    Connect
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card-elevated ui-card-pad">
              <h3 className="font-semibold text-foreground mb-6">Change Password</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-sm font-medium text-foreground">Current Password</label>
                  <Input type="password" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <Input type="password" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                  <Input type="password" className="mt-1" />
                </div>
                <Button>Update Password</Button>
              </div>
            </div>

            <div className="card-elevated ui-card-pad">
              <h3 className="font-semibold text-foreground mb-6">Two-Factor Authentication</h3>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium text-foreground">2FA Status</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Badge variant="outline" className="text-warning border-warning">
                  Not Enabled
                </Badge>
              </div>
              <Button variant="outline" className="mt-4">
                Enable 2FA
              </Button>
            </div>

            <div className="card-elevated ui-card-pad border-destructive/50">
              <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" onClick={() => void handleSignOut()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              <Button variant="destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>
        {/* Admin Tabs Content */}
        {user?.role === 'college_admin' && (
          <>
            <TabsContent value="college">
              <CollegeSettings embedded={true} />
            </TabsContent>
            <TabsContent value="payment">
              <PaymentSettings embedded={true} />
            </TabsContent>
            <TabsContent value="placement">
              <PlacementSettingsPage embedded={true} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
