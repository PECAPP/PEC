import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Briefcase,
  Code,
  Award,
  FileText,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Github,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { 
  PlacementProfile, 
  Skill, 
  Project, 
  Certification, 
  WorkExperience 
} from '@/types';

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

const proficiencyColors = {
  beginner: 'bg-gray-500',
  intermediate: 'bg-blue-500',
  advanced: 'bg-green-500',
  expert: 'bg-purple-500',
};

export default function PlacementProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<PlacementProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dialog states
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [certDialogOpen, setCertDialogOpen] = useState(false);
  const [expDialogOpen, setExpDialogOpen] = useState(false);
  
  // Form states
  const [newSkill, setNewSkill] = useState<Skill>({ name: '', proficiency: 'beginner' });
  const [newProject, setNewProject] = useState<Project>({
    id: '',
    title: '',
    description: '',
    technologies: [],
    githubUrl: '',
    liveUrl: '',
    startDate: '',
    endDate: '',
    isOngoing: false,
  });
  const [newCert, setNewCert] = useState<Certification>({
    id: '',
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
  });
  const [newExp, setNewExp] = useState<WorkExperience>({
    id: '',
    companyName: '',
    role: '',
    type: 'internship',
    startDate: '',
    endDate: '',
    isCurrentRole: false,
    description: '',
    location: '',
  });
  const [techInput, setTechInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  // Career preferences
  const [preferences, setPreferences] = useState({
    preferredJobTypes: [] as string[],
    preferredLocations: '',
    expectedSalaryMin: '',
    expectedSalaryMax: '',
    willingToRelocate: false,
  });

  useEffect(() => {
    if (!user?.uid) return;
    
    const loadProfile = async () => {
      try {
        const profileRef = doc(({} as any), 'placementProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile({ id: profileSnap.id, ...profileSnap.data() } as PlacementProfile);
        } else {
          // Create initial profile
          const initialProfile: Omit<PlacementProfile, 'id'> = {
            userId: user.uid,
            enrollmentNumber: '',
            department: '',
            semester: 1,
            cgpa: 0,
            backlogs: 0,
            skills: [],
            isResumePublic: true,
            projects: [],
            certifications: [],
            workExperience: [],
            preferredJobTypes: [],
            preferredLocations: [],
            willingToRelocate: false,
            isProfileComplete: false,
            placementReadinessScore: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          await setDoc(profileRef, initialProfile);
          setProfile({ id: user.uid, ...initialProfile } as PlacementProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.uid]);

  // Calculate readiness score
  const calculateReadinessScore = (p: PlacementProfile): number => {
    let score = 0;
    
    // Skills: max 20 points
    score += Math.min(p.skills.length * 4, 20);
    
    // Projects: max 25 points
    score += Math.min(p.projects.length * 5, 25);
    
    // Certifications: max 15 points
    score += Math.min(p.certifications.length * 5, 15);
    
    // Work Experience: max 20 points
    score += Math.min(p.workExperience.length * 10, 20);
    
    // Resume uploaded: 10 points
    if (p.resumeUrl) score += 10;
    
    // CGPA above 7: 10 points
    if (p.cgpa >= 7) score += 10;
    
    return Math.min(score, 100);
  };

  const saveProfile = async (updates: Partial<PlacementProfile>) => {
    if (!user?.uid || !profile) return;
    
    setSaving(true);
    try {
      const profileRef = doc(({} as any), 'placementProfiles', user.uid);
      const updatedProfile = { ...profile, ...updates };
      const readinessScore = calculateReadinessScore(updatedProfile as PlacementProfile);
      
      await updateDoc(profileRef, {
        ...updates,
        placementReadinessScore: readinessScore,
        isProfileComplete: readinessScore >= 60,
        updatedAt: serverTimestamp(),
      });
      
      setProfile({ ...updatedProfile, placementReadinessScore: readinessScore } as PlacementProfile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Add skill
  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      toast.error('Please enter a skill name');
      return;
    }
    
    const skills = editingIndex !== null
      ? profile!.skills.map((s, i) => i === editingIndex ? newSkill : s)
      : [...(profile?.skills || []), newSkill];
    
    saveProfile({ skills });
    setNewSkill({ name: '', proficiency: 'beginner' });
    setEditingIndex(null);
    setSkillDialogOpen(false);
  };

  const handleDeleteSkill = (index: number) => {
    const skills = profile!.skills.filter((_, i) => i !== index);
    saveProfile({ skills });
  };

  // Add project
  const handleAddProject = () => {
    if (!newProject.title.trim()) {
      toast.error('Please enter a project title');
      return;
    }
    
    const project = { ...newProject, id: editingIndex !== null ? newProject.id : crypto.randomUUID() };
    const projects = editingIndex !== null
      ? profile!.projects.map((p, i) => i === editingIndex ? project : p)
      : [...(profile?.projects || []), project];
    
    saveProfile({ projects });
    resetProjectForm();
    setProjectDialogOpen(false);
  };

  const resetProjectForm = () => {
    setNewProject({
      id: '',
      title: '',
      description: '',
      technologies: [],
      githubUrl: '',
      liveUrl: '',
      startDate: '',
      endDate: '',
      isOngoing: false,
    });
    setTechInput('');
    setEditingIndex(null);
  };

  const handleDeleteProject = (index: number) => {
    const projects = profile!.projects.filter((_, i) => i !== index);
    saveProfile({ projects });
  };

  const addTechnology = () => {
    if (techInput.trim() && !newProject.technologies.includes(techInput.trim())) {
      setNewProject({ ...newProject, technologies: [...newProject.technologies, techInput.trim()] });
      setTechInput('');
    }
  };

  // Add certification
  const handleAddCert = () => {
    if (!newCert.name.trim()) {
      toast.error('Please enter a certification name');
      return;
    }
    
    const cert = { ...newCert, id: editingIndex !== null ? newCert.id : crypto.randomUUID() };
    const certifications = editingIndex !== null
      ? profile!.certifications.map((c, i) => i === editingIndex ? cert : c)
      : [...(profile?.certifications || []), cert];
    
    saveProfile({ certifications });
    resetCertForm();
    setCertDialogOpen(false);
  };

  const resetCertForm = () => {
    setNewCert({
      id: '',
      name: '',
      issuingOrganization: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
    });
    setEditingIndex(null);
  };

  const handleDeleteCert = (index: number) => {
    const certifications = profile!.certifications.filter((_, i) => i !== index);
    saveProfile({ certifications });
  };

  // Add work experience
  const handleAddExp = () => {
    if (!newExp.companyName.trim() || !newExp.role.trim()) {
      toast.error('Please enter company name and role');
      return;
    }
    
    const exp = { ...newExp, id: editingIndex !== null ? newExp.id : crypto.randomUUID() };
    const workExperience = editingIndex !== null
      ? profile!.workExperience.map((e, i) => i === editingIndex ? exp : e)
      : [...(profile?.workExperience || []), exp];
    
    saveProfile({ workExperience });
    resetExpForm();
    setExpDialogOpen(false);
  };

  const resetExpForm = () => {
    setNewExp({
      id: '',
      companyName: '',
      role: '',
      type: 'internship',
      startDate: '',
      endDate: '',
      isCurrentRole: false,
      description: '',
      location: '',
    });
    setEditingIndex(null);
  };

  const handleDeleteExp = (index: number) => {
    const workExperience = profile!.workExperience.filter((_, i) => i !== index);
    saveProfile({ workExperience });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const readinessScore = profile?.placementReadinessScore || 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Placement Profile</h1>
          <p className="text-muted-foreground mt-1">
            Complete your profile to improve your placement chances
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Readiness Score</p>
            <p className={cn(
              "text-2xl font-bold",
              readinessScore >= 80 ? "text-green-500" :
              readinessScore >= 50 ? "text-yellow-500" : "text-red-500"
            )}>
              {readinessScore}%
            </p>
          </div>
          <div className="w-32">
            <Progress value={readinessScore} className="h-3" />
          </div>
        </div>
      </motion.div>

      {/* Readiness Tips */}
      {readinessScore < 80 && (
        <motion.div variants={item}>
          <Card className="border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Improve your profile</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {readinessScore < 20 && "Start by adding your skills and at least one project."}
                    {readinessScore >= 20 && readinessScore < 50 && "Adding certifications and work experience will boost your score."}
                    {readinessScore >= 50 && readinessScore < 80 && "Upload your resume and add more projects to complete your profile."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <User className="w-4 h-4 hidden sm:block" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="skills" className="gap-2">
              <Code className="w-4 h-4 hidden sm:block" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <Briefcase className="w-4 h-4 hidden sm:block" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="certifications" className="gap-2">
              <Award className="w-4 h-4 hidden sm:block" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="experience" className="gap-2">
              <GraduationCap className="w-4 h-4 hidden sm:block" />
              Experience
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Stats Cards */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Profile Completion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Skills</span>
                    <span className="font-medium">{profile?.skills.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Projects</span>
                    <span className="font-medium">{profile?.projects.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Certifications</span>
                    <span className="font-medium">{profile?.certifications.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Work Experience</span>
                    <span className="font-medium">{profile?.workExperience.length || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Resume</span>
                    <Badge variant={profile?.resumeUrl ? "default" : "outline"}>
                      {profile?.resumeUrl ? "Uploaded" : "Not Uploaded"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Resume Privacy Settings */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Privacy Settings</CardTitle>
                  <CardDescription>Control who can see your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="public-resume">Make Resume Public</Label>
                      <p className="text-xs text-muted-foreground">
                        Allow recruiters to view your resume without applying
                      </p>
                    </div>
                    <Switch
                      id="public-resume"
                      checked={profile?.isResumePublic ?? true}
                      onCheckedChange={(checked) => saveProfile({ isResumePublic: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => setSkillDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Skill
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => setProjectDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Project
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => setCertDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Certification
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => setExpDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Experience
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Items */}
            {(profile?.skills.length || 0) > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills.slice(0, 10).map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="gap-1"
                      >
                        <div className={cn("w-2 h-2 rounded-full", proficiencyColors[skill.proficiency])} />
                        {skill.name}
                      </Badge>
                    ))}
                    {(profile?.skills.length || 0) > 10 && (
                      <Badge variant="outline">+{(profile?.skills.length || 0) - 10} more</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Technical Skills</h2>
                <p className="text-sm text-muted-foreground">Add your technical and soft skills</p>
              </div>
              <Button onClick={() => setSkillDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </div>

            {profile?.skills.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Code className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No skills added yet</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    Add your technical skills to showcase your expertise
                  </p>
                  <Button onClick={() => setSkillDialogOpen(true)} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Skill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profile?.skills.map((skill, index) => (
                  <Card key={index} className="group relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            proficiencyColors[skill.proficiency]
                          )} />
                          <div>
                            <p className="font-medium">{skill.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{skill.proficiency}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => {
                              setNewSkill(skill);
                              setEditingIndex(index);
                              setSkillDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteSkill(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Projects</h2>
                <p className="text-sm text-muted-foreground">Showcase your work and side projects</p>
              </div>
              <Button onClick={() => setProjectDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Project
              </Button>
            </div>

            {profile?.projects.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No projects added yet</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    Add your projects to show recruiters what you've built
                  </p>
                  <Button onClick={() => setProjectDialogOpen(true)} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Project
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {profile?.projects.map((project, index) => (
                  <Card key={project.id} className="group">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {project.startDate} - {project.isOngoing ? 'Present' : project.endDate}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => {
                              setNewProject(project);
                              setEditingIndex(index);
                              setProjectDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteProject(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        {project.githubUrl && (
                          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <Github className="w-4 h-4" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Certifications Tab */}
          <TabsContent value="certifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Certifications</h2>
                <p className="text-sm text-muted-foreground">Add your professional certifications</p>
              </div>
              <Button onClick={() => setCertDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Certification
              </Button>
            </div>

            {profile?.certifications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Award className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No certifications added yet</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    Add your certifications to validate your skills
                  </p>
                  <Button onClick={() => setCertDialogOpen(true)} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Certification
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {profile?.certifications.map((cert, index) => (
                  <Card key={cert.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Award className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{cert.name}</p>
                            <p className="text-sm text-muted-foreground">{cert.issuingOrganization}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Issued: {cert.issueDate}
                              {cert.expiryDate && ` · Expires: ${cert.expiryDate}`}
                            </p>
                            {cert.credentialUrl && (
                              <a 
                                href={cert.credentialUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              >
                                View Credential <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => {
                              setNewCert(cert);
                              setEditingIndex(index);
                              setCertDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteCert(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Work Experience</h2>
                <p className="text-sm text-muted-foreground">Add internships, part-time jobs, and freelance work</p>
              </div>
              <Button onClick={() => setExpDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Experience
              </Button>
            </div>

            {profile?.workExperience.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No experience added yet</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    Add your work experience to show your professional journey
                  </p>
                  <Button onClick={() => setExpDialogOpen(true)} className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Experience
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {profile?.workExperience.map((exp, index) => (
                  <Card key={exp.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Briefcase className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{exp.role}</p>
                            <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">{exp.type}</Badge>
                              <span>·</span>
                              <span>{exp.startDate} - {exp.isCurrentRole ? 'Present' : exp.endDate}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {exp.location}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{exp.description}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8"
                            onClick={() => {
                              setNewExp(exp);
                              setEditingIndex(index);
                              setExpDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteExp(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Add Skill Dialog */}
      <Dialog open={skillDialogOpen} onOpenChange={(open) => {
        setSkillDialogOpen(open);
        if (!open) {
          setNewSkill({ name: '', proficiency: 'beginner' });
          setEditingIndex(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
            <DialogDescription>Add a technical or soft skill</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Skill Name</Label>
              <Input 
                placeholder="e.g., React, Python, Communication" 
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Proficiency Level</Label>
              <Select 
                value={newSkill.proficiency} 
                onValueChange={(v: Skill['proficiency']) => setNewSkill({ ...newSkill, proficiency: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkillDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSkill} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingIndex !== null ? 'Update' : 'Add'} Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={(open) => {
        setProjectDialogOpen(open);
        if (!open) resetProjectForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Project' : 'Add Project'}</DialogTitle>
            <DialogDescription>Add details about your project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Title *</Label>
              <Input 
                placeholder="e.g., E-Commerce Platform" 
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe what the project does..." 
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Technologies Used</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Add technology" 
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                />
                <Button type="button" variant="outline" onClick={addTechnology}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {newProject.technologies.map((tech, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {tech}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => setNewProject({
                        ...newProject,
                        technologies: newProject.technologies.filter((_, idx) => idx !== i)
                      })}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="month" 
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="month" 
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  disabled={newProject.isOngoing}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={newProject.isOngoing}
                onCheckedChange={(checked) => setNewProject({ ...newProject, isOngoing: checked })}
              />
              <Label>Currently working on this</Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input 
                  placeholder="https://github.com/..." 
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Live URL</Label>
                <Input 
                  placeholder="https://..." 
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddProject} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingIndex !== null ? 'Update' : 'Add'} Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Certification Dialog */}
      <Dialog open={certDialogOpen} onOpenChange={(open) => {
        setCertDialogOpen(open);
        if (!open) resetCertForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Certification' : 'Add Certification'}</DialogTitle>
            <DialogDescription>Add your professional certification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Certification Name *</Label>
              <Input 
                placeholder="e.g., AWS Solutions Architect" 
                value={newCert.name}
                onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Issuing Organization</Label>
              <Input 
                placeholder="e.g., Amazon Web Services" 
                value={newCert.issuingOrganization}
                onChange={(e) => setNewCert({ ...newCert, issuingOrganization: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input 
                  type="month" 
                  value={newCert.issueDate}
                  onChange={(e) => setNewCert({ ...newCert, issueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input 
                  type="month" 
                  value={newCert.expiryDate}
                  onChange={(e) => setNewCert({ ...newCert, expiryDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Credential ID</Label>
              <Input 
                placeholder="Optional" 
                value={newCert.credentialId}
                onChange={(e) => setNewCert({ ...newCert, credentialId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Credential URL</Label>
              <Input 
                placeholder="https://..." 
                value={newCert.credentialUrl}
                onChange={(e) => setNewCert({ ...newCert, credentialUrl: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCertDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCert} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingIndex !== null ? 'Update' : 'Add'} Certification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Experience Dialog */}
      <Dialog open={expDialogOpen} onOpenChange={(open) => {
        setExpDialogOpen(open);
        if (!open) resetExpForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
            <DialogDescription>Add your work experience</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Company Name *</Label>
                <Input 
                  placeholder="e.g., Google" 
                  value={newExp.companyName}
                  onChange={(e) => setNewExp({ ...newExp, companyName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Input 
                  placeholder="e.g., Software Engineer Intern" 
                  value={newExp.role}
                  onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={newExp.type} 
                  onValueChange={(v: WorkExperience['type']) => setNewExp({ ...newExp, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  placeholder="e.g., Bangalore, India" 
                  value={newExp.location}
                  onChange={(e) => setNewExp({ ...newExp, location: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input 
                  type="month" 
                  value={newExp.startDate}
                  onChange={(e) => setNewExp({ ...newExp, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input 
                  type="month" 
                  value={newExp.endDate}
                  onChange={(e) => setNewExp({ ...newExp, endDate: e.target.value })}
                  disabled={newExp.isCurrentRole}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={newExp.isCurrentRole}
                onCheckedChange={(checked) => setNewExp({ ...newExp, isCurrentRole: checked })}
              />
              <Label>I currently work here</Label>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe your responsibilities..." 
                value={newExp.description}
                onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddExp} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingIndex !== null ? 'Update' : 'Add'} Experience
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
