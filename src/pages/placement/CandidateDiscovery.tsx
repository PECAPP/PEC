import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  User,
  GraduationCap,
  Code,
  Briefcase,
  MapPin,
  Star,
  Mail,
  Download,
  Plus,
  CheckCircle,
  Loader2,
  ChevronDown,
  Heart,
  Building2,
  ExternalLink,
  BookmarkPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PlacementProfile, Skill } from '@/types';

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

interface CandidateProfile extends PlacementProfile {
  userName?: string;
  userEmail?: string;
}

export default function CandidateDiscovery() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateProfile[]>([]);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [minCgpa, setMinCgpa] = useState<number>(0);
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  
  const popularSkills = ['React', 'Python', 'Java', 'JavaScript', 'Machine Learning', 'Node.js', 'SQL', 'AWS', 'Docker', 'TypeScript'];
  const departments = Array.from(
    new Set(candidates.map((candidate) => candidate.department).filter(Boolean))
  ).sort();

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const profilesQuery = query(
          collection(({} as any), 'placementProfiles'),
          where('isProfileComplete', '==', true),
          orderBy('placementReadinessScore', 'desc'),
          limit(100)
        );

        const snapshot = await getDocs(profilesQuery);
        const profiles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CandidateProfile[];

        setCandidates(profiles);
        setLoading(false);
      } catch (error) {
        console.error('Error loading candidates:', error);
        // Load mock data for demonstration
        setCandidates([
          {
            id: '1',
            userId: '1',
            enrollmentNumber: 'CS2024001',
            userName: 'Rahul Sharma',
            userEmail: 'rahul@example.com',
            department: 'Computer Science',
            semester: 8,
            cgpa: 8.7,
            backlogs: 0,
            skills: [
              { name: 'React', proficiency: 'advanced' },
              { name: 'TypeScript', proficiency: 'intermediate' },
              { name: 'Node.js', proficiency: 'advanced' },
              { name: 'Python', proficiency: 'intermediate' },
            ],
            projects: [
              { id: '1', title: 'E-commerce Platform', description: 'Full-stack project', technologies: ['React', 'Node.js'], isOngoing: false, startDate: '2024-01' },
              { id: '2', title: 'ML Image Classifier', description: 'Image classification', technologies: ['Python', 'TensorFlow'], isOngoing: false, startDate: '2024-03' },
            ],
            certifications: [
              { id: '1', name: 'AWS Cloud Practitioner', issuingOrganization: 'AWS', issueDate: '2024-01' },
            ],
            workExperience: [
              { id: '1', companyName: 'Tech Startup', role: 'Frontend Intern', type: 'internship', location: 'Remote', description: 'Worked on React apps', isCurrentRole: false, startDate: '2024-05', endDate: '2024-07' },
            ],
            preferredJobTypes: ['full-time'],
            preferredLocations: ['Bangalore', 'Hyderabad'],
            willingToRelocate: true,
            isProfileComplete: true,
            placementReadinessScore: 85,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            userId: '2',
            enrollmentNumber: 'CS2024002',
            userName: 'Priya Patel',
            userEmail: 'priya@example.com',
            department: 'Computer Science',
            semester: 8,
            cgpa: 9.2,
            backlogs: 0,
            skills: [
              { name: 'Python', proficiency: 'expert' },
              { name: 'Machine Learning', proficiency: 'advanced' },
              { name: 'TensorFlow', proficiency: 'advanced' },
            ],
            projects: [
              { id: '1', title: 'NLP Chatbot', description: 'AI chatbot', technologies: ['Python', 'BERT'], isOngoing: false, startDate: '2024-02' },
            ],
            certifications: [],
            workExperience: [],
            preferredJobTypes: ['full-time', 'internship'],
            preferredLocations: ['Bangalore', 'Mumbai'],
            willingToRelocate: true,
            isProfileComplete: true,
            placementReadinessScore: 72,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...candidates];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.userName?.toLowerCase().includes(query) ||
        c.skills.some(s => s.name.toLowerCase().includes(query)) ||
        c.department?.toLowerCase().includes(query)
      );
    }

    // Skills
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(c =>
        selectedSkills.some(skill =>
          c.skills.some(s => s.name.toLowerCase() === skill.toLowerCase())
        )
      );
    }

    // Department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(c => c.department === departmentFilter);
    }

    // CGPA
    filtered = filtered.filter(c => c.cgpa >= minCgpa);

    // Experience
    if (experienceFilter === 'with') {
      filtered = filtered.filter(c => c.workExperience.length > 0);
    } else if (experienceFilter === 'without') {
      filtered = filtered.filter(c => c.workExperience.length === 0);
    }

    setFilteredCandidates(filtered);
  }, [candidates, searchQuery, selectedSkills, departmentFilter, minCgpa, experienceFilter]);

  const toggleShortlist = (id: string) => {
    const newShortlisted = new Set(shortlisted);
    if (newShortlisted.has(id)) {
      newShortlisted.delete(id);
      toast.success('Removed from shortlist');
    } else {
      newShortlisted.add(id);
      toast.success('Added to shortlist');
    }
    setShortlisted(newShortlisted);
  };

  const toggleSkillFilter = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const inviteToApply = (candidateId: string) => {
    toast.success('Invitation sent to candidate');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSkills([]);
    setDepartmentFilter('all');
    setMinCgpa(0);
    setExperienceFilter('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-foreground">Candidate Discovery</h1>
          <p className="text-muted-foreground mt-1">
            Find and shortlist top candidates for your positions
          </p>
        </div>
        <div className="flex gap-2">
          {shortlisted.size > 0 && (
            <Button variant="outline">
              <Heart className="w-4 h-4 mr-2 fill-red-500 text-red-500" />
              Shortlisted ({shortlisted.size})
            </Button>
          )}
          <Button variant="outline" onClick={() => setFilterDialogOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </motion.div>

      {/* Search and Quick Filters */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, skill, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Skill Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Popular skills:</span>
              {popularSkills.map(skill => (
                <Badge
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSkillFilter(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Active Filters */}
            {(selectedSkills.length > 0 || departmentFilter !== 'all' || minCgpa > 0) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {selectedSkills.map(skill => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button onClick={() => toggleSkillFilter(skill)} className="hover:text-destructive">×</button>
                  </Badge>
                ))}
                {departmentFilter !== 'all' && (
                  <Badge variant="secondary" className="gap-1">
                    {departmentFilter}
                    <button onClick={() => setDepartmentFilter('all')} className="hover:text-destructive">×</button>
                  </Badge>
                )}
                {minCgpa > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    CGPA ≥ {minCgpa}
                    <button onClick={() => setMinCgpa(0)} className="hover:text-destructive">×</button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Results Count */}
      <motion.div variants={item} className="text-sm text-muted-foreground">
        Found {filteredCandidates.length} candidates
      </motion.div>

      {/* Candidate Cards */}
      <motion.div variants={item} className="grid gap-4 lg:grid-cols-2">
        {filteredCandidates.length === 0 ? (
          <div className="col-span-2">
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">No candidates found</h3>
                <p className="text-muted-foreground text-center mt-1">
                  Try adjusting your filters to see more results
                </p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg">{candidate.userName || 'Student'}</h3>
                        <p className="text-sm text-muted-foreground">{candidate.department}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleShortlist(candidate.id)}
                        className={cn(
                          "shrink-0",
                          shortlisted.has(candidate.id) && "text-red-500"
                        )}
                      >
                        <Heart className={cn(
                          "w-5 h-5",
                          shortlisted.has(candidate.id) && "fill-current"
                        )} />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-4 h-4" />
                        CGPA: <strong className="text-foreground">{candidate.cgpa.toFixed(1)}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {candidate.workExperience.length} experience
                      </span>
                      <span className="flex items-center gap-1">
                        <Code className="w-4 h-4" />
                        {candidate.projects.length} projects
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {candidate.skills.slice(0, 5).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {skill.name}
                          {skill.proficiency === 'expert' && <Star className="w-3 h-3 ml-1 fill-yellow-500 text-yellow-500" />}
                        </Badge>
                      ))}
                      {candidate.skills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 5}
                        </Badge>
                      )}
                    </div>

                    {/* Location Preferences */}
                    <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {candidate.preferredLocations.slice(0, 2).join(', ')}
                        {candidate.willingToRelocate && ' • Open to relocate'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1" onClick={() => inviteToApply(candidate.id)}>
                        <Mail className="w-4 h-4 mr-1" />
                        Invite to Apply
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>

      {/* Advanced Filters Dialog */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>Fine-tune your candidate search</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Minimum CGPA: {minCgpa}</Label>
              <Slider
                value={[minCgpa]}
                onValueChange={([value]) => setMinCgpa(value)}
                max={10}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <Label>Work Experience</Label>
              <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="with">With Experience</SelectItem>
                  <SelectItem value="without">Freshers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={clearFilters}>Clear All</Button>
            <Button onClick={() => setFilterDialogOpen(false)}>Apply Filters</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
