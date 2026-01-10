import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Lock,
  Palette,
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
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';

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

export default function Settings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

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
    allowRecruiterContact: true,
  });

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userInfo = userDoc.data();
        setUserData(userInfo);

        // Fetch role-specific profile
        if (userInfo?.role === 'student') {
          const profileDoc = await getDoc(doc(db, 'studentProfiles', user.uid));
          setProfileData(profileDoc.data());
        } else if (userInfo?.role === 'faculty') {
          const profileDoc = await getDoc(doc(db, 'facultyProfiles', user.uid));
          setProfileData(profileDoc.data());
        } else if (userInfo?.role === 'college_admin') {
          const profileDoc = await getDoc(doc(db, 'collegeAdminProfiles', user.uid));
          setProfileData(profileDoc.data());
        } else if (userInfo?.role === 'placement_officer') {
          const profileDoc = await getDoc(doc(db, 'placementOfficerProfiles', user.uid));
          setProfileData(profileDoc.data());
        } else if (userInfo?.role === 'recruiter') {
          const profileDoc = await getDoc(doc(db, 'recruiterProfiles', user.uid));
          setProfileData(profileDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [authLoading, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card-elevated p-6">
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

            <div className="card-elevated p-6">
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

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="card-elevated p-6">
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

            <div className="card-elevated p-6">
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
            className="card-elevated p-6"
          >
            <h3 className="font-semibold text-foreground mb-6">Privacy Settings</h3>
            <div className="space-y-4">
              {[
                { key: 'profileVisible', label: 'Public Profile', description: 'Allow others to view your profile' },
                { key: 'showEmail', label: 'Show Email', description: 'Display email on public profile' },
                { key: 'showPhone', label: 'Show Phone', description: 'Display phone on public profile' },
                { key: 'allowRecruiterContact', label: 'Recruiter Contact', description: 'Allow recruiters to contact you directly' },
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
            className="card-elevated p-6"
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
                        const user = auth.currentUser;
                        if (!user) return;
                        
                        const collectionName = userData?.role === 'student' ? 'studentProfiles' : 
                                              userData?.role === 'faculty' ? 'facultyProfiles' :
                                              userData?.role === 'college_admin' ? 'collegeAdminProfiles' :
                                              userData?.role === 'placement_officer' ? 'placementOfficerProfiles' :
                                              'recruiterProfiles';
                        
                        await updateDoc(doc(db, collectionName, user.uid), {
                          githubUsername: deleteField(),
                        });
                        
                        setProfileData({ ...profileData, githubUsername: null });
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
                        const user = auth.currentUser;
                        if (!user) return;
                        
                        const collectionName = userData?.role === 'student' ? 'studentProfiles' : 
                                              userData?.role === 'faculty' ? 'facultyProfiles' :
                                              userData?.role === 'college_admin' ? 'collegeAdminProfiles' :
                                              userData?.role === 'placement_officer' ? 'placementOfficerProfiles' :
                                              'recruiterProfiles';
                        
                        await updateDoc(doc(db, collectionName, user.uid), {
                          githubUsername: username.replace('@', ''),
                        });
                        
                        setProfileData({ ...profileData, githubUsername: username.replace('@', '') });
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
                        const user = auth.currentUser;
                        if (!user) return;
                        
                        const collectionName = userData?.role === 'student' ? 'studentProfiles' : 
                                              userData?.role === 'faculty' ? 'facultyProfiles' :
                                              userData?.role === 'college_admin' ? 'collegeAdminProfiles' :
                                              userData?.role === 'placement_officer' ? 'placementOfficerProfiles' :
                                              'recruiterProfiles';
                        
                        await updateDoc(doc(db, collectionName, user.uid), {
                          linkedinUsername: deleteField(),
                        });
                        
                        setProfileData({ ...profileData, linkedinUsername: null });
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
                        const user = auth.currentUser;
                        if (!user) return;
                        
                        const collectionName = userData?.role === 'student' ? 'studentProfiles' : 
                                              userData?.role === 'faculty' ? 'facultyProfiles' :
                                              userData?.role === 'college_admin' ? 'collegeAdminProfiles' :
                                              userData?.role === 'placement_officer' ? 'placementOfficerProfiles' :
                                              'recruiterProfiles';
                        
                        await updateDoc(doc(db, collectionName, user.uid), {
                          linkedinUsername: username.replace('@', ''),
                        });
                        
                        setProfileData({ ...profileData, linkedinUsername: username.replace('@', '') });
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
            <div className="card-elevated p-6">
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

            <div className="card-elevated p-6">
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

            <div className="card-elevated p-6 border-destructive/50">
              <h3 className="font-semibold text-destructive mb-4">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
