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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [githubStats, setGithubStats] = useState<any>(null);
  const [qrVisible, setQrVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const userId = id || user?.uid;

  useEffect(() => {
    if (!userId) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Simulated API call
        const data = {
          fullName: user?.name || "Student Name",
          role: "B.Tech Computer Science",
          semester: "7th Semester",
          bio: "Passionate full-stack developer with a focus on React and Node.js. Love building tools that make life easier.",
          stats: {
            cgpa: 8.92,
            performance: 92,
            attendance: 95,
            rank: 12
          },
          skills: [
            { name: "React", level: 90, icon: "Code2" },
            { name: "TypeScript", level: 85, icon: "Terminal" },
            { name: "Node.js", level: 80, icon: "Cpu" },
            { name: "PostgreSQL", level: 75, icon: "Hash" }
          ],
          projects: [
            { title: "Campus ERP", desc: "A full-scale college management solution.", tags: ["Next.js", "Prisma"] },
            { title: "AI Resumes", desc: "Automated resume builder for students.", tags: ["React", "AI"] }
          ],
          socials: {
            github: "johndoe",
            linkedin: "johndoe"
          }
        };
        setProfileData(data);
        if (data.socials.github) {
          fetchGithubStats(data.socials.github);
        }
      } catch (err) {
        toast.error("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId, user]);

  const fetchGithubStats = async (username: string) => {
    // Simulated GitHub API call
    setGithubStats({
      stars: 124,
      repos: 45,
      followers: 890,
      contributions: 1402
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="overflow-hidden border-2 border-primary/10 shadow-xl bg-card/50 backdrop-blur-sm">
             <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20" />
             <div className="px-6 pb-6 -mt-16 text-center">
               <Avatar className="w-32 h-32 mx-auto border-4 border-background shadow-2xl ring-2 ring-primary/20">
                 <AvatarImage src={user?.avatar} />
                 <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {profileData?.fullName?.[0]}
                 </AvatarFallback>
               </Avatar>
               
               <div className="mt-4 space-y-1">
                 <h2 className="text-2xl font-bold tracking-tight">{profileData?.fullName}</h2>
                 <p className="text-primary font-medium">{profileData?.role}</p>
                 <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                   <MapPin className="w-4 h-4" />
                   <span>PEC, Chandigarh</span>
                 </div>
               </div>

               <div className="flex gap-2 mt-6">
                 <Button onClick={handleShare} variant="outline" size="sm" className="flex-1 gap-2 border-primary/20 hover:bg-primary/5">
                   <Share2 className="w-4 h-4" /> Share
                 </Button>
                 <Button size="sm" className="flex-1 gap-2 shadow-lg shadow-primary/20">
                   <Edit2 className="w-4 h-4" /> Edit Profile
                 </Button>
               </div>
             </div>
          </Card>

          <Card className="border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Mail className="w-5 h-5 text-primary" />
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Email ADDRESS</p>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <Phone className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Phone Number</p>
                  <p className="text-sm font-medium">+91 98765-43210</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="lg:col-span-2 space-y-8">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
             <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
               {['overview', 'academic', 'projects', 'achievements'].map((tab) => (
                 <TabsTrigger 
                   key={tab} 
                   value={tab}
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-3 text-sm font-medium uppercase tracking-wider h-12"
                 >
                   {tab}
                 </TabsTrigger>
               ))}
             </TabsList>

             <TabsContent value="overview" className="mt-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { label: "CGPA", value: profileData.stats.cgpa, icon: Star, color: "text-amber-500" },
                     { label: "Attendance", value: profileData.stats.attendance + "%", icon: Clock, color: "text-emerald-500" },
                     { label: "Performance", value: profileData.stats.performance + "%", icon: Zap, color: "text-sapphire-500" },
                     { label: "Class Rank", value: "#" + profileData.stats.rank, icon: Trophy, color: "text-purple-500" }
                   ].map((stat, i) => (
                     <Card key={i} className="border-primary/5 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex flex-col items-center text-center">
                           <stat.icon className={`w-8 h-8 mb-2 ${stat.color} opacity-80`} />
                           <p className="text-2xl font-bold">{stat.value}</p>
                           <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">{stat.label}</p>
                        </CardContent>
                     </Card>
                   ))}
                </div>

                <Card className="border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm">
                   <CardHeader>
                     <CardTitle>Technical Expertise</CardTitle>
                     <CardDescription>Self-assessment based on projects and coursework</CardDescription>
                   </CardHeader>
                   <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profileData.skills.map((skill: any, i: number) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-end">
                             <div className="flex items-center gap-2">
                               <div className="p-2 rounded-md bg-primary/10">
                                 <Code2 className="w-4 h-4 text-primary" />
                               </div>
                               <span className="font-semibold">{skill.name}</span>
                             </div>
                             <span className="text-sm font-medium text-primary">{skill.level}%</span>
                           </div>
                           <Progress value={skill.level} className="h-2 rounded-full overflow-hidden bg-primary/5" />
                        </div>
                      ))}
                   </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <Card className="border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                      <div className="p-1 bg-gradient-to-r from-primary to-accent" />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0">
                         <div className="space-y-1">
                           <CardTitle className="text-lg">GitHub Activity</CardTitle>
                           <CardDescription>Live stats from @{profileData.socials.github}</CardDescription>
                         </div>
                         <Github className="w-8 h-8 text-primary/40" />
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4 pb-6">
                         <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                            <p className="text-2xl font-bold">{githubStats?.contributions}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Contributions</p>
                         </div>
                         <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
                            <p className="text-2xl font-bold">{githubStats?.stars}</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Stars</p>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className="border-primary/10 shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden">
                      <div className="p-1 bg-gradient-to-r from-accent to-primary" />
                      <CardHeader className="flex flex-row items-center justify-between space-y-0">
                         <div className="space-y-1">
                           <CardTitle className="text-lg">Digital CV</CardTitle>
                           <CardDescription>Generate and download official PDF</CardDescription>
                         </div>
                         <FileText className="w-8 h-8 text-primary/40" />
                      </CardHeader>
                      <CardContent className="flex items-center gap-4 pb-6">
                         <Button className="flex-1 gap-2">
                           <Download className="w-4 h-4" /> Download Resume
                         </Button>
                         <Button variant="outline" size="icon" onClick={() => setQrVisible(!qrVisible)}>
                            <QrCode className="w-5 h-5 text-primary" />
                         </Button>
                      </CardContent>
                   </Card>
                </div>
             </TabsContent>

             <TabsContent value="academic">
                <Stub name="Academic Records" />
             </TabsContent>
           </Tabs>
        </div>
      </div>
    </div>
  );
}

function Stub({ name }: { name: string }) {
  return (
    <Card className="border-dashed border-2 py-12">
      <CardContent className="text-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 opacity-20" />
        <p>Section {name} is being prepared for display.</p>
      </CardContent>
    </Card>
  );
}
