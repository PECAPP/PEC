'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Github,
  ExternalLink,
  Star,
  GitFork,
  Code2,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Check,
  Trophy,
  Briefcase,
  Wrench,
  Languages,
  Sparkles,
  Link2,
  Calendar,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';

interface Project {
  id: string;
  studentId: string;
  title: string;
  description: string;
  techStack: string;
  githubUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isFeatured: boolean;
  createdAt: string;
}

interface Skill {
  id: string;
  studentId: string;
  name: string;
  level: number;
  category: string;
}

const skillCategories = [
  { id: 'technical', label: 'Technical', icon: Code2 },
  { id: 'soft', label: 'Soft Skills', icon: Sparkles },
  { id: 'tool', label: 'Tools', icon: Wrench },
  { id: 'language', label: 'Languages', icon: Languages },
];

const emptyProjectForm = {
  title: '',
  description: '',
  techStack: '',
  githubUrl: '',
  liveUrl: '',
  imageUrl: '',
  startDate: '',
  endDate: '',
  isFeatured: false,
};

const emptySkillForm = {
  name: '',
  level: 50,
  category: 'technical',
};

export default function StudentPortfolioPage() {
  const router = useRouter();
  const { user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [githubRepos, setGithubRepos] = useState<any[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');

  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [savingProject, setSavingProject] = useState(false);

  const [showSkillDialog, setShowSkillDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillForm, setSkillForm] = useState(emptySkillForm);
  const [savingSkill, setSavingSkill] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }
    fetchPortfolio();
  }, [authLoading, user, router]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const data = await api.get('/student-portfolio');
      setProjects(data.data.projects || []);
      setSkills(data.data.skills || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const syncGitHub = async () => {
    setGithubLoading(true);
    try {
      const data = await api.get('/social-sync/github/repos');
      setGithubRepos(data.data.repos || []);
      if (data.data.repos?.length > 0) {
        toast.success(`Found ${data.data.repos.length} GitHub repos`);
      } else {
        toast.info(data.data.message || 'No repos found');
      }
    } catch (error) {
      console.error('GitHub sync error:', error);
      toast.error('Failed to sync GitHub repos');
    } finally {
      setGithubLoading(false);
    }
  };

  const importRepo = async (repo: any) => {
    try {
      await api.post('/student-portfolio/projects', {
        studentId: user?.uid,
        title: repo.name,
        description: repo.description || '',
        techStack: repo.techStack || (repo.language ? JSON.stringify([repo.language]) : '[]'),
        githubUrl: repo.githubUrl || repo.url,
        liveUrl: repo.liveUrl || '',
        isFeatured: false,
      });
      toast.success(`Imported ${repo.name}`);
      fetchPortfolio();
    } catch (error) {
      toast.error(`Failed to import ${repo.name}`);
    }
  };

  const openCreateProject = () => {
    setEditingProject(null);
    setProjectForm(emptyProjectForm);
    setShowProjectDialog(true);
  };

  const openEditProject = (project: Project) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      imageUrl: project.imageUrl || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      isFeatured: project.isFeatured,
    });
    setShowProjectDialog(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title) {
      toast.error('Title is required');
      return;
    }

    setSavingProject(true);
    try {
      const payload = {
        studentId: user?.uid,
        ...projectForm,
        techStack: JSON.stringify(projectForm.techStack.split(',').map((t) => t.trim()).filter(Boolean)),
        startDate: projectForm.startDate || null,
        endDate: projectForm.endDate || null,
        githubUrl: projectForm.githubUrl || null,
        liveUrl: projectForm.liveUrl || null,
        imageUrl: projectForm.imageUrl || null,
      };

      if (editingProject) {
        await api.patch(`/student-portfolio/projects/${editingProject.id}`, payload);
        toast.success('Project updated');
      } else {
        await api.post('/student-portfolio/projects', payload);
        toast.success('Project created');
      }
      setShowProjectDialog(false);
      fetchPortfolio();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project');
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete(`/student-portfolio/projects/${id}`);
      toast.success('Project deleted');
      fetchPortfolio();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const openCreateSkill = () => {
    setEditingSkill(null);
    setSkillForm(emptySkillForm);
    setShowSkillDialog(true);
  };

  const openEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setSkillForm({ name: skill.name, level: skill.level, category: skill.category });
    setShowSkillDialog(true);
  };

  const handleSaveSkill = async () => {
    if (!skillForm.name) {
      toast.error('Skill name is required');
      return;
    }

    setSavingSkill(true);
    try {
      const payload = { studentId: user?.uid, ...skillForm };

      if (editingSkill) {
        await api.patch(`/student-portfolio/skills/${editingSkill.id}`, payload);
        toast.success('Skill updated');
      } else {
        await api.post('/student-portfolio/skills', payload);
        toast.success('Skill added');
      }
      setShowSkillDialog(false);
      fetchPortfolio();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save skill');
    } finally {
      setSavingSkill(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    if (!confirm('Delete this skill?')) return;
    try {
      await api.delete(`/student-portfolio/skills/${id}`);
      toast.success('Skill deleted');
      fetchPortfolio();
    } catch (error) {
      toast.error('Failed to delete skill');
    }
  };

  const getTechStack = (techStackStr: string): string[] => {
    try {
      return JSON.parse(techStackStr);
    } catch {
      return techStackStr ? techStackStr.split(',').map((t) => t.trim()) : [];
    }
  };

  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'technical';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Portfolio</h1>
          <p className="text-muted-foreground">Showcase your projects, skills, and GitHub work</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={syncGitHub} disabled={githubLoading}>
            {githubLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Github className="w-4 h-4 mr-2" />
            )}
            Sync GitHub
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
          {['projects', 'skills', 'github'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary px-0 py-3 text-xs font-black uppercase tracking-widest transition-all capitalize"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateProject}>
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-elevated p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{project.title}</h3>
                      {project.isFeatured && (
                        <Badge variant="default" className="text-xs">
                          <Star className="w-3 h-3 mr-1" /> Featured
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  </div>
                </div>

                {getTechStack(project.techStack).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {getTechStack(project.techStack).slice(0, 4).map((tech: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {getTechStack(project.techStack).length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{getTechStack(project.techStack).length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  {project.githubUrl && (
                    <Button variant="ghost" size="sm" asChild className="flex-1">
                      <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="w-3 h-3 mr-1" /> Code
                      </a>
                    </Button>
                  )}
                  {project.liveUrl && (
                    <Button variant="ghost" size="sm" asChild className="flex-1">
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-3 h-3 mr-1" /> Demo
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => openEditProject(project)}>
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="card-elevated p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No projects yet. Add your first project!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={openCreateSkill}>
              <Plus className="w-4 h-4 mr-2" /> Add Skill
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {skillCategories.map(({ id, label, icon: Icon }) => {
              const categorySkills = skillsByCategory[id] || [];
              if (categorySkills.length === 0) return null;

              return (
                <div key={id} className="card-elevated p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">{label}</h3>
                  </div>
                  <div className="space-y-3">
                    {categorySkills.map((skill) => (
                      <div key={skill.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{skill.level}%</span>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditSkill(skill)}>
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => handleDeleteSkill(skill.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {skills.length === 0 && (
            <div className="card-elevated p-12 text-center">
              <Code2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No skills added yet. Start building your skill profile!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="github" className="mt-6">
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={syncGitHub} disabled={githubLoading}>
              {githubLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Github className="w-4 h-4 mr-2" />
              )}
              Refresh GitHub Repos
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {githubRepos.map((repo, idx) => (
              <motion.div
                key={repo.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-elevated p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold truncate flex-1">{repo.name}</h3>
                  <Button variant="ghost" size="sm" onClick={() => importRepo(repo)} title="Import to portfolio">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {repo.description || 'No description'}
                </p>
                {repo.language && (
                  <Badge variant="secondary" className="text-xs">{repo.language}</Badge>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {repo.stars ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-3 h-3" /> {repo.forks ?? 0}
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <a href={repo.githubUrl || repo.url} target="_blank" rel="noopener noreferrer">
                      <Github className="w-3 h-3 mr-1" /> View
                    </a>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {githubRepos.length === 0 && (
            <div className="card-elevated p-12 text-center">
              <Github className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No GitHub repos loaded. Configure your GitHub username in profile settings and sync.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Project Dialog */}
      <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Edit Project' : 'Add Project'}</DialogTitle>
            <DialogDescription>
              {editingProject ? 'Update project details' : 'Add a new project to your portfolio'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                className="mt-1"
                placeholder="My Awesome Project"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                className="mt-1"
                placeholder="What does this project do?"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tech Stack (comma-separated)</label>
              <Input
                value={projectForm.techStack}
                onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
                className="mt-1"
                placeholder="React, Node.js, PostgreSQL"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">GitHub URL</label>
                <Input
                  value={projectForm.githubUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                  className="mt-1"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Live URL</label>
                <Input
                  value={projectForm.liveUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                  className="mt-1"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={projectForm.startDate}
                  onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={projectForm.endDate}
                  onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={projectForm.isFeatured}
                onChange={(e) => setProjectForm({ ...projectForm, isFeatured: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="featured" className="text-sm">Featured Project</label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowProjectDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProject} disabled={savingProject}>
                {savingProject ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {savingProject ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skill Dialog */}
      <Dialog open={showSkillDialog} onOpenChange={setShowSkillDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Skill Name *</label>
              <Input
                value={skillForm.name}
                onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                className="mt-1"
                placeholder="e.g., React.js"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={skillForm.category} onValueChange={(v) => setSkillForm({ ...skillForm, category: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Proficiency: {skillForm.level}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={skillForm.level}
                onChange={(e) => setSkillForm({ ...skillForm, level: Number(e.target.value) })}
                className="w-full mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSkillDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSkill} disabled={savingSkill}>
                {savingSkill ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                {savingSkill ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
