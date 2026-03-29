'use client';

import { motion } from 'framer-motion';
import { 
  Users as UsersIcon, 
  Search as SearchIcon,
  LayoutDashboard,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SearchResultsSkeleton } from '@/components/ui/skeletons';
import { useSearchPage } from '@/hooks/useSearchPage';

// Components
import { 
  UserCard, 
  PageCard, 
  SubjectCard 
} from './components/SearchResultCards';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Search() {
  const {
    searchTerm,
    setSearchTerm,
    loading,
    results,
    handleSearchSubmit,
    hasResults,
    initialQuery,
  } = useSearchPage();

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-card border-b border-border -mx-6 -mt-6 p-6 mb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Search Results</h1>
          <form onSubmit={handleSearchSubmit} className="relative">
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
        <SearchResultsSkeleton />
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto space-y-8"
        >
          {!hasResults ? (
            <div className="text-center py-12 text-muted-foreground">
              No results found for "{initialQuery}"
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
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
                        <PageCard key={page.path} page={page} />
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
                        <SubjectCard key={sub.id} subject={sub} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Users Section */}
                {results.users.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <UsersIcon className="w-5 h-5" /> People
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {results.users.slice(0, 6).map(user => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </div>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="people">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {results.users.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pages">
                <div className="grid gap-4 md:grid-cols-3">
                  {results.pages.map(page => (
                     <PageCard key={page.path} page={page} />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="subjects">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {results.subjects.map(sub => (
                     <SubjectCard key={sub.id} subject={sub} />
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
