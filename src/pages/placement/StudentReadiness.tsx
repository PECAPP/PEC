import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  User,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  ChevronDown,
  MoreVertical,
  FileText,
  Building2,
  Briefcase,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { PlacementProfile } from '@/types';

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

interface StudentWithProfile extends PlacementProfile {
  userName?: string;
  userEmail?: string;
}

export default function StudentReadiness() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithProfile[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [readinessFilter, setReadinessFilter] = useState<string>('all');
  const [cgpaFilter, setCgpaFilter] = useState<string>('all');
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    ready: 0,
    needsWork: 0,
    notStarted: 0,
    avgReadiness: 0,
  });

  const departments = Array.from(
    new Set(students.map((student) => student.department).filter(Boolean))
  ).sort();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const profilesQuery = query(
          collection(({} as any), 'placementProfiles'),
          orderBy('placementReadinessScore', 'desc'),
          limit(100)
        );

        const snapshot = await getDocs(profilesQuery);
        const profiles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as StudentWithProfile[];

        setStudents(profiles);

        // Calculate stats
        const ready = profiles.filter(p => p.placementReadinessScore >= 70).length;
        const needsWork = profiles.filter(p => p.placementReadinessScore >= 30 && p.placementReadinessScore < 70).length;
        const notStarted = profiles.filter(p => p.placementReadinessScore < 30).length;
        const avgReadiness = profiles.length > 0 
          ? Math.round(profiles.reduce((sum, p) => sum + p.placementReadinessScore, 0) / profiles.length)
          : 0;

        setStats({
          total: profiles.length,
          ready,
          needsWork,
          notStarted,
          avgReadiness,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error loading students:', error);
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...students];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.enrollmentNumber?.toLowerCase().includes(query) ||
        s.userName?.toLowerCase().includes(query) ||
        s.userEmail?.toLowerCase().includes(query)
      );
    }

    // Department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(s => s.department === departmentFilter);
    }

    // Readiness
    if (readinessFilter === 'ready') {
      filtered = filtered.filter(s => s.placementReadinessScore >= 70);
    } else if (readinessFilter === 'needs-work') {
      filtered = filtered.filter(s => s.placementReadinessScore >= 30 && s.placementReadinessScore < 70);
    } else if (readinessFilter === 'not-started') {
      filtered = filtered.filter(s => s.placementReadinessScore < 30);
    }

    // CGPA
    if (cgpaFilter === '9+') {
      filtered = filtered.filter(s => s.cgpa >= 9);
    } else if (cgpaFilter === '8+') {
      filtered = filtered.filter(s => s.cgpa >= 8);
    } else if (cgpaFilter === '7+') {
      filtered = filtered.filter(s => s.cgpa >= 7);
    } else if (cgpaFilter === '6+') {
      filtered = filtered.filter(s => s.cgpa >= 6);
    }

    setFilteredStudents(filtered);
  }, [students, searchQuery, departmentFilter, readinessFilter, cgpaFilter]);

  const toggleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkAction = (action: 'email' | 'export' | 'assign') => {
    if (selectedStudents.size === 0) {
      toast.error('Please select at least one student');
      return;
    }
    
    switch (action) {
      case 'email':
        toast.success(`Sending reminder to ${selectedStudents.size} students`);
        break;
      case 'export':
        toast.success(`Exporting ${selectedStudents.size} student profiles`);
        break;
      case 'assign':
        toast.success(`Assigning ${selectedStudents.size} students to drive`);
        break;
    }
  };

  const getReadinessColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getReadinessLabel = (score: number) => {
    if (score >= 70) return 'Ready';
    if (score >= 30) return 'Needs Work';
    return 'Not Started';
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
          <h1 className="text-3xl font-bold text-foreground">Student Readiness</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage student placement readiness
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleBulkAction('export')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Placement Ready</p>
                <p className="text-2xl font-bold text-green-500">{stats.ready}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Needs Work</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.needsWork}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Not Started</p>
                <p className="text-2xl font-bold text-red-500">{stats.notStarted}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Readiness</p>
                <p className="text-2xl font-bold">{stats.avgReadiness}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or enrollment number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={readinessFilter} onValueChange={setReadinessFilter}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder="Readiness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ready">Ready (70%+)</SelectItem>
                  <SelectItem value="needs-work">Needs Work (30-70%)</SelectItem>
                  <SelectItem value="not-started">Not Started (&lt;30%)</SelectItem>
                </SelectContent>
              </Select>

              <Select value={cgpaFilter} onValueChange={setCgpaFilter}>
                <SelectTrigger className="w-full lg:w-36">
                  <SelectValue placeholder="CGPA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All CGPA</SelectItem>
                  <SelectItem value="9+">9+</SelectItem>
                  <SelectItem value="8+">8+</SelectItem>
                  <SelectItem value="7+">7+</SelectItem>
                  <SelectItem value="6+">6+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions */}
      {selectedStudents.size > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20"
        >
          <span className="text-sm font-medium">
            {selectedStudents.size} student{selectedStudents.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('email')}>
              <Mail className="w-4 h-4 mr-1" />
              Send Reminder
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('assign')}>
              <Briefcase className="w-4 h-4 mr-1" />
              Assign to Drive
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="ml-auto"
            onClick={() => setSelectedStudents(new Set())}
          >
            Clear Selection
          </Button>
        </motion.div>
      )}

      {/* Student Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Readiness</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="font-medium">No students found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="group">
                      <TableCell>
                        <Checkbox 
                          checked={selectedStudents.has(student.id)}
                          onCheckedChange={() => toggleSelect(student.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {(student as any).studentAvatar ? (
                              <img src={(student as any).studentAvatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{(student as any).studentName || student.userName || 'Student'}</p>
                            <p className="text-sm text-muted-foreground">{student.enrollmentNumber}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.department || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          student.cgpa >= 8 ? "text-green-500" :
                          student.cgpa >= 7 ? "text-yellow-500" : "text-muted-foreground"
                        )}>
                          {student.cgpa?.toFixed(2) || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {student.skills?.slice(0, 3).map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill.name}
                            </Badge>
                          ))}
                          {(student.skills?.length || 0) > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.skills!.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{student.projects?.length || 0}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={student.placementReadinessScore} 
                            className="w-20 h-2" 
                          />
                          <span className={cn(
                            "text-sm font-medium",
                            getReadinessColor(student.placementReadinessScore)
                          )}>
                            {student.placementReadinessScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <User className="w-4 h-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              View Resume
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary */}
      <motion.div variants={item} className="text-sm text-muted-foreground text-center">
        Showing {filteredStudents.length} of {students.length} students
      </motion.div>
    </motion.div>
  );
}
