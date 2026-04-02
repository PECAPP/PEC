'use client';

import { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  BookOpen, 
  Users,
  Search,
  Settings2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';

interface CourseManagementProps {
  initialCourses: Course[];
  user: any;
}

export function CourseManagement({ initialCourses, user }: CourseManagementProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = courses.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between pb-2">
         <div className="relative group/search flex-1 w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within/search:text-primary transition-colors" />
            <Input 
              placeholder="Search catalog by code, name, or department..." 
              className="h-12 pl-11 rounded-xl bg-card border-border/40 focus:border-primary/40 focus:ring-primary/10 transition-all font-bold placeholder:font-medium" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-3 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-xl px-6 font-bold text-[10px] uppercase tracking-widest border-border/60 hover:bg-muted/40 transition-all">
              <Download className="w-4 h-4 mr-2.5 opacity-60" /> Export Catalog
            </Button>
            <Button className="flex-1 md:flex-none h-12 rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest bg-primary shadow-glow hover:scale-[1.02] transition-all">
              <Plus className="w-4 h-4 mr-2.5" /> Add New Course
            </Button>
         </div>
      </div>

      <div className="card-elevated border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/20 bg-muted/20">
                <th className="text-left py-5 px-6 font-bold text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">Code</th>
                <th className="text-left py-5 px-6 font-bold text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">Curriculum Module</th>
                <th className="text-left py-5 px-6 font-bold text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">Institutional Unit</th>
                <th className="text-center py-5 px-6 font-bold text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">Semester</th>
                <th className="text-center py-5 px-6 font-bold text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">Capacity</th>
                <th className="text-right py-5 px-6 font-bold text-[10px] uppercase tracking-widest text-muted-foreground opacity-60">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {filtered.map((course) => (
                <tr key={course.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="py-5 px-6">
                    <Badge variant="outline" className="rounded-lg px-2.5 py-0.5 border-border/40 font-bold text-[10px] tracking-widest opacity-80 group-hover:border-primary/40 group-hover:text-primary transition-all">
                      {course.code}
                    </Badge>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors">{course.name}</span>
                       <span className="text-[10px] text-muted-foreground/60 italic font-medium">{course.credits} Credits</span>
                    </div>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                       <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{course.department}</span>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className="text-xs font-bold text-foreground/60">{course.semester}</span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                       <span className="text-xs font-bold text-foreground/80">{course.enrolledStudents} / {course.maxStudents}</span>
                       <div className="h-1 w-20 bg-muted/40 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              (course.enrolledStudents / course.maxStudents) >= 1 ? "bg-destructive" : "bg-primary"
                            )}
                            style={{ width: `${Math.min((course.enrolledStudents / course.maxStudents) * 100, 100)}%` }}
                          />
                       </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <div className="p-4 bg-muted/20 rounded-full"><FileText className="w-8 h-8 text-muted-foreground/40" /></div>
             <p className="text-sm font-medium text-muted-foreground italic">No matching academic records identified.</p>
          </div>
        )}
      </div>
    </div>
  );
}
