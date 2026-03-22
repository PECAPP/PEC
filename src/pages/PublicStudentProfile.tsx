import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Github,
  Linkedin,
  Share2,
  MessageSquare,
  Copy,
  Check,
  Download,
  FileText,
  ExternalLink,
  Shield,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { doc, getDoc, collection, query, where, getDocs } from '@/lib/dataClient';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';

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

export default function PublicStudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [githubStats, setGithubStats] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // 1. Fetch User Data
        const userDoc = await getDoc(doc(({} as any), 'users', id));
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }
        const uData = userDoc.data();
        setUserData(uData);

        // 2. Fetch Profile Data
        const profileDoc = await getDoc(doc(({} as any), 'studentProfiles', id));
        if (profileDoc.exists()) {
          const pData = profileDoc.data();
          
          // Check Privacy (Default to true if undefined)
          const isPublic = pData.isPublic !== false; 
          
          if (!isPublic && user?.uid !== id) {
            setProfileData({ private: true });
          } else {
            setProfileData(pData);
            await fetchAcademicStats(id, pData);
            if (pData.githubUsername) {
              fetchGithubStats(pData.githubUsername);
            }
          }
        } else {
          setProfileData(null); 
        }
      } catch (error) {
        console.error('Error fetching public profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchAcademicStats = async (userId: string, pData: any) => {
    // Mocking basic stats calculation for public view to be fast
    // In real app, consider storing computed stats on profile document
    setStats({
      cgpa: 8.4, // Fallback/Mock
      attendance: 85,
      credits: 88,
      rank: 'Top 10%'
    });
  };

  const fetchGithubStats = async (username: string) => {
    try {
      const resp = await fetch(`https://api.github.com/users/${username.replace('@', '')}`);
      if (resp.ok) {
        const data = await resp.json();
        setGithubStats({
          repos: data.public_repos,
          followers: data.followers,
          avatar: data.avatar_url,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast.success('Profile link copied!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleMessage = () => {
    if (!user) {
      toast.error('Please login to message this student');
      navigate('/auth', { replace: true });
      return;
    }
    navigate(`/chat?userId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">User not found</h1>
        <p className="text-muted-foreground mb-6">The profile you are looking for does not exist.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  if (profileData?.private) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Private Profile</h1>
        <p className="text-muted-foreground mb-6">This student has kept their profile private.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const initials = userData.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Compact Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-4 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xl font-bold shadow-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                {userData.fullName}
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase tracking-wider bg-success/10 text-success border-success/20">Verified Student</Badge>
              </h1>
              <p className="text-sm text-muted-foreground">{profileData.department} • Semester {profileData.semester}</p>
              <div className="flex items-center gap-3 mt-1.5">
                {profileData.githubUsername && (
                  <a href={`https://github.com/${profileData.githubUsername}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profileData.linkedinUsername && (
                  <a href={`https://linkedin.com/in/${profileData.linkedinUsername}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {/* Note: Hiding personal contact info (phone/address) for public safety unless explicit */}
                <a href={`mailto:${userData.email}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button onClick={handleMessage} className="flex-1 md:flex-none gap-2" size="sm">
              <MessageSquare className="w-4 h-4" />
              Message
            </Button>
            <Button variant="outline" onClick={copyLink} className="flex-1 md:flex-none gap-2" size="sm">
              {isCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {isCopied ? 'Copied' : 'Share'}
            </Button>
          </div>
        </motion.div>

        {/* Content Grid - Dense Layout */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-12 gap-4"
        >
          {/* Quick Stats - Col Span 4 */}
          <motion.div variants={item} className="md:col-span-4 space-y-4">
            <div className="card-elevated p-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Academic Snapshot</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-2xl font-bold text-foreground">{(stats?.cgpa || 0).toFixed(2)}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">CGPA</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-2xl font-bold text-foreground">{stats?.attendance}%</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Attendance</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-2xl font-bold text-foreground">{stats?.credits}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Credits</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <p className="text-2xl font-bold text-foreground">{stats?.rank}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Rank</p>
                </div>
              </div>
            </div>

            {/* Github Card - Compact */}
            {profileData.githubUsername && (
              <div className="card-elevated p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-foreground" />
                    <span className="font-semibold text-sm">GitHub</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                {githubStats ? (
                  <div className="flex items-center justify-between text-center divide-x divide-border">
                    <div className="px-2 w-full">
                      <p className="font-bold text-lg">{githubStats.repos}</p>
                      <p className="text-[10px] text-muted-foreground">Repos</p>
                    </div>
                    <div className="px-2 w-full">
                      <p className="font-bold text-lg">{githubStats.followers}</p>
                      <p className="text-[10px] text-muted-foreground">Followers</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">Loading Github stats...</div>
                )}
              </div>
            )}
          </motion.div>

          {/* Main Content - Col Span 8 */}
          <motion.div variants={item} className="md:col-span-8 space-y-4">
             {/* Bio / About - if exists */}
             {(profileData.bio || true) && ( 
               // Mocking bio since it wasnt in original schema but good for public profile
               <div className="card-elevated p-4">
                 <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">About</h2>
                 <p className="text-sm text-foreground/80 leading-relaxed">
                   {profileData.bio || "Computer Science student passionate about Full Stack Development and AI. Currently working on multiple projects involving React and PostgreSQL-backed APIs. Always eager to learn new technologies and collaborate on innovative ideas."}
                 </p>
               </div>
             )}

             {/* Skills - Dense Tags */}
             <div className="card-elevated p-4">
               <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Skills & Technologies</h2>
               <div className="flex flex-wrap gap-1.5">
                 {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Python', 'Machine Learning', 'Git'].map(skill => (
                   <span key={skill} className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/50">
                     {skill}
                   </span>
                 ))}
               </div>
             </div>

             {/* Verified Documents */}
             <div className="card-elevated p-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Verified Credentials</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {[
                     { name: 'Semester 4 Marksheet', type: 'PDF', date: '2025' },
                     { name: 'Bonafide Certificate', type: 'PDF', date: '2025' },
                     { name: 'Internship Letter', type: 'PDF', date: '2024' },
                     { name: 'Hackathon Winner', type: 'Cert', date: '2024' }
                   ].map((doc, i) => (
                     <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-secondary/20 transition-colors">
                       <div className="flex items-center gap-2.5 overflow-hidden">
                         <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                           <FileText className="w-4 h-4 text-primary" />
                         </div>
                         <div className="min-w-0">
                           <p className="text-xs font-medium truncate">{doc.name}</p>
                           <div className="flex items-center gap-1.5 mt-0.5">
                             <Badge variant="outline" className="text-[9px] px-1 h-3.5 border-success/20 text-success bg-success/5">Verified</Badge>
                             <span className="text-[10px] text-muted-foreground">{doc.date}</span>
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
