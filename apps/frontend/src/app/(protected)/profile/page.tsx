'use client';
import { Button, Progress, Badge, Avatar, AvatarFallback, AvatarImage, Tabs, TabsContent, TabsList, TabsTrigger, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input, Textarea, AppShellSkeleton } from "@pec/ui";


import { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Github,
  Download,
  QrCode,
  Star,
  Trophy,
  Clock,
  Zap,
  User,
  GraduationCap,
  Briefcase,
  BookOpen,
  Award,
  FileSpreadsheet,
  Calendar,
  ExternalLink,
  Activity,
  Sparkles
} from 'lucide-react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import api from "@pec/api";
import { extractData } from '@/lib/utils';

export default function StudentProfile() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [githubStats, setGithubStats] = useState<any>(null);
  const [_githubLookupError, setGithubLookupError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [cgpaSummary, setCgpaSummary] = useState<any>(null);
  const [cgpaEntries, setCgpaEntries] = useState<any[]>([]);
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [facultyBioData, setFacultyBioData] = useState<any>(null);
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
        const [profileRes, socialRes, statsRes] = await Promise.all([
          api.get('/auth/profile'),
          api.get('/social-sync'),
          api.get('/attendance/summary').catch(() => ({ data: null }))
        ]);
        const profile = extractData<any>(profileRes.data) || {};
        const socialData = socialRes.data || {};
        const statsSummary = extractData<any>(statsRes.data) || {};
        if (!active) return;

        const resolvedRole = profile.role || user?.role || 'student';
        
        let portfolioResData = null;
        let cgpaSummaryData = null;
        let cgpaEntriesData = [];
        let facultyBioResData = null;

        if (resolvedRole === 'student') {
          const [portRes, cgpaSumRes, cgpaEntRes] = await Promise.all([
            api.get('/student-portfolio').catch(() => null),
            api.get('/cgpa-entries/dashboard/summary').catch(() => null),
            api.get('/cgpa-entries').catch(() => null)
          ]);
          portfolioResData = portRes?.data || null;
          cgpaSummaryData = cgpaSumRes ? extractData<any>(cgpaSumRes.data) : null;
          cgpaEntriesData = cgpaEntRes ? (extractData<any[]>(cgpaEntRes.data) || []) : [];
        } else if (resolvedRole === 'faculty') {
          const facultyRes = await api.get(`/faculty-bio-system/${userId}`).catch(() => null);
          facultyBioResData = facultyRes?.data || null;
        }

        const normalizedProfile = {
          ...profile,
          fullName: profile.fullName || profile.name || user?.name || 'User',
          role: resolvedRole,
          socials: {
            github: profile.githubUsername || socialData.github?.username || profile.socials?.github || null,
            linkedin: profile.linkedinUsername || socialData.linkedin?.username || profile.socials?.linkedin || null,
          },
          skills: Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills : (portfolioResData?.skills || []),
          projects: Array.isArray(profile.projects) && profile.projects.length > 0 ? profile.projects : (portfolioResData?.projects || []),
          stats: {
            cgpa: cgpaSummaryData?.cgpa || profile.stats?.cgpa || 0,
            attendance: statsSummary.totalSummary?.percentage || profile.stats?.attendance || 0,
            performance: statsSummary.totalSummary?.performanceRatio || profile.stats?.performance || 0,
            rank: profile.stats?.rank || null,
          },
        };

        setProfileData(normalizedProfile);
        setCgpaSummary(cgpaSummaryData);
        setCgpaEntries(cgpaEntriesData);
        setPortfolioData(portfolioResData);
        setFacultyBioData(facultyBioResData);

        setEditForm({
          fullName: normalizedProfile.fullName || '',
          phone: normalizedProfile.phone || '',
          address: normalizedProfile.address || '',
          bio: normalizedProfile.bio || '',
          githubUsername: normalizedProfile.socials?.github || '',
          linkedinUsername: normalizedProfile.socials?.linkedin || '',
        });

        const githubData = socialData.github;
        if (githubData?.available && githubData?.data) {
          setGithubStats({
            repos: githubData.data.public_repos,
            followers: githubData.data.followers,
            avatar: githubData.data.avatar_url,
          });
          setGithubLookupError(null);
        } else if (githubData?.available) {
          setGithubStats(null);
          setGithubLookupError('GitHub data unavailable right now.');
        } else {
          setGithubStats(null);
          setGithubLookupError(null);
        }
      } catch (_err) {
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

      await Promise.all([
        api.post('/auth/complete-profile', payload),
        api.patch('/social-sync', {
          githubUsername: editForm.githubUsername?.trim() || null,
          linkedinUsername: editForm.linkedinUsername?.trim() || null,
        }),
      ]);

      toast.success('Profile updated');
      setEditOpen(false);
      
      // Refresh profile, social, and stats
      const [profileRes, socialRes, statsRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/social-sync'),
        api.get('/attendance/summary').catch(() => ({ data: null }))
      ]);

      const profile = extractData<any>(profileRes.data) || {};
      const socialData = socialRes.data || {};
      const statsSummary = extractData<any>(statsRes.data) || {};

      const newResolvedRole = profile.role || user?.role || 'student';
      
      let portfolioResData = null;
      let cgpaSummaryData = null;
      let cgpaEntriesData = [];
      let facultyBioResData = null;

      if (newResolvedRole === 'student') {
        const [portRes, cgpaSumRes, cgpaEntRes] = await Promise.all([
          api.get('/student-portfolio').catch(() => null),
          api.get('/cgpa-entries/dashboard/summary').catch(() => null),
          api.get('/cgpa-entries').catch(() => null)
        ]);
        portfolioResData = portRes?.data || null;
        cgpaSummaryData = cgpaSumRes ? extractData<any>(cgpaSumRes.data) : null;
        cgpaEntriesData = cgpaEntRes ? (extractData<any[]>(cgpaEntRes.data) || []) : [];
      } else if (newResolvedRole === 'faculty') {
        const facultyRes = await api.get(`/faculty-bio-system/${userId}`).catch(() => null);
        facultyBioResData = facultyRes?.data || null;
      }

      setCgpaSummary(cgpaSummaryData);
      setCgpaEntries(cgpaEntriesData);
      setPortfolioData(portfolioResData);
      setFacultyBioData(facultyBioResData);

      setProfileData((prev: any) => ({
        ...prev,
        ...profile,
        fullName: profile.fullName || profile.name || user?.name || 'User',
        role: newResolvedRole,
        socials: {
          github: profile.githubUsername || socialData.github?.username || profile.socials?.github || null,
          linkedin: profile.linkedinUsername || socialData.linkedin?.username || profile.socials?.linkedin || null,
        },
        skills: Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills : (portfolioResData?.skills || []),
        projects: Array.isArray(profile.projects) && profile.projects.length > 0 ? profile.projects : (portfolioResData?.projects || []),
        stats: {
          cgpa: cgpaSummaryData?.cgpa || profile.stats?.cgpa || 0,
          attendance: statsSummary.totalSummary?.percentage || profile.stats?.attendance || 0,
          performance: statsSummary.totalSummary?.performanceRatio || profile.stats?.performance || 0,
          rank: profile.stats?.rank || null,
        },
      }));
      if (socialData.github?.available && socialData.github?.data) {
        setGithubStats({
          repos: socialData.github.data.public_repos,
          followers: socialData.github.data.followers,
          avatar: socialData.github.data.avatar_url,
        });
      }
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
        <AppShellSkeleton />
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
      return 'Admin';
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
    <div className="space-y-8">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b pb-8 border-border">
        <div className="flex flex-col md:flex-row items-center md:items-center gap-10">
          <div className="p-1.5 bg-primary/15 rounded-sm border border-border/40">
            <Avatar className="w-28 h-28 md:w-32 md:h-32 rounded-sm border border-border/40">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="text-4xl bg-primary text-primary-foreground rounded-sm font-bold">
                {profileData?.fullName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="space-y-3 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-none">{profileData?.fullName}</h1>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold border border-border/40 rounded-sm">
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
          <Button onClick={openEdit} variant="outline" className="flex-1 md:flex-none h-11 px-3 md:px-6 text-sm font-semibold border border-border/40 text-primary hover:bg-primary/10">
            Edit Profile
          </Button>
          <Button onClick={handleShare} className="flex-1 md:flex-none h-11 px-3 md:px-6 text-sm font-semibold bg-primary text-primary-foreground">
            Share Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Aspect: Contact & Bio (Themed) */}
        <div className="lg:col-span-4 space-y-8 bg-card p-3 md:p-6 border border-border rounded-sm">
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
                 <a href={`https://github.com/${profileData.socials.github.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="p-2 border border-border rounded-sm hover:bg-muted transition-colors">
                   <Github className="w-5 h-5" />
                 </a>
               )}
               <Button variant="outline" size="icon" className="rounded-sm border-border">
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
              <div key={i} className="p-3 md:p-5 text-center space-y-1 border border-border rounded-sm bg-card">
                <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
              </div>
            ))}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'academic', label: 'Academic', icon: GraduationCap },
                { id: 'projects', label: 'Projects', icon: Briefcase },
                { id: 'achievements', label: 'Achievements', icon: Trophy }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger 
                    key={tab.id} 
                    value={tab.id}
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground px-4 py-3 text-xs font-semibold capitalize transition-all opacity-70 data-[state=active]:opacity-100 gap-2"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="overview" className="mt-10 space-y-12 animate-in fade-in duration-500">
               {/* Technical Expertise */}
               <section className="space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold tracking-tight">Technical Expertise</h3>
                    <Badge variant="outline" className="px-3 font-semibold text-[10px]  border-muted-foreground/30">Verified</Badge>
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
                           <Progress value={typeof skill.level === 'number' ? skill.level : 0} className="h-2 rounded-sm bg-muted [&>div]:bg-primary" />
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground font-medium col-span-full py-4 md:py-8 border border-dashed rounded-sm flex items-center justify-center bg-card">
                        No expertise metrics recorded.
                      </div>
                    )}
                 </div>
               </section>

               {/* Digital Dossier / CV */}
               <div className="pt-6 border-t border-border/40">
                  <div className="bg-card p-3 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-border rounded-sm">
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-bold text-base">Academic Profile Document</h4>
                      <p className="text-xs text-muted-foreground font-medium">Download the verified academic and professional summary of {profileData?.fullName}.</p>
                    </div>
                    <Button className="h-11 bg-primary text-primary-foreground px-3 md:px-6 text-xs font-semibold ">
                      <Download className="w-4 h-4 mr-2" /> Download CV
                    </Button>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="academic" className="mt-10 space-y-8 animate-in fade-in duration-500">
              {profileData?.role === 'student' ? (
                <div className="space-y-8">
                  {/* Student Stats Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-card/40 border border-border/40 p-5 rounded-sm flex items-center gap-4">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-sm">
                        <Star className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Cumulative GPA</p>
                        <p className="text-2xl font-bold tracking-tight">
                          {cgpaSummary?.cgpa ? cgpaSummary.cgpa.toFixed(2) : (profileData?.stats?.cgpa ? Number(profileData.stats.cgpa).toFixed(2) : 'N/A')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-card/40 border border-border/40 p-5 rounded-sm flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-sm">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Earned Credits</p>
                        <p className="text-2xl font-bold tracking-tight">{cgpaSummary?.totalCredits || '0'} Credits</p>
                      </div>
                    </div>

                    <div className="bg-card/40 border border-border/40 p-5 rounded-sm flex items-center gap-4">
                      <div className="p-3 bg-rose-500/10 text-rose-500 rounded-sm">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">Active Backlogs</p>
                        <p className="text-2xl font-bold tracking-tight">{cgpaSummary?.backlogCount || '0'}</p>
                      </div>
                    </div>
                  </div>

                  {/* SGPA Timeline */}
                  <div className="bg-card/40 border border-border/40 p-6 rounded-sm space-y-6">
                    <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Semester-wise SGPA Progression
                    </h3>
                    
                    {cgpaSummary?.semesters && cgpaSummary.semesters.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {cgpaSummary.semesters.map((sem: any, i: number) => (
                          <div key={i} className="bg-background/40 border border-border/40 p-4 rounded-sm space-y-2 relative overflow-hidden group hover:border-primary/20 transition-colors">
                            <div className="absolute top-0 right-0 bg-primary/10 text-primary text-[9px] font-mono font-bold px-2 py-0.5 uppercase">
                              Sem {sem.semester}
                            </div>
                            <p className="text-xs text-muted-foreground font-semibold">Semester {sem.semester}</p>
                            <p className="text-2xl font-bold tracking-tight font-mono">{sem.sgpa ? sem.sgpa.toFixed(2) : '0.00'}</p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                                <span>SGPA</span>
                                <span>{sem.credits} Cr.</span>
                              </div>
                              <Progress value={(sem.sgpa / 10) * 100} className="h-1 rounded-sm [&>div]:bg-primary" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground py-6 text-center">
                        No semester-wise GPA tracking data available.
                      </div>
                    )}
                  </div>

                  {/* Course Records Table */}
                  <div className="bg-card/40 border border-border/40 p-6 rounded-sm space-y-4">
                    <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      Academic Course Registry
                    </h3>

                    {cgpaEntries && cgpaEntries.length > 0 ? (
                      <div className="overflow-x-auto border border-border/40 rounded-sm">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-muted/50 border-b border-border/40 font-bold uppercase text-[10px] text-muted-foreground">
                              <th className="p-3">Code</th>
                              <th className="p-3">Subject</th>
                              <th className="p-3 text-center">Semester</th>
                              <th className="p-3 text-center">Credits</th>
                              <th className="p-3 text-center">Grade Point</th>
                              <th className="p-3 text-right">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/20">
                            {cgpaEntries.map((entry: any, i: number) => (
                              <tr key={i} className="hover:bg-muted/20 transition-colors">
                                <td className="p-3 font-mono font-bold">{entry.courseCode || 'N/A'}</td>
                                <td className="p-3 font-medium text-foreground">{entry.subjectName}</td>
                                <td className="p-3 text-center font-semibold text-muted-foreground">Sem {entry.semester}</td>
                                <td className="p-3 text-center font-mono font-semibold">{entry.credits}</td>
                                <td className="p-3 text-center">
                                  <Badge variant={entry.gradePoint >= 8 ? "default" : "secondary"} className="font-mono">
                                    {entry.gradePoint.toFixed(1)}
                                  </Badge>
                                </td>
                                <td className="p-3 text-right">
                                  <span className="capitalize text-[10px] font-bold tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
                                    {entry.courseType || 'Core'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground py-8 border border-dashed rounded-sm flex items-center justify-center">
                        No academic course entries registered in this profile.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Faculty Academic Profile */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-card/40 border border-border/40 p-6 rounded-sm space-y-6">
                    <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Academic Background
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-semibold">Specialization</span>
                        <p className="text-sm font-medium">{profileData?.specialization || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-semibold">Qualifications</span>
                        <p className="text-sm font-medium">{profileData?.qualifications || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs text-muted-foreground font-semibold">Department</span>
                        <p className="text-sm font-medium">{profileData?.department || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/40 border border-border/40 p-6 rounded-sm space-y-6">
                    <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Faculty Research Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/40 border border-border/40 p-4 rounded-sm text-center">
                        <p className="text-xs text-muted-foreground font-semibold">Publications</p>
                        <p className="text-3xl font-bold font-mono text-primary mt-1">{facultyBioData?.stats?.totalPublications || '0'}</p>
                      </div>
                      <div className="bg-background/40 border border-border/40 p-4 rounded-sm text-center">
                        <p className="text-xs text-muted-foreground font-semibold">Citations</p>
                        <p className="text-3xl font-bold font-mono text-primary mt-1">{facultyBioData?.stats?.totalCitations || '0'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="projects" className="mt-10 space-y-8 animate-in fade-in duration-500">
              {profileData?.role === 'student' ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold tracking-tight">Portfolio Projects</h3>
                    <Button variant="outline" size="sm" asChild className="border-border/40 hover:bg-primary/10 text-primary">
                      <a href="/student-portfolio">Manage Projects</a>
                    </Button>
                  </div>
                  
                  {portfolioData?.projects && portfolioData.projects.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {portfolioData.projects.map((project: any, i: number) => {
                        let techStackList: string[] = [];
                        try {
                          techStackList = JSON.parse(project.techStack);
                        } catch {
                          techStackList = project.techStack ? project.techStack.split(',').map((t: string) => t.trim()) : [];
                        }

                        return (
                          <div key={i} className={`bg-card/40 border rounded-sm p-5 space-y-4 hover:border-primary/20 transition-all group ${project.isFeatured ? 'border-amber-500/40 shadow-sm shadow-amber-500/5' : 'border-border/40'}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                                  {project.title}
                                  {project.isFeatured && (
                                    <Badge variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] uppercase font-bold px-1.5 py-0">
                                      Featured
                                    </Badge>
                                  )}
                                </h4>
                                <p className="text-xs text-muted-foreground font-medium mt-1 line-clamp-3">{project.description}</p>
                              </div>
                            </div>

                            {techStackList.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {techStackList.map((tech: string, j: number) => (
                                  <Badge key={j} variant="secondary" className="text-[10px] py-0">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-4 pt-2 border-t border-border/20 text-xs">
                              {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-semibold">
                                  <Github className="w-3.5 h-3.5" />
                                  GitHub
                                </a>
                              )}
                              {project.liveUrl && (
                                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-semibold">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Live Demo
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-card/40 border border-border/40 rounded-sm shadow-sm p-12 text-center border-dashed">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p className="text-muted-foreground text-sm font-medium">No projects showcase in your portfolio yet.</p>
                      <Button size="sm" className="mt-4" asChild>
                        <a href="/student-portfolio">Add Project</a>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* Faculty Publications & Consultations */
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Research Publications
                    </h3>
                    
                    {facultyBioData?.publications && facultyBioData.publications.length > 0 ? (
                      <div className="space-y-4">
                        {facultyBioData.publications.map((pub: any, i: number) => (
                          <div key={i} className="bg-card/40 border border-border/40 p-5 rounded-sm space-y-2">
                            <h4 className="font-bold text-sm text-foreground">{pub.title}</h4>
                            <p className="text-xs text-muted-foreground font-semibold">{pub.authors} | {pub.journal} ({pub.year})</p>
                            <div className="flex gap-4 items-center text-[10px] pt-1">
                              {pub.citations !== undefined && (
                                <span className="font-mono bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-sm">
                                  Citations: {pub.citations}
                                </span>
                              )}
                              {pub.doi && (
                                <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline font-bold">
                                  <ExternalLink className="w-3 h-3" /> DOI: {pub.doi}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-8 border border-dashed rounded-sm text-center">
                        No publications listed.
                      </div>
                    )}
                  </section>

                  {facultyBioData?.consultations && facultyBioData.consultations.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Industry Consultations
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {facultyBioData.consultations.map((con: any, i: number) => (
                          <div key={i} className="bg-card/40 border border-border/40 p-5 rounded-sm space-y-2">
                            <h4 className="font-bold text-sm text-foreground">{con.client}</h4>
                            <p className="text-xs text-muted-foreground font-semibold">{con.projectTitle}</p>
                            <div className="flex justify-between items-center text-[10px] pt-1">
                              <span className="capitalize font-mono font-bold px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">
                                Status: {con.status}
                              </span>
                              {con.value && <span className="font-mono font-bold text-emerald-500">Value: {con.value}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="mt-10 space-y-8 animate-in fade-in duration-500">
              {profileData?.role === 'student' ? (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-500" />
                    Student Achievements & Certifications
                  </h3>

                  {portfolioData?.resume?.skills?.achievements && portfolioData.resume.skills.achievements.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {portfolioData.resume.skills.achievements.map((ach: string, i: number) => (
                        <div key={i} className="bg-card/40 border border-border/40 p-5 rounded-sm flex items-start gap-4 hover:border-primary/20 transition-all">
                          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-sm mt-0.5">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground">Honorary Award</h4>
                            <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">{ach}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Fallback to checking skills array / general skills if no direct achievements array */
                    portfolioData?.resume?.skills && Array.isArray(portfolioData.resume.skills) && portfolioData.resume.skills.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {portfolioData.resume.skills.slice(0, 4).map((skill: string, i: number) => (
                          <div key={i} className="bg-card/40 border border-border/40 p-5 rounded-sm flex items-start gap-4">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-sm mt-0.5">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">Skill Recognition</h4>
                              <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">Recognized proficiency in {skill} as part of advanced coursework or project building.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-card/40 border border-border/40 rounded-sm p-12 text-center border-dashed">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground text-sm font-medium">No verified honors or achievements listed.</p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                /* Faculty Awards & Conferences */
                <div className="space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      Awards & Honors
                    </h3>
                    
                    {facultyBioData?.awards && facultyBioData.awards.length > 0 ? (
                      <div className="space-y-4">
                        {facultyBioData.awards.map((award: any, i: number) => (
                          <div key={i} className="bg-card/40 border border-border/40 p-5 rounded-sm flex items-start gap-4">
                            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-sm mt-0.5">
                              <Award className="w-4 h-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-foreground">{award.title}</h4>
                              <p className="text-xs text-muted-foreground font-semibold">{award.awardingBody} ({award.year})</p>
                              {award.description && <p className="text-xs text-muted-foreground font-medium mt-1">{award.description}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-8 border border-dashed rounded-sm text-center">
                        No awards listed.
                      </div>
                    )}
                  </section>

                  {facultyBioData?.conferences && facultyBioData.conferences.length > 0 && (
                    <section className="space-y-4">
                      <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Conferences Attended
                      </h3>
                      <div className="space-y-4">
                        {facultyBioData.conferences.map((conf: any, i: number) => (
                          <div key={i} className="bg-card/40 border border-border/40 p-5 rounded-sm space-y-1">
                            <h4 className="font-bold text-sm text-foreground">{conf.name}</h4>
                            <p className="text-xs text-muted-foreground font-semibold">{conf.role} | {conf.location}</p>
                            <p className="text-[10px] text-muted-foreground font-medium">Date: {new Date(conf.startDate).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="">
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
