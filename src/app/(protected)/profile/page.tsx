'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Download,
  QrCode,
  Loader2,
  Star,
  Trophy,
  Clock,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { extractData } from '@/lib/utils';

export default function StudentProfile() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [githubStats, setGithubStats] = useState<any>(null);
  const [githubLookupError, setGithubLookupError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    bio: '',
    githubUsername: '',
    linkedinUsername: '',
  });

  const userId = id || user?.uid;

  useEffect(() => {
    if (authLoading) return;
    if (!userId) {
      setLoading(false);
      return;
    }
    let active = true;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/attendance/summary').catch(() => ({ data: null }))
        ]);

        const profile = extractData<any>(profileRes.data) || {};
        const statsSummary = extractData<any>(statsRes.data) || {};
        
        if (!active) return;

        const normalizedProfile = {
          ...profile,
          fullName: profile.fullName || profile.name || user?.name || 'User',
          role: profile.role || user?.role || 'user',
          socials: {
            github: profile.githubUsername || profile.socials?.github || null,
            linkedin: profile.linkedinUsername || profile.socials?.linkedin || null,
          },
          skills: Array.isArray(profile.skills) ? profile.skills : [],
          projects: Array.isArray(profile.projects) ? profile.projects : [],
          stats: {
            cgpa: profile.stats?.cgpa || 0,
            attendance: statsSummary.totalSummary?.percentage || profile.stats?.attendance || 0,
            performance: statsSummary.totalSummary?.performanceRatio || profile.stats?.performance || 0,
            rank: profile.stats?.rank || null,
          },
        };

        setProfileData(normalizedProfile);
        setEditForm({
          fullName: normalizedProfile.fullName || '',
          phone: normalizedProfile.phone || '',
          address: normalizedProfile.address || '',
          bio: normalizedProfile.bio || '',
          githubUsername: normalizedProfile.socials?.github || '',
          linkedinUsername: normalizedProfile.socials?.linkedin || '',
        });

        const githubUsername = normalizedProfile.socials.github;
        if (githubUsername) {
          try {
            setGithubLookupError(null);
            const resp = await fetch(`https://api.github.com/users/${githubUsername.replace('@', '')}`);
            if (resp.status === 404) {
              if (active) {
                setGithubStats(null);
                setGithubLookupError('Username not found on GitHub.');
              }
              return;
            }
            if (!resp.ok) {
              if (active) {
                setGithubStats(null);
                setGithubLookupError('GitHub lookup unavailable right now.');
              }
              return;
            }
            const data = await resp.json();
            if (!active) return;
            setGithubStats({
              repos: data.public_repos,
              followers: data.followers,
              avatar: data.avatar_url,
            });
          } catch {
            if (active) {
              setGithubStats(null);
              setGithubLookupError('GitHub lookup failed.');
            }
            // ignore github failures without blocking profile
          }
        } else {
          setGithubStats(null);
          setGithubLookupError(null);
        }
      } catch (err) {
        toast.error("Failed to fetch profile");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchAllData();
    return () => {
      active = false;
    };
  }, [authLoading, userId, user?.name, user?.role]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  const openEdit = () => {
    setEditForm({
      fullName: profileData?.fullName || '',
      phone: profileData?.phone || '',
      address: profileData?.address || '',
      bio: profileData?.bio || '',
      githubUsername: profileData?.socials?.github || '',
      linkedinUsername: profileData?.socials?.linkedin || '',
    });
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const resolvedRole = profileData?.role || user?.role || 'student';

      const payload: Record<string, any> = {
        userId: user?.uid,
        email: user?.email || profileData?.email,
        fullName: editForm.fullName?.trim() || user?.name || profileData?.fullName,
        role: resolvedRole,
        phone: editForm.phone?.trim() || null,
        address: editForm.address?.trim() || null,
        bio: editForm.bio?.trim() || null,
        githubUsername: editForm.githubUsername?.trim() || null,
        linkedinUsername: editForm.linkedinUsername?.trim() || null,
      };

      if (resolvedRole === 'student') {
        payload.enrollmentNumber = profileData?.enrollmentNumber || '';
        payload.department = profileData?.department || '';
        payload.semester = Number(profileData?.semester || 1);
      }

      if (resolvedRole === 'faculty') {
        payload.employeeId = profileData?.employeeId || '';
        payload.department = profileData?.department || '';
        payload.designation = profileData?.designation || '';
        payload.specialization = profileData?.specialization || '';
      }

      // Backend supports POST /auth/complete-profile for profile updates
      await api.post('/auth/complete-profile', payload);

      toast.success('Profile updated');
      setEditOpen(false);
      
      // Refresh profile and stats
      const [profileRes, statsRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/attendance/summary').catch(() => ({ data: null }))
      ]);

      const profile = extractData<any>(profileRes.data) || {};
      const statsSummary = extractData<any>(statsRes.data) || {};

      setProfileData((prev: any) => ({
        ...prev,
        ...profile,
        fullName: profile.fullName || profile.name || user?.name || 'User',
        role: profile.role || user?.role || 'user',
        socials: {
          github: profile.githubUsername || profile.socials?.github || null,
          linkedin: profile.linkedinUsername || profile.socials?.linkedin || null,
        },
        stats: {
          cgpa: profile.stats?.cgpa || 0,
          attendance: statsSummary.totalSummary?.percentage || profile.stats?.attendance || 0,
          performance: statsSummary.totalSummary?.performanceRatio || profile.stats?.performance || 0,
          rank: profile.stats?.rank || null,
        },
      }));
    } catch (error) {
      console.error('Update failed:', error);
      const message =
        (error as any)?.message ||
        (error as any)?.response?.data?.message ||
        'Failed to update profile. Please check all fields.';
      toast.error(message);
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

  const displayRole = (() => {
    const role = profileData?.role;
    if (role === 'student') {
      const dept = profileData?.department || 'Student';
      const sem = profileData?.semester ? `Semester ${profileData.semester}` : 'Semester -';
      return `${dept} - ${sem}`;
    }
    if (role === 'faculty') {
      const designation = profileData?.designation || 'Faculty';
      const dept = profileData?.department || 'Department';
      return `${designation} - ${dept}`;
    }
    if (role === 'college_admin') {
      return 'College Admin';
    }
    return role ? String(role) : 'User';
  })();

  const stats = profileData?.stats || {};
  const statItems = [
    { label: "CGPA", value: typeof stats.cgpa === 'number' ? stats.cgpa.toFixed(2) : 'N/A', icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Attend.", value: typeof stats.attendance === 'number' ? `${stats.attendance}%` : 'N/A', icon: Clock, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Perf.", value: typeof stats.performance === 'number' ? `${stats.performance}%` : 'N/A', icon: Zap, color: "text-sapphire-500", bg: "bg-sapphire-500/10" },
    { label: "Rank", value: stats.rank ? `#${stats.rank}` : 'N/A', icon: Trophy, color: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  const avatarUrl = profileData?.avatar || user?.avatar || githubStats?.avatar || undefined;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b pb-8 border-border">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-10">
          <div className="p-1.5 bg-primary/15 rounded-lg border border-primary/30">
            <Avatar className="w-28 h-28 md:w-32 md:h-32 rounded-md border-2 border-primary/50">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground rounded-md font-bold">
                {profileData?.fullName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-none">{profileData?.fullName}</h1>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold border border-primary/30 rounded-md">
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              {displayRole}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-muted-foreground mt-3">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{profileData?.address || profileData?.department || 'Institutional Campus'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Button onClick={openEdit} variant="outline" className="flex-1 md:flex-none h-11 px-6 text-sm font-semibold border border-primary/40 text-primary hover:bg-primary/10">
            Edit Profile
          </Button>
          <Button onClick={handleShare} className="flex-1 md:flex-none h-11 px-6 text-sm font-semibold bg-primary text-primary-foreground">
            Share Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Aspect: Contact & Bio (Themed) */}
        <div className="lg:col-span-4 space-y-8 bg-card p-6 border border-border rounded-xl">
          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground border-b border-border pb-2">Contact Information</h4>
            <div className="space-y-6 pt-2">
              <div className="flex items-start gap-4">
                <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{profileData?.email || user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{profileData?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground border-b pb-2 border-border">Professional Links</h4>
            <div className="flex gap-4 pt-2">
               {profileData?.socials?.github && (
                 <a href={`https://github.com/${profileData.socials.github.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 border border-border rounded-md hover:bg-muted transition-colors">
                   <Github className="w-5 h-5" />
                 </a>
               )}
               <Button variant="outline" size="icon" className="rounded-md border-border">
                 <QrCode className="w-5 h-5" />
               </Button>
            </div>
          </section>
        </div>

        {/* Right Aspect: Academic & Expertise */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Bar (Themed Accented block) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statItems.map((stat, i) => (
              <div key={i} className="p-5 text-center space-y-1 border border-border rounded-lg bg-card">
                <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b h-auto p-0 bg-transparent flex gap-8 rounded-none">
              {['overview', 'academic', 'projects', 'achievements'].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground px-0 py-3 text-xs font-semibold capitalize transition-all opacity-70 data-[state=active]:opacity-100"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-10 space-y-12 animate-in fade-in duration-500">
               {/* Technical Expertise */}
               <section className="space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold tracking-tight">Technical Expertise</h3>
                    <Badge variant="outline" className="px-3 font-semibold text-[10px] uppercase tracking-wider border-muted-foreground/30">Verified</Badge>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {Array.isArray(profileData?.skills) && profileData.skills.length > 0 ? (
                      profileData.skills.map((skill: any, i: number) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-end">
                             <span className="font-semibold text-sm uppercase tracking-tight text-foreground/80">{skill.name}</span>
                             <span className="text-xs font-bold font-mono">
                               {typeof skill.level === 'number' ? `${skill.level}%` : 'N/A'}
                             </span>
                           </div>
                           <Progress value={typeof skill.level === 'number' ? skill.level : 0} className="h-2 rounded-md bg-muted [&>div]:bg-primary" />
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground font-medium col-span-full py-8 border border-dashed rounded-lg flex items-center justify-center bg-card">
                        No expertise metrics recorded.
                      </div>
                    )}
                 </div>
               </section>

               {/* Digital Dossier / CV */}
               <div className="pt-6 border-t border-border/40">
                  <div className="bg-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-border rounded-lg">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-bold text-base">Academic Profile Document</h4>
                      <p className="text-xs text-muted-foreground font-medium">Download the verified academic and professional summary of {profileData?.fullName}.</p>
                    </div>
                    <Button className="h-11 bg-primary text-primary-foreground px-6 text-xs font-semibold uppercase tracking-wider">
                      <Download className="w-4 h-4 mr-2" /> Download CV
                    </Button>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="academic" className="mt-10">
               <div className="border border-dashed p-20 text-center text-muted-foreground">
                 <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-40">Section under deployment</p>
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile details and save changes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Full name"
              value={editForm.fullName}
              onChange={(event) => setEditForm((prev) => ({ ...prev, fullName: event.target.value }))}
            />
            <Input
              placeholder="Phone"
              value={editForm.phone}
              onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <Input
              placeholder="Address"
              value={editForm.address}
              onChange={(event) => setEditForm((prev) => ({ ...prev, address: event.target.value }))}
            />
            <Textarea
              rows={3}
              placeholder="Bio"
              value={editForm.bio}
              onChange={(event) => setEditForm((prev) => ({ ...prev, bio: event.target.value }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="GitHub username"
                value={editForm.githubUsername}
                onChange={(event) => setEditForm((prev) => ({ ...prev, githubUsername: event.target.value }))}
              />
              <Input
                placeholder="LinkedIn username"
                value={editForm.linkedinUsername}
                onChange={(event) => setEditForm((prev) => ({ ...prev, linkedinUsername: event.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
