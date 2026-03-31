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
      const payload = {
        userId: user?.uid,
        email: user?.email || profileData?.email,
        fullName: editForm.fullName?.trim() || user?.name || profileData?.fullName,
        phone: editForm.phone?.trim() || null,
        address: editForm.address?.trim() || null,
        bio: editForm.bio?.trim() || null,
        githubUsername: editForm.githubUsername?.trim() || null,
        linkedinUsername: editForm.linkedinUsername?.trim() || null,
        role: profileData?.role || user?.role,
      };

      // Unified profile update endpoint
      await api.patch('/auth/profile', payload);

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
      toast.error('Failed to update profile. Please check all fields.');
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
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b-2 pb-12 border-primary/20">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-10">
          <div className="p-1 bg-primary">
            <Avatar className="w-32 h-32 md:w-36 md:h-36 rounded-none border-4 border-background ring-2 ring-primary ring-offset-4 ring-offset-background">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground rounded-none font-bold">
                {profileData?.fullName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-5xl font-extrabold tracking-tighter text-foreground leading-none">{profileData?.fullName}</h1>
            <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] leading-none">
              <div className="w-1.5 h-1.5 bg-background animate-pulse" />
              {displayRole}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{profileData?.address || profileData?.department || 'Institutional Campus'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Button onClick={openEdit} variant="outline" className="flex-1 md:flex-none h-14 rounded-none px-8 text-xs font-black uppercase tracking-[0.2em] border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
            Edit profile
          </Button>
          <Button onClick={handleShare} className="flex-1 md:flex-none h-14 rounded-none px-8 text-xs font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary transition-all">
            Share profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Aspect: Contact & Bio (Themed) */}
        <div className="lg:col-span-4 space-y-12 bg-primary/5 p-10 border-2 border-primary/20">
          <section className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary border-b border-primary/30 pb-2">Contact layer</h4>
            <div className="space-y-8 pt-4">
              <div className="flex items-start gap-4">
                <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground/60">Email</p>
                  <p className="text-sm font-medium">{profileData?.email || user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground/60">Phone</p>
                  <p className="text-sm font-medium">{profileData?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 border-b pb-2 border-border/40">Connect</h4>
            <div className="flex gap-4 pt-2">
               {profileData?.socials?.github && (
                 <a href={`https://github.com/${profileData.socials.github.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-2 border border-border hover:bg-muted transition-colors">
                   <Github className="w-5 h-5" />
                 </a>
               )}
               <Button variant="outline" size="icon" className="rounded-none border-border">
                 <QrCode className="w-5 h-5" />
               </Button>
            </div>
          </section>
        </div>

        {/* Right Aspect: Academic & Expertise */}
        <div className="lg:col-span-8 space-y-12">
          {/* Stats Bar (Themed Accented block) */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-2 border-primary bg-primary/5 divide-x-2 divide-primary">
            {statItems.map((stat, i) => (
              <div key={i} className="p-8 text-center space-y-1 hover:bg-primary hover:text-primary-foreground transition-all cursor-default">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{stat.label}</p>
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent flex gap-10">
              {['overview', 'academic', 'projects', 'achievements'].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground px-0 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all opacity-60 data-[state=active]:opacity-100"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="mt-10 space-y-12 animate-in fade-in duration-500">
               {/* Technical Expertise */}
               <section className="space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold tracking-tight">Technical expertise</h3>
                    <Badge variant="outline" className="rounded-none px-3 font-semibold text-[10px] uppercase tracking-widest border-muted-foreground/30">Verified</Badge>
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
                           <Progress value={typeof skill.level === 'number' ? skill.level : 0} className="h-1 rounded-none bg-muted [&>div]:bg-foreground" />
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground font-medium col-span-full py-8 border-2 border-dashed flex items-center justify-center">
                        No expertise metrics recorded.
                      </div>
                    )}
                 </div>
               </section>

               {/* Digital Dossier / CV */}
               <div className="pt-6 border-t border-border/40">
                  <div className="bg-muted/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-border/50">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-bold text-base">Institutional dossier</h4>
                      <p className="text-xs text-muted-foreground font-medium">Download the verified academic and professional summary of {profileData?.fullName}.</p>
                    </div>
                    <Button className="h-11 rounded-none bg-foreground text-background hover:bg-foreground/90 px-8 text-xs font-bold uppercase tracking-wider">
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
