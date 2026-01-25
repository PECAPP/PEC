import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  FileText,
  Github,
  Linkedin,
  Edit2,
  Download,
  QrCode,
  ExternalLink,
  Loader2,
  Clock,
  Share2,
  Copy,
  Check,
  Download as DownloadIcon,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, deleteField } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
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

export function StudentProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState({
    cgpa: 0,
    attendance: 0,
    credits: 0,
    rank: 'Top 15%',
  });
  const [academicHistory, setAcademicHistory] = useState<any[]>([]);
  const [attendanceBreakdown, setAttendanceBreakdown] = useState<any[]>([]);
  const [currentCourses, setCurrentCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [githubStats, setGithubStats] = useState<any>(null);
  const [fetchingGithub, setFetchingGithub] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Fetch user document
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userInfo = userDoc.data();
        setUserData(userInfo);

        // Fetch student profile if student
        if (userInfo?.role === 'student') {
          const profileDoc = await getDoc(doc(db, 'studentProfiles', user.uid));
          const pData = profileDoc.data();
          setProfileData(pData);
          
          if (pData) {
            await fetchProfileData(user.uid, pData);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchProfileData = async (userId: string, pData: any) => {
    try {
      // 1. Fetch academic history & calculate CGPA
      const gradesQuery = query(
        collection(db, 'grades'),
        where('studentId', '==', userId)
      );
      const gradesSnapshot = await getDocs(gradesQuery);
      const gradesData = gradesSnapshot.docs.map(doc => doc.data()).sort((a, b) => (b.semester || 0) - (a.semester || 0));
      
      // Group by semester
      const semesters: Record<number, any> = {};
      let totalGradePoints = 0;
      let totalCredits = 0;

      gradesData.forEach(g => {
        if (!semesters[g.semester]) {
          semesters[g.semester] = { sem: `Semester ${g.semester}`, sgpa: 0, credits: 0, points: 0 };
        }
        semesters[g.semester].credits += g.credits || 0;
        semesters[g.semester].points += (g.gradePoints * (g.credits || 0));
        
        totalGradePoints += (g.gradePoints * (g.credits || 0));
        totalCredits += g.credits || 0;
      });

      const history = Object.values(semesters).map(s => ({
        ...s,
        sgpa: s.credits > 0 ? Math.round((s.points / s.credits) * 100) / 100 : 0
      })).sort((a, b) => b.sem.localeCompare(a.sem));

      setAcademicHistory(history);

      // 2. Fetch current courses
      const enrollQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', userId),
        where('status', '==', 'active')
      );
      const enrollSnapshot = await getDocs(enrollQuery);
      const currCourses = await Promise.all(
        enrollSnapshot.docs.map(async (edoc) => {
          const courseId = edoc.data().courseId;
          const courseDoc = await getDoc(doc(db, 'courses', courseId));
          // Find grade if exists
          const grade = gradesData.find(g => g.courseId === courseId);
          return {
            id: courseId,
            grade: grade?.grade || 'N/A',
            ...courseDoc.data()
          };
        })
      );
      setCurrentCourses(currCourses);

      // 3. Fetch attendance breakdown
      const attendQuery = query(collection(db, 'attendance'), where('studentId', '==', userId));
      const attendSnapshot = await getDocs(attendQuery);
      const attendRecords = attendSnapshot.docs.map(doc => doc.data());
      
      const courseAttendance: Record<string, any> = {};
      attendRecords.forEach(r => {
        if (!courseAttendance[r.courseId]) {
          courseAttendance[r.courseId] = { attended: 0, total: 0 };
        }
        courseAttendance[r.courseId].total++;
        if (r.status === 'present' || r.status === 'late') {
          courseAttendance[r.courseId].attended++;
        }
      });

      const breakdown = await Promise.all(
        Object.entries(courseAttendance).map(async ([courseId, counts]) => {
          const courseDoc = await getDoc(doc(db, 'courses', courseId));
          const cData = courseDoc.data();
          const percentage = Math.round((counts.attended / counts.total) * 100);
          return {
            id: courseId,
            subject: cData?.name || 'Unknown Course',
            code: cData?.code || 'N/A',
            attended: counts.attended,
            total: counts.total,
            percentage
          };
        })
      );
      setAttendanceBreakdown(breakdown);

      // 4. Fetch assignments for profile
      const assignmentsQuery = query(collection(db, 'assignments'), orderBy('dueDate', 'asc'));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const allAssignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for enrolled courses
      const enrolledCourseIds = currCourses.map(c => c.id);
      const studentAssignments = allAssignments.filter((a: any) => enrolledCourseIds.includes(a.courseId));
      
      // Fetch submissions
      const submissionsQuery = query(collection(db, 'submissions'), where('studentId', '==', userId));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submittedIds = submissionsSnapshot.docs.map(doc => doc.data().assignmentId);
      
      const assignmentsWithState = studentAssignments.map((a: any) => ({
        ...a,
        status: submittedIds.includes(a.id) ? 'submitted' : 'pending',
        courseName: (currCourses as any[]).find(c => c.id === a.courseId)?.name || 'Unknown'
      }));
      setAssignments(assignmentsWithState);

      // 5. Update overall stats
      const overallAttendance = attendRecords.length > 0 
        ? Math.round((attendRecords.filter(r => r.status === 'present' || r.status === 'late').length / attendRecords.length) * 100) 
        : 0;
      
      setStats({
        cgpa: totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0,
        attendance: overallAttendance,
        credits: totalCredits,
        rank: 'Top 12%', // Mocking rank for now
      });

    } catch (error) {
      console.error('Error fetching dynamic profile data:', error);
    }
  };

  const fetchGithubStats = async (username: string) => {
    if (!username) return;
    setFetchingGithub(true);
    try {
      const resp = await fetch(`https://api.github.com/users/${username.replace('@', '')}`);
      if (resp.ok) {
        const data = await resp.json();
        
        // Fetch languages from repos
        const reposResp = await fetch(`https://api.github.com/users/${username.replace('@', '')}/repos?sort=updated&per_page=5`);
        let languages: string[] = [];
        if (reposResp.ok) {
          const repos = await reposResp.json();
          languages = Array.from(new Set(repos.map((r: any) => r.language).filter(Boolean))) as string[];
        }

        setGithubStats({
          repos: data.public_repos,
          followers: data.followers,
          stars: 0, // Requires additional API call per repo to sum stars
          languages: languages.slice(0, 3),
          avatar: data.avatar_url,
          username: data.login
        });
        
        // Try to sum stars from first 30 repos
        const starsResp = await fetch(`https://api.github.com/users/${username.replace('@', '')}/repos?per_page=30`);
        if (starsResp.ok) {
          const repos = await starsResp.json();
          const totalStars = repos.reduce((acc: number, r: any) => acc + r.stargazers_count, 0);
          setGithubStats((prev: any) => ({ ...prev, stars: totalStars }));
        }
      }
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
    } finally {
      setFetchingGithub(false);
    }
  };

  useEffect(() => {
    if (profileData?.githubUsername) {
      fetchGithubStats(profileData.githubUsername);
    }
  }, [profileData?.githubUsername]);

  const handleConnect = async (type: 'github' | 'linkedin') => {
    const username = prompt(`Enter your ${type === 'github' ? 'GitHub username' : 'LinkedIn profile handle'}:`);
    if (!username) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const field = type === 'github' ? 'githubUsername' : 'linkedinUsername';
      const cleanUsername = username.replace('@', '').trim();

      await updateDoc(doc(db, 'studentProfiles', user.uid), {
        [field]: cleanUsername
      });

      setProfileData((prev: any) => ({ ...prev, [field]: cleanUsername }));
      toast.success(`${type === 'github' ? 'GitHub' : 'LinkedIn'} connected successfully!`);
    } catch (error) {
      toast.error(`Failed to connect ${type}`);
    }
  };

  const handleDisconnect = async (type: 'github' | 'linkedin') => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const field = type === 'github' ? 'githubUsername' : 'linkedinUsername';
      
      await updateDoc(doc(db, 'studentProfiles', user.uid), {
        [field]: deleteField()
      });

      setProfileData((prev: any) => {
        const newData = { ...prev };
        delete newData[field];
        return newData;
      });
      
      if (type === 'github') setGithubStats(null);
      toast.success(`${type === 'github' ? 'GitHub' : 'LinkedIn'} disconnected`);
    } catch (error) {
      toast.error('Failed to disconnect');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No profile data found. Please complete your onboarding.</p>
          <Button onClick={() => navigate('/onboarding')} className="mt-4">
            Complete Profile
          </Button>
        </div>
      </div>
    );
  }

  const initials = userData.fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'NA';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Profile Header Card */}
      <motion.div variants={item} className="card-elevated p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-3xl font-bold">
              {initials}
            </div>
            <button 
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-secondary transition-colors"
              onClick={() => window.location.href = '/settings'}
            >
              <Edit2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{userData.fullName || 'Student'}</h1>
                <p className="text-muted-foreground">{profileData.department || 'Department'}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {profileData.enrollmentNumber || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Semester {profileData.semester || '1'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setQrDialogOpen(true)}>
                  <QrCode className="w-4 h-4" />
                  View QR
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/student/${auth.currentUser?.uid}`);
                  toast.success('Public profile link copied!');
                }}>
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </Button>
                <Button size="sm" onClick={()=>navigate('/resume-builder')} >
                  <Download className="w-4 h-4" />
                  Download Resume
                </Button>
              </div>
              <div className="mt-2 flex items-center gap-2">
                 <Badge variant={profileData.isPublic !== false ? "success" : "secondary"} className="text-[10px] h-5 px-1.5 uppercase tracking-wider">
                    {profileData.isPublic !== false ? "Publicly Visible" : "Private Profile"}
                 </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-foreground">{(stats.cgpa || 0).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">CGPA</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-foreground">{stats.attendance}%</p>
                <p className="text-xs text-muted-foreground">Attendance</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-foreground">{stats.credits}</p>
                <p className="text-xs text-muted-foreground">Credits Earned</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-foreground">{stats.rank}</p>
                <p className="text-xs text-muted-foreground">Class Rank</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border rounded-lg p-1 h-auto flex-nowrap overflow-x-auto overflow-y-hidden tabs-list-scroll">
            <TabsTrigger value="profile" className="rounded-md">Profile</TabsTrigger>
            <TabsTrigger value="academics" className="rounded-md">Academics</TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-md">Attendance</TabsTrigger>
            <TabsTrigger value="assignments" className="rounded-md">Assignments</TabsTrigger>
            <TabsTrigger value="documents" className="rounded-md">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = '/settings'}>
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
                <div className="space-y-4">
                  <InfoRow icon={Mail} label="Email" value={userData.email || (profileData as any).email || 'N/A'} />
                  <InfoRow icon={Phone} label="Phone" value={(profileData as any).phone || 'N/A'} />
                  <InfoRow icon={MapPin} label="Address" value={`${(profileData as any).address || ''}, ${(profileData as any).city || ''}, ${(profileData as any).state || ''}`.trim() || 'N/A'} />
                  <InfoRow icon={Calendar} label="Date of Birth" value={(profileData as any).dob ? new Date((profileData as any).dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'} />
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="card-elevated p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Connected Accounts</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-card border border-border">
                        <Github className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">GitHub</p>
                        <p className="text-sm text-muted-foreground">
                          { (profileData as any).githubUsername ? `@${(profileData as any).githubUsername}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    { (profileData as any).githubUsername ? (
                      <div className="flex gap-2">
                        <span className="status-badge status-verified">Connected</span>
                        <Button variant="ghost" size="sm" onClick={() => handleDisconnect('github')}>
                          Unlink
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleConnect('github')}>
                        Connect
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-card border border-border">
                        <Linkedin className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">LinkedIn</p>
                        <p className="text-sm text-muted-foreground">
                          { (profileData as any).linkedinUsername ? `@${(profileData as any).linkedinUsername}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    { (profileData as any).linkedinUsername ? (
                      <div className="flex gap-2">
                        <span className="status-badge status-verified">Connected</span>
                        <Button variant="ghost" size="sm" onClick={() => handleDisconnect('linkedin')}>
                          Unlink
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleConnect('linkedin')}>
                        Connect
                      </Button>
                    )}
                  </div>
                </div>

                {/* GitHub Stats Preview */}
                { (profileData as any).githubUsername && (
                  <div className="mt-6 p-4 rounded-lg border border-border bg-card/50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-foreground">GitHub Activity</h3>
                      {fetchingGithub && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                    </div>
                    
                    {githubStats ? (
                      <>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-xl font-bold text-foreground">{githubStats.repos}</p>
                            <p className="text-xs text-muted-foreground">Repos</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-foreground">{githubStats.followers}</p>
                            <p className="text-xs text-muted-foreground">Followers</p>
                          </div>
                          <div>
                            <p className="text-xl font-bold text-foreground">{githubStats.stars}</p>
                            <p className="text-xs text-muted-foreground">Stars</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {githubStats.languages?.map((lang: string) => (
                            <span key={lang} className="px-2 py-1 text-[10px] font-bold bg-accent/10 text-accent rounded-full uppercase tracking-wider">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        {fetchingGithub ? 'Fetching your code activity...' : 'Connect GitHub to see activity'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="academics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Semester Performance */}
              <div className="card-elevated p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Semester Performance</h2>
                <div className="space-y-4">
                  {academicHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No academic records found.</p>
                  ) : (
                    academicHistory.map((s) => (
                      <div key={s.sem} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">{s.sem}</p>
                          <p className="text-xs text-muted-foreground">{s.credits} credits</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress value={s.sgpa * 10} className="w-24 h-2" />
                          <span className="text-sm font-semibold text-foreground w-8">{s.sgpa}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Current Courses */}
              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Current Courses</h2>
                  <Button onClick={()=>navigate('/courses')} variant="ghost" size="sm">
                    View All
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {currentCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No current courses.</p>
                  ) : (
                    currentCourses.map((course: any) => (
                      <div key={course.id} className="p-3 rounded-lg border border-border group hover:border-primary/20 transition-all">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground font-bold">{course.code}</span>
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">{course.name}</p>
                          </div>
                          <span className="px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent rounded uppercase">
                            {course.grade}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">{course.credits} Credits</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Attendance Summary</h2>
              <div className="space-y-6">
                {attendanceBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No attendance data available.</p>
                ) : (
                  attendanceBreakdown.map((course) => {
                    const statusColor = course.percentage >= 75 ? 'bg-success' : course.percentage >= 65 ? 'bg-warning' : 'bg-destructive';
                    return (
                      <div key={course.id || course.code || course.subject}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{course.code}</span>
                            <span className="font-medium text-foreground">{course.subject}</span>
                          </div>
                          <span className={`text-sm font-bold ${course.percentage >= 75 ? 'text-success' : course.percentage >= 65 ? 'text-warning' : 'text-destructive'}`}>
                            {course.percentage}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div className={`h-full ${statusColor} rounded-full`} style={{ width: `${course.percentage}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-16 font-medium">
                            {course.attended}/{course.total} classes
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="mt-6">
            <div className="card-elevated p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Assignments & Submissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8 col-span-full">No assignments found for your courses.</p>
                ) : (
                  assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 rounded-xl border border-border hover:border-primary/20 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-[10px] uppercase">{assignment.courseName}</Badge>
                        <Badge variant={assignment.status === 'submitted' ? 'success' : 'secondary'} className="text-[10px] capitalize">
                          {assignment.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-foreground mb-1">{assignment.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{assignment.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Due: {new Date(assignment.dueDate?.toDate?.() || assignment.dueDate).toLocaleDateString()}
                        </span>
                        <span className="font-bold text-foreground">{assignment.totalMarks} Marks</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Document Vault</h2>
                <Button size="sm">
                  Upload Document
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Semester 4 Marksheet', type: 'PDF', size: '245 KB', verified: true },
                  { name: '10th Certificate', type: 'PDF', size: '1.2 MB', verified: true },
                  { name: '12th Certificate', type: 'PDF', size: '980 KB', verified: true },
                  { name: 'ID Card', type: 'JPG', size: '156 KB', verified: false },
                  { name: 'Bonafide Certificate', type: 'PDF', size: '320 KB', verified: true },
                  { name: 'Resume', type: 'PDF', size: '180 KB', verified: false },
                ].map((doc) => (
                  <div key={doc.name} className="p-4 rounded-lg border border-border hover:border-accent/30 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {doc.verified ? (
                        <span className="status-badge status-verified">Verified</span>
                      ) : (
                        <span className="status-badge status-pending">Pending</span>
                      )}
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="text-center text-xl">My Profile QR</DialogTitle>
             <DialogDescription className="text-center">
               Scan to view full academic profile
             </DialogDescription>
           </DialogHeader>
           
           <div className="flex flex-col items-center justify-center py-6 space-y-6">
              <div className="relative p-4 bg-white rounded-2xl shadow-lg border border-border/50">
                 {/* QR Code */}
                 <QRCodeCanvas
                    value={`${window.location.origin}/student/${userData?.uid}`}
                    size={200}
                    level={"H"}
                    includeMargin={true}
                    imageSettings={{
                       src: "https://github.com/shadcn.png", // Or user avatar if available
                       x: undefined,
                       y: undefined,
                       height: 24,
                       width: 24,
                       excavate: true,
                    }}
                 />
                 
                 {/* Decorative corners */}
                 <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-primary rounded-tl-xl -translate-x-1 -translate-y-1"></div>
                 <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-primary rounded-tr-xl translate-x-1 -translate-y-1"></div>
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-primary rounded-bl-xl -translate-x-1 translate-y-1"></div>
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-primary rounded-br-xl translate-x-1 translate-y-1"></div>
              </div>

              <div className="text-center space-y-1">
                 <h3 className="font-bold text-lg">{userData.fullName}</h3>
                 <p className="text-sm text-muted-foreground">{profileData.department}</p>
                 <Badge variant="secondary" className="mt-2">{userData.email}</Badge>
              </div>

              <div className="flex gap-2 w-full">
                 <Button className="flex-1" onClick={() => {
                    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
                    if(canvas) {
                        const image = canvas.toDataURL("image/png");
                        const link = document.createElement('a');
                        link.href = image;
                        link.download = `profile-qr-${userData.fullName}.png`;
                        link.click();
                        toast.success("QR Code downloaded");
                    }
                 }}>
                    <DownloadIcon className="w-4 h-4 mr-2" /> Download
                 </Button>
                 <Button variant="outline" className="flex-1" onClick={() => {
                     navigator.clipboard.writeText(`${window.location.origin}/student/${userData.uid}`);
                     toast.success("Link copied to clipboard");
                 }}>
                    <Copy className="w-4 h-4 mr-2" /> Copy Link
                 </Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export default StudentProfile;
