'use client';

import { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  FileText,
  Github,
  Edit2,
  Download,
  QrCode,
  Loader2,
  Star,
  ShieldCheck,
  Trophy,
  Code2,
  Share2,
  Clock,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
        const profileRes = await api.get('/auth/profile');
        const profile = extractData<any>(profileRes.data) || {};
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
          stats: profile.stats || null,
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
            const resp = await fetch(`https://api.github.com/users/${githubUsername.replace('@', '')}`);
            if (!resp.ok) return;
            const data = await resp.json();
            if (!active) return;
            setGithubStats({
              repos: data.public_repos,
              followers: data.followers,
              avatar: data.avatar_url,
            });
          } catch {
            // ignore github failures without blocking profile
          }
        } else {
          setGithubStats(null);
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
      await api.post('/auth/complete-profile', {
        fullName: editForm.fullName?.trim(),
        phone: editForm.phone?.trim() || null,
        address: editForm.address?.trim() || null,
        bio: editForm.bio?.trim() || null,
        githubUsername: editForm.githubUsername?.trim() || null,
        linkedinUsername: editForm.linkedinUsername?.trim() || null,
        role: profileData?.role || user?.role,
      });
      toast.success('Profile updated');
      setEditOpen(false);
      // Refresh profile data
      const profileRes = await api.get('/auth/profile');
      const profile = extractData<any>(profileRes.data) || {};
      setProfileData((prev: any) => ({
        ...prev,
        ...profile,
        fullName: profile.fullName || profile.name || user?.name || 'User',
        role: profile.role || user?.role || 'user',
        socials: {
          github: profile.githubUsername || profile.socials?.github || null,
          linkedin: profile.linkedinUsername || profile.socials?.linkedin || null,
        },
        skills: Array.isArray(profile.skills) ? profile.skills : [],
        projects: Array.isArray(profile.projects) ? profile.projects : [],
        stats: profile.stats || null,
      }));
    } catch (error) {
      toast.error('Failed to update profile');
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
    <div className="container mx-auto max-w-7xl p-6 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info (Sync with Older UI Pattern) */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="overflow-hidden border-2 border-primary/10 shadow-xl bg-card">
             <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20" />
             <div className="px-6 pb-6 -mt-16 text-center">
               <Avatar className="w-32 h-32 mx-auto border-4 border-background shadow-2xl ring-2 ring-primary/20">
                 <AvatarImage src={avatarUrl} />
                 <AvatarFallback className="text-3xl bg-primary/10 text-primary font-black">
                    {profileData?.fullName?.[0]}
                 </AvatarFallback>
               </Avatar>
               
               <div className="mt-6 space-y-2">
                 <h2 className="text-4xl font-[1000] tracking-tighter leading-none">{profileData?.fullName}</h2>
                 <p className="text-primary font-black uppercase text-sm tracking-widest">{displayRole}</p>
                 <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-black uppercase tracking-wider">
                   <MapPin className="w-4 h-4 text-accent" />
                   <span>{profileData?.address || profileData?.department || 'PEC Campus'}</span>
                 </div>
               </div>

               <div className="flex gap-2 mt-6">
                 <Button onClick={handleShare} variant="outline" size="sm" className="flex-1 gap-2 border-primary/20 font-bold uppercase text-[10px] tracking-widest">
                   <Share2 className="w-3.5 h-3.5" /> Share
                 </Button>
                 <Button onClick={openEdit} size="sm" className="flex-1 gap-2 bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-widest">
                   <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                 </Button>
               </div>
             </div>
          </Card>

          <Card className="border-primary/10 shadow-lg bg-card translate-y-0 hover:-translate-y-1 transition-transform">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                <ShieldCheck className="w-4 h-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 group overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                <Mail className="w-5 h-5 text-primary" />
                <div className="overflow-hidden">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Email ADDRESS</p>
                  <p className="text-sm font-bold truncate">{profileData?.email || user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 group overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Phone Number</p>
                  <p className="text-sm font-bold">{profileData?.phone || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Info (Sync with Older UI Pattern) */}
        <div className="lg:col-span-2 space-y-8">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
             <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
               {['overview', 'academic', 'projects', 'achievements'].map((tab) => (
                 <TabsTrigger 
                   key={tab} 
                   value={tab}
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 py-3 text-xs font-black uppercase tracking-widest transition-all"
                 >
                   {tab}
                 </TabsTrigger>
               ))}
             </TabsList>

             <TabsContent value="overview" className="mt-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {statItems.map((stat, i) => (
                     <Card key={i} className="border-primary/5 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                        <CardContent className="p-4 flex flex-col items-center text-center relative">
                           <div className={`p-2 rounded-xl ${stat.bg} mb-2 group-hover:scale-110 transition-transform`}>
                              <stat.icon className={`w-5 h-5 ${stat.color}`} />
                           </div>
                           <p className="text-xl font-black">{stat.value}</p>
                           <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">{stat.label}</p>
                        </CardContent>
                     </Card>
                   ))}
                </div>

                <Card className="border-primary/10 shadow-lg bg-card">
                   <CardHeader>
                     <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                        <Code2 className="w-5 h-5 text-primary" />
                        Technical Expertise
                     </CardTitle>
                     <CardDescription className="text-xs font-medium">Self-assessment based on active deployments</CardDescription>
                   </CardHeader>
                   <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.isArray(profileData?.skills) && profileData.skills.length > 0 ? (
                        profileData.skills.map((skill: any, i: number) => (
                          <div key={i} className="space-y-3">
                             <div className="flex justify-between items-end">
                               <div className="flex items-center gap-2">
                                 <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                   <Code2 className="w-4 h-4" />
                                 </div>
                                 <span className="font-black text-sm uppercase tracking-tight">{skill.name || 'Skill'}</span>
                               </div>
                               <span className="text-xs font-black text-primary">
                                 {typeof skill.level === 'number' ? `${skill.level}%` : 'N/A'}
                               </span>
                             </div>
                             <Progress value={typeof skill.level === 'number' ? skill.level : 0} className="h-1.5 rounded-full overflow-hidden bg-primary/5 [&>div]:bg-primary" />
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                          No skills added yet.
                        </div>
                      )}
                   </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="border-primary/10 shadow-lg bg-card overflow-hidden">
                      <div className="p-1 bg-gradient-to-r from-primary to-accent" />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <div className="space-y-1">
                           <CardTitle className="text-sm font-black uppercase tracking-widest">GitHub Activity</CardTitle>
                           <CardDescription className="text-[10px] font-bold">
                             {profileData?.socials?.github ? `Live telemetry from @${profileData.socials.github}` : 'GitHub not connected'}
                           </CardDescription>
                         </div>
                         <Github className="w-6 h-6 text-primary/40" />
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4 pb-6 mt-4">
                         <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center group hover:bg-primary/10 transition-colors">
                            <p className="text-xl font-black">{githubStats?.repos ?? 'N/A'}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Repos</p>
                         </div>
                         <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10 text-center group hover:bg-primary/10 transition-colors">
                            <p className="text-xl font-black">{githubStats?.followers ?? 'N/A'}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Followers</p>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className="border-primary/10 shadow-lg bg-card overflow-hidden">
                      <div className="p-1 bg-gradient-to-r from-accent to-primary" />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <div className="space-y-1">
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Digital CV</CardTitle>
                            <CardDescription className="text-[10px] font-bold">Generate institutional dossier</CardDescription>
                         </div>
                         <FileText className="w-6 h-6 text-primary/40" />
                      </CardHeader>
                      <CardContent className="flex items-center gap-4 pb-6 mt-4">
                         <Button className="flex-1 gap-2 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest h-11 rounded-xl">
                           <Download className="w-3.5 h-3.5" /> Download Dossier
                         </Button>
                         <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-primary/10">
                            <QrCode className="w-4 h-4 text-primary" />
                         </Button>
                      </CardContent>
                   </Card>
                </div>
             </TabsContent>

             <TabsContent value="academic">
                <Card className="border-dashed border-2 py-12 bg-muted/20">
                  <CardContent className="text-center text-muted-foreground">
                    <Clock className="w-8 h-8 animate-pulse mx-auto mb-4 opacity-20" />
                    <p className="font-bold uppercase tracking-widest text-xs">Section being prepared for deployment.</p>
                  </CardContent>
                </Card>
             </TabsContent>
           </Tabs>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
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
