import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search as SearchIcon, 
  Users, 
  Briefcase, 
  Calendar, 
  FileText, 
  ChevronRight,
  Loader2,
  Building2,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { searchableRoutes } from '@/utils/searchableRoutes';
import { LayoutDashboard } from 'lucide-react';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    users: [] as any[],
    jobs: [] as any[],
    drives: [] as any[],
    pages: [] as any[],
    subjects: [] as any[],
  });

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);

    try {
      // Parallel search across collections
      // Note: Firestore doesn't support full-text search natively without extensions like Algolia.
      // We'll use simple prefix matching or client-side filtering for this demo.
      // ideally we would use a dedicated search service.
      
      const usersRef = collection(db, 'users');
      const jobsRef = collection(db, 'jobs');
      const drivesRef = collection(db, 'placement_drives');

      const subjectsRef = collection(db, 'courses');

      // Basic query - specific improvements would need backend search engine
      const [usersSnap, jobsSnap, drivesSnap, subjectsSnap] = await Promise.all([
        getDocs(query(usersRef, limit(20))),
        getDocs(query(jobsRef, orderBy('postedAt', 'desc'), limit(20))),
        getDocs(query(drivesRef, orderBy('date', 'desc'), limit(20))),
        getDocs(query(subjectsRef, limit(20)))
      ]);

      const lowerTerm = term.toLowerCase();

      const filteredUsers = usersSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(u => u.fullName?.toLowerCase().includes(lowerTerm) || u.email?.toLowerCase().includes(lowerTerm));

      const filteredJobs = jobsSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(j => j.title?.toLowerCase().includes(lowerTerm) || j.companyName?.toLowerCase().includes(lowerTerm));
      
      const filteredDrives = drivesSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(d => d.companyName?.toLowerCase().includes(lowerTerm) || d.role?.toLowerCase().includes(lowerTerm));

      const filteredSubjects = subjectsSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .filter(c => c.name?.toLowerCase().includes(lowerTerm) || c.code?.toLowerCase().includes(lowerTerm));

      const filteredPages = searchableRoutes.filter(route => 
         route.title.toLowerCase().includes(lowerTerm) || 
         route.keywords.some(k => k.includes(lowerTerm))
      );

      setResults({
        users: filteredUsers,
        jobs: filteredJobs,
        drives: filteredDrives,
        pages: filteredPages,
        subjects: filteredSubjects,
      });

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-card border-b border-border -mx-6 -mt-6 p-6 mb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Search Results</h1>
          <form onSubmit={handleSearch} className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg bg-background"
              placeholder="Search explicitly across users, jobs, and drives..."
            />
            <Button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5">
              Search
            </Button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto space-y-8"
        >
          {(!results.users.length && !results.jobs.length && !results.drives.length && !results.pages.length && !results.subjects.length) ? (
            <div className="text-center py-12 text-muted-foreground">
              No results found for "{initialQuery}"
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6">
                <TabsTrigger 
                  value="all" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  All Results
                </TabsTrigger>
                <TabsTrigger 
                  value="people" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  People <Badge variant="secondary" className="ml-2">{results.users.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="jobs" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  Jobs <Badge variant="secondary" className="ml-2">{results.jobs.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="drives" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  Drives <Badge variant="secondary" className="ml-2">{results.drives.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="pages" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                   Pages <Badge variant="secondary" className="ml-2">{results.pages.length}</Badge>
                </TabsTrigger>
                <TabsTrigger 
                  value="subjects" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                   Courses <Badge variant="secondary" className="ml-2">{results.subjects.length}</Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                {/* Pages Section */}
                {results.pages.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <LayoutDashboard className="w-5 h-5" /> Pages
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                       {results.pages.slice(0, 6).map(page => (
                        <PageCard key={page.path} page={page} navigate={navigate} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Subjects Section */}
                {results.subjects.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <BookOpen className="w-5 h-5" /> Courses
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                       {results.subjects.slice(0, 4).map(sub => (
                        <SubjectCard key={sub.id} subject={sub} navigate={navigate} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Users Section */}
                {results.users.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <Users className="w-5 h-5" /> People
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {results.users.slice(0, 6).map(user => (
                        <UserCard key={user.id} user={user} navigate={navigate} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Jobs Section */}
                {results.jobs.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <Briefcase className="w-5 h-5" /> Jobs
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                       {results.jobs.slice(0, 4).map(job => (
                        <JobCard key={job.id} job={job} navigate={navigate} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Drives Section */}
                {results.drives.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <Calendar className="w-5 h-5" /> Placement Drives
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                       {results.drives.slice(0, 4).map(drive => (
                        <DriveCard key={drive.id} drive={drive} navigate={navigate} />
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="people">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.users.map(user => (
                    <UserCard key={user.id} user={user} navigate={navigate} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="jobs">
                <div className="grid gap-4 md:grid-cols-2">
                  {results.jobs.map(job => (
                    <JobCard key={job.id} job={job} navigate={navigate} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="drives">
                <div className="grid gap-4 md:grid-cols-2">
                  {results.drives.map(drive => (
                     <DriveCard key={drive.id} drive={drive} navigate={navigate} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pages">
                <div className="grid gap-4 md:grid-cols-3">
                  {results.pages.map(page => (
                     <PageCard key={page.path} page={page} navigate={navigate} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="subjects">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {results.subjects.map(sub => (
                     <SubjectCard key={sub.id} subject={sub} navigate={navigate} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      )}
    </div>
  );
}

function UserCard({ user, navigate }: { user: any, navigate: any }) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {user.fullName?.[0] || 'U'}
        </div>
        <div>
          <p className="font-medium text-foreground">{user.fullName}</p>
          <p className="text-xs text-muted-foreground">{user.role} • {user.department || 'General'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function JobCard({ job, navigate }: { job: any, navigate: any }) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/career`)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
             <h3 className="font-medium text-foreground">{job.title}</h3>
             <div className="flex items-center gap-1 text-sm text-muted-foreground">
               <Building2 className="w-3 h-3" /> {job.companyName}
             </div>
          </div>
          <Badge variant="outline">{job.type}</Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Posted {job.postedAt?.toDate ? job.postedAt.toDate().toLocaleDateString() : 'Recently'}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function DriveCard({ drive, navigate }: { drive: any, navigate: any }) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate(`/placements/drives`)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
           <div>
             <h3 className="font-medium text-foreground">{drive.companyName}</h3>
             <p className="text-sm text-primary">{drive.role}</p>
           </div>
           <Badge variant={drive.status === 'upcoming' ? 'default' : 'secondary'}>{drive.status}</Badge>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" /> 
          {drive.date?.toDate ? drive.date.toDate().toLocaleDateString() : 'TBD'}
          <span className="mx-1">•</span>
          {drive.venue}
        </div>
      </CardContent>
    </Card>
  );
}

function PageCard({ page, navigate }: { page: any, navigate: any }) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate(page.path)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-secondary group-hover:bg-primary/10 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          <page.icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{page.title}</h3>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
            {page.keywords?.join(', ')}
          </p>
        </div>
      </CardContent>
    </Card>

  );
}

function SubjectCard({ subject, navigate }: { subject: any, navigate: any }) {
  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => navigate(`/courses`)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
          {subject.code?.slice(0,2) || 'CS'}
        </div>
        <div>
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{subject.name}</h3>
          <p className="text-xs text-muted-foreground">
            {subject.code} • {subject.credits} Credits
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
